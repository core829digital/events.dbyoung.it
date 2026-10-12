import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    slug: v.string(),
    kind: v.union(v.literal("dimitri"), v.literal("terzi")),
    title: v.string(),
    tagline: v.string(),
    description: v.string(),
    image: v.string(),
    capacity: v.string(),
    music: v.string(),
    priceFrom: v.string(),
    published: v.boolean(),
  }).index("by_slug", ["slug"]),

  bookings: defineTable({
    kind: v.union(v.literal("dimitri"), v.literal("terzi")),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    guests: v.number(),
    eventSlug: v.optional(v.string()),
    message: v.string(),
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("confirmed"), v.literal("archived")),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  gallery: defineTable({
    src: v.string(),
    alt: v.string(),
    credit: v.string(),
    order: v.number(),
  }),
});
