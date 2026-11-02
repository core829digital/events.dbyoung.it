import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, requireSession } from "./secure";

/**
 * Recensioni: 1 prenotazione pagata a evento concluso = 1 voto (1-5 stelle).
 * Modificabile dall'autore fino a una seconda visita? No: una sola invio.
 *
 * `publicEventReviews` (convex/events.ts) per la lista pubblica.
 */

export const submit = mutation({
  args: {
    tokenHash: v.string(),
    bookingId: v.id("bookings"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, { tokenHash, bookingId, rating, comment }) => {
    const { user } = await requireSession(ctx, tokenHash);
    const booking = await ctx.db.get(bookingId);
    if (!booking) throw new ConvexError("404 booking");
    if (booking.userId !== user._id) throw new ConvexError("403 other");
    if (booking.status !== "paid") throw new ConvexError("409 not-paid");
    const ev = await ctx.db.get(booking.eventId);
    if (!ev || ev.endAt > Date.now()) throw new ConvexError("409 event-not-ended");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ConvexError("422 rating");
    const cleanComment = comment ? comment.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 500) : undefined;
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_booking", (q) => q.eq("bookingId", bookingId))
      .unique();
    if (existing) throw new ConvexError("409 reviewed");
    await ctx.db.insert("reviews", {
      eventId: booking.eventId,
      bookingId,
      userId: user._id,
      rating,
      comment: cleanComment,
      createdAt: Date.now(),
    });
  },
});

/** Lista visibile nel backoffice evento (anonima: solo voto + testo). */
export const adminEventReviews = query({
  args: { tokenHash: v.string(), eventId: v.id("events") },
  handler: async (ctx, { tokenHash, eventId }) => {
    await requireRole(ctx, tokenHash, ["admin", "founder"]);
    const all = await ctx.db
      .query("reviews")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    const sorted = all.sort((a, b) => b.createdAt - a.createdAt);
    const avg = sorted.length ? sorted.reduce((acc, r) => acc + r.rating, 0) / sorted.length : 0;
    return {
      count: sorted.length,
      avg: Math.round(avg * 10) / 10,
      items: sorted.map((r) => ({ rating: r.rating, comment: r.comment, createdAt: r.createdAt })),
    };
  },
});
