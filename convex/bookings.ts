import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("events").collect(),
});

export const createBooking = mutation({
  args: {
    kind: v.union(v.literal("dimitri"), v.literal("terzi")),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    guests: v.number(),
    eventSlug: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("bookings", { ...args, status: "new", createdAt: Date.now() });
  },
});
