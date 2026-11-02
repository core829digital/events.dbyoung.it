import { ConvexError } from "convex/values";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, requireSession, requireServer } from "./secure";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Prenotazioni + ticket con codice QR.
 * - reserveSeats: da server Next (sessione utente valida + role client/admin).
 *   Attenzione: la capacity rimane occupata finché il pending non scade (45min)
 *   o viene pagato/cancellato. Operazione ATOMICA (transaction conv).
 * - markPaid/createTickets: SOLO dal webhook Stripe Next (requireServer).
 * - userBookings: sessione utente → solo i propri booking.
 * - adminBookingsByEvent: admin|founder → tutti i booking con ticket.
 */

const PENDING_GRACE_MS = 45 * 60 * 1000;

/** Liberiamo pending scaduti ATOMICAMENTE prima del check di capacità. */
async function cleanStalePending(ctx: MutationCtx, eventId: Id<"events">) {
  const now = Date.now();
  const all = await ctx.db
    .query("bookings")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect();
  for (const b of all) {
    if (b.status === "pending" && now - b.createdAt > PENDING_GRACE_MS) {
      await ctx.db.patch(b._id, { status: "cancelled", cancelledAt: now });
    }
  }
}

async function seatsTaken(ctx: MutationCtx, eventId: Id<"events">): Promise<number> {
  await cleanStalePending(ctx, eventId);
  const bookings = await ctx.db
    .query("bookings")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect();
  return bookings
    .filter((b) => b.status === "paid" || b.status === "pending")
    .reduce((acc, b) => acc + b.quantity, 0);
}

const ATTENDEE = v.object({
  name: v.string(),
  surname: v.string(),
  dob: v.string(),
  cf: v.string(),
});

/**
 * Riserva posti per un evento (sessione utente valida).
 * Ritorna l'id booking. Ritorna 409 se posti finiti.
 */
