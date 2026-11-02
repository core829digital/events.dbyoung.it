import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ─── Utenti ────────────────────────────────────────────────────────────────
// ruoli: client | admin (delegato da founder) | founder (solo Dimitri)
export default defineSchema({
  users: defineTable({
    email: v.string(), // lowercase, unique
    passwordHash: v.string(), // scrypt, formato s2$iter$salt$hash (mai chiaro)
    name: v.string(),
    surname: v.string(),
    role: v.union(v.literal("client"), v.literal("admin"), v.literal("founder")),
    status: v.union(v.literal("active"), v.literal("suspended")),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    tokenHash: v.string(), // sha256 hex del token nel cookie httpOnly, unique
    userId: v.id("users"),
    expiresAt: v.number(),
    createdAt: v.number(),
    ipHash: v.optional(v.string()),
  })
    .index("by_token", ["tokenHash"])
    .index("by_user", ["userId"]),

  // ─── Eventi prenotabili creati da Dimitri/founder nel backoffice ──────────
  events: defineTable({
    slug: v.string(), // unique, make-event pro
    title: v.string(),
    tagline: v.string(),
    description: v.string(),
    image: v.string(),
    kind: v.literal("dimitri"),
    startAt: v.number(), // ms epoca, quando si apre
    endAt: v.number(), // ms epoca, fine evento (per i feedback)
    capacity: v.number(), // posti massimi (persone)
    pricePerPerson: v.number(), // importo per persona in euro (intero)
    locationNote: v.string(),
    published: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_start", ["startAt"])
    .index("by_created", ["createdAt"]),

  // ─── Prenotazioni (checkout Stripe) ──────────────────────────────────────
  bookings: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    quantity: v.number(),
    attendees: v.array(
      v.object({
        name: v.string(),
        surname: v.string(),
        dob: v.string(), // ISO yyyy-mm-dd
        cf: v.string(), // Codice Fiscale (validate con by-side route anche)
      }),
    ),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    lang: v.union(v.literal("it"), v.literal("en")),
    amountCents: v.number(),
    currency: v.literal("eur"),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled")),
    stripeSessionId: v.optional(v.string()),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_stripe_session", ["stripeSessionId"])
    .index("by_created", ["createdAt"]),

  // ─── Ticket individuali con QR ──────────────────────────────────────────
  tickets: defineTable({
    bookingId: v.id("bookings"),
    eventId: v.id("events"),
    personIndex: v.number(),
    name: v.string(),
    surname: v.string(),
    dob: v.string(),
    cf: v.string(),
    code: v.string(), // codice casuale crittograficamente forte, unique
    paymentIntentId: v.optional(v.string()),
    sig: v.string(), // HMAC del payload → QR falsificabile solo col secret lato server
    status: v.union(v.literal("valid"), v.literal("checkedIn")),
    checkedInAt: v.optional(v.number()),
    checkedByUserId: v.optional(v.id("users")),
  })
    .index("by_code", ["code"])
    .index("by_event", ["eventId"])
    .index("by_booking", ["bookingId"]),

  // ─── Recensioni 1–5 stelle, solo a evento finito, 1 per booking ─────────
  reviews: defineTable({
    eventId: v.id("events"),
    bookingId: v.id("bookings"),
    userId: v.id("users"),
    rating: v.number(), // 1..5
    comment: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_booking", ["bookingId"]),
});
