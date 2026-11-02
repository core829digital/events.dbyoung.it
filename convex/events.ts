import { ConvexError } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, requireServer } from "./secure";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Eventi prenotabili creati da Dimitri/founder.
 * Le viste pubbliche mostrano solo eventi pubblicati e futuri + posti
 * disponibili (somma quantity di booking pagati + pendings nel periodo di
 * grazia — i pendings scaduti NON vengono scritti da una query, la pulizia
 * avviene dentro la mutation reserveSeats).
 */

const PENDING_GRACE_MS = 45 * 60 * 1000;

/** Posti occupati (pagati + pendings dentro la finestra di grazia). */
async function seatsTaken(ctx: QueryCtx | MutationCtx, eventId: Id<"events">): Promise<number> {
  const now = Date.now();
  const bookings = await ctx.db
    .query("bookings")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect();
  return bookings
    .filter(
      (b) =>
        b.status === "paid" ||
        (b.status === "pending" && now - b.createdAt < PENDING_GRACE_MS),
    )
    .reduce((acc, b) => acc + b.quantity, 0);
}

/** Libera i pendings scaduti (SOLO in contesto mutation). */
async function cleanStalePending(ctx: MutationCtx, eventId: Id<"events">) {
  const now = Date.now();
  const bookings = await ctx.db
    .query("bookings")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect();
  for (const b of bookings) {
    if (b.status === "pending" && now - b.createdAt > PENDING_GRACE_MS) {
      await ctx.db.patch(b._id, { status: "cancelled", cancelledAt: now });
    }
  }
}

export function publicView(ev: Doc<"events">, taken: number) {
  return {
    _id: ev._id,
    slug: ev.slug,
    title: ev.title,
    tagline: ev.tagline,
    description: ev.description,
    image: ev.image,
    startAt: ev.startAt,
    endAt: ev.endAt,
    capacity: ev.capacity,
    remaining: Math.max(0, ev.capacity - taken),
    locationNote: ev.locationNote,
  };
}

/** Lista eventi pubblicati e futuri (pubblica, senza dati personali). */
export const publicUpcoming = query({
  args: {},
  handler: async (ctx) => {
    try {
      const now = Date.now();
      const listed = await ctx.db
        .query("events")
        .withIndex("by_start", (q) => q.gt("startAt", now))
        .collect();
      const future = listed.filter((e) => e.published && e.startAt > now);
      const withSeats = await Promise.all(
        future.map(async (e) => publicView(e, await seatsTaken(ctx, e._id))),
      );
      withSeats.sort((a, b) => a.startAt - b.startAt);
      return withSeats;
    } catch {
      return [];
    }
  },
});

/** Dettaglio pubblico di un evento pubblicato (con posti residui), per slug. */
export const publicEvent = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    try {
      const ev = await ctx.db
        .query("events")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!ev || !ev.published) return null;
      const taken = await seatsTaken(ctx, ev._id);
      return { ...publicView(ev, taken), pricePerPerson: ev.pricePerPerson };
    } catch {
      return null;
    }
  },
});

/** Dettaglio pubblico per id (per il flusso di prenotazione). */
export const publicEventById = query({
  args: { id: v.id("events") },
  handler: async (ctx, { id }) => {
    try {
      const ev = await ctx.db.get(id);
      if (!ev || !ev.published) return null;
      const taken = await seatsTaken(ctx, ev._id);
      const view = publicView(ev, taken);
      return { ...view, pricePerPerson: ev.pricePerPerson };
    } catch {
      return null;
    }
  },
});

/** Recensioni recenti di un evento pubblicato (solo voto + testo). */
export const publicEventReviews = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    try {
      const all = await ctx.db
        .query("reviews")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .collect();
      return all
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 20)
        .map((r) => ({ rating: r.rating, comment: r.comment, createdAt: r.createdAt }));
    } catch {
      return [];
    }
  },
});

/** Lista admin di TUTTI gli eventi (anche passati/bozze). */
export const adminList = query({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) => {
    await requireRole(ctx, tokenHash, ["admin", "founder"]);
    const all = await ctx.db.query("events").collect();
    const now = Date.now();
    const out = [];
    for (const e of all.sort((a, b) => a.startAt - b.startAt)) {
      const taken = await seatsTaken(ctx, e._id);
      out.push({
        _id: e._id,
        slug: e.slug,
        title: e.title,
        tagline: e.tagline,
        description: e.description,
        image: e.image,
        startAt: e.startAt,
        endAt: e.endAt,
        capacity: e.capacity,
        pricePerPerson: e.pricePerPerson,
        published: e.published,
        locationNote: e.locationNote,
        remaining: Math.max(0, e.capacity - taken),
        isPast: e.endAt < now,
      });
    }
    return out;
  },
});