export const reserveSeats = mutation({
  args: {
    tokenHash: v.string(),
    eventId: v.id("events"),
    quantity: v.number(),
    attendees: v.array(ATTENDEE),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    lang: v.union(v.literal("it"), v.literal("en")),
    amountCents: v.number(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireSession(ctx, args.tokenHash);
    if (args.quantity !== args.attendees.length) throw new ConvexError("422 attendees");
    if (args.quantity < 1 || args.quantity > 20) throw new ConvexError("422 quantity");
    if (args.amountCents < 0 || args.amountCents > 20000000) throw new ConvexError("422 amount");
    const now = Date.now();
    const ev = await ctx.db.get(args.eventId);
    if (!ev || !ev.published) throw new ConvexError("404 event");
    if (ev.startAt < now) throw new ConvexError("409 closed");
    const taken = await seatsTaken(ctx, args.eventId);
    if (ev.capacity - taken < args.quantity) throw new ConvexError("409 full");
    const id = await ctx.db.insert("bookings", {
      eventId: args.eventId,
      userId: user._id,
      quantity: args.quantity,
      attendees: args.attendees,
      contactName: args.contactName,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      lang: args.lang,
      amountCents: args.amountCents,
      currency: "eur",
      status: "pending",
      createdAt: now,
    });
    return id;
  },
});

/**
 * Webhook Stripe: registra payment e crea tickets con codice QR + firma HMAC.
 * Il server Next genera il codice casuale (crypto) e la firma HMAC del payload.
 */
export const markPaidAndCreateTickets = mutation({
  args: {
    srvKey: v.string(),
    sessionId: v.string(),
    paymentIntentId: v.optional(v.string()),
    paidAt: v.number(),
    tickets: v.array(
      v.object({
        name: v.string(),
        surname: v.string(),
        dob: v.string(),
        cf: v.string(),
        code: v.string(),
        sig: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireServer(ctx, args.srvKey);
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_stripe_session", (q) => q.eq("stripeSessionId", args.sessionId))
      .unique();
    if (!booking) throw new ConvexError("404 booking");
    if (booking.status === "paid") return { bookingId: booking._id, duplicate: true };
    const now = args.paidAt;
    await ctx.db.patch(booking._id, { status: "paid", paidAt: now });
    for (let i = 0; i < args.tickets.length; i++) {
      const p = args.tickets[i];
      await ctx.db.insert("tickets", {
        bookingId: booking._id,
        eventId: booking.eventId,
        personIndex: i,
        name: p.name,
        surname: p.surname,
        dob: p.dob,
        cf: p.cf,
        code: p.code,
        sig: p.sig,
        paymentIntentId: args.paymentIntentId,
        status: "valid",
      });
    }
    return { bookingId: booking._id, duplicate: false };
  },
});

/** Collega la Stripe Checkout Session (requireServer, dal server Next). */
export const setStripeSession = mutation({
  args: { srvKey: v.string(), bookingId: v.id("bookings"), sessionId: v.string() },
  handler: async (ctx, { srvKey, bookingId, sessionId }) => {
    await requireServer(ctx, srvKey);
    const b = await ctx.db.get(bookingId);
    if (!b) throw new ConvexError("404");
    if (b.status !== "pending") throw new ConvexError("409 status");
    await ctx.db.patch(bookingId, { stripeSessionId: sessionId });
    return b._id;
  },
});

/** Sessione Stripe scaduta: libero i posti (chiamato dal webhook). */
export const markCancelledBySession = mutation({
  args: { srvKey: v.string(), sessionId: v.string() },
  handler: async (ctx, { srvKey, sessionId }) => {
    await requireServer(ctx, srvKey);
    const b = await ctx.db
      .query("bookings")
      .withIndex("by_stripe_session", (q) => q.eq("stripeSessionId", sessionId))
      .unique();
    if (!b) return null;
    if (b.status === "pending") {
      await ctx.db.patch(b._id, { status: "cancelled", cancelledAt: Date.now() });
    }
    return b._id;
  },
});

/** Prenotazione non pagata: utente la annulla liberamente. */
export const cancelPending = mutation({
  args: { tokenHash: v.string(), bookingId: v.id("bookings") },
  handler: async (ctx, { tokenHash, bookingId }) => {
    const { user } = await requireSession(ctx, tokenHash);
    const b = await ctx.db.get(bookingId);
    if (!b) throw new ConvexError("404");
    if (b.userId !== user._id) throw new ConvexError("403 other");
    if (b.status !== "pending") throw new ConvexError("409 status");
    await ctx.db.patch(bookingId, { status: "cancelled", cancelledAt: Date.now() });
  },
});

/** Resoconto per l'account client: solo i booking dell'utente. */
export const userBookings = query({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) => {
    const { user } = await requireSession(ctx, tokenHash);
    const all = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const now = Date.now();
    const out: Array<{
      booking: Doc<"bookings">;
      event: Doc<"events"> | null;
      tickets: Doc<"tickets">[];
      now: number;
      canReview: boolean;
      alreadyReviewed: boolean;
    }> = [];
    for (const b of [...all].sort((a, b) => a.createdAt - b.createdAt)) {
      const event = await ctx.db.get(b.eventId);
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_booking", (q) => q.eq("bookingId", b._id))
        .collect();
      const rev = await ctx.db
        .query("reviews")
        .withIndex("by_booking", (q) => q.eq("bookingId", b._id))
        .unique();
      out.push({
        booking: b,
        event,
        tickets,
        now, // snapshot server: evita Date.now() nel render
        canReview: b.status === "paid" && !!event && event.endAt < now && !rev,
        alreadyReviewed: !!rev,
      });
    }
    return out;
  },
});

/** Tabellone backoffice: tutti i booking di un evento (admin|founder). */
export const adminBookingsByEvent = query({
  args: { tokenHash: v.string(), eventId: v.id("events") },
  handler: async (ctx, { tokenHash, eventId }) => {
    await requireRole(ctx, tokenHash, ["admin", "founder"]);
    const now = Date.now();
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    const out = [];
    for (const b of bookings.sort((a, b) => a.createdAt - b.createdAt)) {
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_booking", (q) => q.eq("bookingId", b._id))
        .collect();
      out.push({ booking: b, tickets, now });
    }
    return out;
  },
});

/** Statistiche per evento (dashboard backoffice). */
export const eventTotals = query({
  args: { tokenHash: v.string(), eventId: v.id("events") },
  handler: async (ctx, { tokenHash, eventId }) => {
    await requireRole(ctx, tokenHash, ["admin", "founder"]);
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    const now = Date.now();
    return {
      pending: bookings.filter((b) => b.status === "pending" && now - b.createdAt < PENDING_GRACE_MS).length,
      paid: bookings.filter((b) => b.status === "paid").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      total: bookings.reduce((acc, b) => acc + b.quantity, 0),
    };
  },
});
