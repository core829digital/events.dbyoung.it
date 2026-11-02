import { ConvexError } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, requireServer } from "./secure";
import type { Id } from "./_generated/dataModel";

/** Info minima ticket per l'endpoint QR (requireServer): esiste, è pagato? */
export const paidByCode = query({
  args: { srvKey: v.string(), code: v.string() },
  handler: async (ctx, { srvKey, code }) => {
    await requireServer(ctx, srvKey);
    const t = await ctx.db
      .query("tickets")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!t) return null;
    const booking = await ctx.db.get(t.bookingId);
    if (!booking || booking.status !== "paid") return null;
    const ev = await ctx.db.get(t.eventId);
    return { code, eventId: t.eventId, title: ev?.title ?? "" };
  },
});

/** Tutti i dati per l'email post-pagamento (webhook Next; requireServer). */
export const paidBookingBundle = query({
  args: { srvKey: v.string(), sessionId: v.string() },
  handler: async (ctx, { srvKey, sessionId }) => {
    await requireServer(ctx, srvKey);
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_stripe_session", (q) => q.eq("stripeSessionId", sessionId))
      .unique();
    if (!booking) return null;
    const event = await ctx.db.get(booking.eventId);
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_booking", (q) => q.eq("bookingId", booking._id))
      .collect();
    return { booking, event, tickets };
  },
});

/**
 * Check-in ingresso evento via QR.
 * La validità del payload (HMAC) è verificata LATO SERVER Next prima di
 * arrivare qui: Convex controlla comunque ruolo admin|founder + stato ticket.
 */
export const checkIn = mutation({
  args: {
    tokenHash: v.string(),
    eventId: v.id("events"),
    code: v.string(),
  },
  handler: async (ctx, { tokenHash, eventId, code }) => {
    const { user } = await requireRole(ctx, tokenHash, ["admin", "founder"]);
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!ticket) throw new ConvexError("404 ticket");
    if (ticket.eventId !== eventId) throw new ConvexError("409 wrong-event");
    if (ticket.status === "checkedIn") throw new ConvexError("409 already");
    await ctx.db.patch(ticket._id, {
      status: "checkedIn",
      checkedInAt: Date.now(),
      checkedByUserId: user._id,
    });
    return {
      name: ticket.name,
      surname: ticket.surname,
      personIndex: ticket.personIndex,
    };
  },
});

/** Conteggio presenze per evento (dashboard backoffice). */
export const eventCheckInStats = query({
  args: { tokenHash: v.string(), eventId: v.id("events") },
  handler: async (ctx, { tokenHash, eventId }) => {
    await requireRole(ctx, tokenHash, ["admin", "founder"]);
    void eventId;
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    return {
      total: tickets.length,
      checkedIn: tickets.filter((t) => t.status === "checkedIn").length,
    };
  },
});