/** Dettaglio admin (con posti occupati). */
export const adminEvent = query({
  args: { tokenHash: v.string(), eventId: v.id("events") },
  handler: async (ctx, { tokenHash, eventId }) => {
    await requireRole(ctx, tokenHash, ["admin", "founder"]);
    const ev = await ctx.db.get(eventId);
    if (!ev) return null;
    const taken = await seatsTaken(ctx, eventId);
    return { ...publicView(ev, taken), pricePerPerson: ev.pricePerPerson, published: ev.published, taken, isPast: ev.endAt < Date.now() };
  },
});

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Crea o modifica un evento. Role admin|founder.
 * Allowlist: slug [a-z0-9-], capacità 1..2000, prezzo 0..100000 EUR.
 */
export const upsert = mutation({
  args: {
    tokenHash: v.string(),
      id: v.optional(v.id("events")),
    slug: v.string(),
    title: v.string(),
    tagline: v.string(),
    description: v.string(),
    image: v.string(),
    startAt: v.number(),
    endAt: v.number(),
    capacity: v.number(),
    pricePerPerson: v.number(),
    locationNote: v.string(),
    published: v.boolean(),
  },
  handler: async (ctx, a) => {
    const { user } = await requireRole(ctx, a.tokenHash, ["admin", "founder"]);
    const now = Date.now();
    if (!SLUG_RE.test(a.slug)) throw new ConvexError("422 slug");
    if (a.title.trim().length < 3 || a.title.length > 120) throw new ConvexError("422 title");
    if (a.capacity < 1 || a.capacity > 2000) throw new ConvexError("422 capacity");
    if (a.pricePerPerson < 0 || a.pricePerPerson > 100000) throw new ConvexError("422 price");
    if (a.endAt <= a.startAt) throw new ConvexError("422 dates");
    if (a.startAt < now - 24 * 3600 * 1000) throw new ConvexError("422 start-in-past");
    if (!/^\/location\/[\w-]+\.jpg$/.test(a.image)) throw new ConvexError("422 image");

    // slug univoco (escludendo se stesso in caso di editing)
    const sameSlug = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", a.slug))
      .unique();
    if (sameSlug && sameSlug._id !== a.id) throw new ConvexError("409 slug");

    if (a.id) {
      const ev = await ctx.db.get(a.id);
      if (!ev) throw new ConvexError("404");
      await ctx.db.patch(a.id, {
        slug: a.slug,
        title: a.title,
        tagline: a.tagline,
        description: a.description,
        image: a.image,
        startAt: a.startAt,
        endAt: a.endAt,
        capacity: a.capacity,
        pricePerPerson: a.pricePerPerson,
        locationNote: a.locationNote,
        published: a.published,
        updatedAt: now,
      });
      return a.id;
    }
    return ctx.db.insert("events", {
      slug: a.slug,
      title: a.title,
      tagline: a.tagline,
      description: a.description,
      image: a.image,
      kind: "dimitri" as const,
      startAt: a.startAt,
      endAt: a.endAt,
      capacity: a.capacity,
      pricePerPerson: a.pricePerPerson,
      locationNote: a.locationNote,
      published: a.published,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Pubblica/annulla pubblicazione. admin|founder. */
export const setPublished = mutation({
  args: { tokenHash: v.string(), id: v.id("events"), published: v.boolean() },
  handler: async (ctx, { tokenHash, id, published }) => {
    await requireRole(ctx, tokenHash, ["admin", "founder"]);
    const ev = await ctx.db.get(id);
    if (!ev) throw new ConvexError("404");
    await ctx.db.patch(id, { published, updatedAt: Date.now() });
  },
});

/** Elimina evento: solo founder, e solo senza booking pagati. */
export const remove = mutation({
  args: { tokenHash: v.string(), srvKey: v.string(), id: v.id("events") },
  handler: async (ctx, { tokenHash, srvKey, id }) => {
    await requireRole(ctx, tokenHash, ["founder"]);
    await requireServer(ctx, srvKey);
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_event", (q) => q.eq("eventId", id))
      .collect();
    if (bookings.some((b) => b.status === "paid")) throw new ConvexError("409 paid");
    for (const b of bookings) await ctx.db.delete(b._id);
    await ctx.db.delete(id);
  },
});

/** Statistiche dashboard backoffice (admin|founder). */
export const adminStats = query({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) => {
    await requireRole(ctx, tokenHash, ["admin", "founder"]);
    const now = Date.now();
    const events = await ctx.db.query("events").collect();
    const bookings = await ctx.db.query("bookings").collect();
    const tickets = await ctx.db.query("tickets").collect();
    const paid = bookings.filter((b) => b.status === "paid");
    const revenueCents = paid.reduce((acc, b) => acc + b.amountCents, 0);
    return {
      upcomingCount: events.filter((e) => e.published && e.startAt > now).length,
      publishedCount: events.filter((e) => e.published).length,
      draftCount: events.filter((e) => !e.published).length,
      paidBookings: paid.length,
      checkedInTickets: tickets.filter((t) => t.status === "checkedIn").length,
      revenueEur: Math.round(revenueCents / 100),
    };
  },
});
