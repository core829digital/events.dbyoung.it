"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ConvexError } from "convex/values";
import Stripe from "stripe";
import { api } from "@/convex/_generated/api";
import { asId, convex, srvKey } from "@/lib/server/convex";
import { getSessionUser, readTokenHash } from "@/lib/server/session";
import { rateLimit, clientIp, hashIp } from "@/lib/server/rate-limit";
import { sendBookingConfirmation } from "@/lib/server/email";
import { randomCode, signTicketCode } from "@/lib/crypto";
import { bookingSchema, reviewSchema } from "@/lib/validators";

export type BookingFormState = { error?: string };
export type ReviewFormState = { error?: string };

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");
}

/**
 * Crea la prenotazione (posti riservati) e:
 * - con chiavi Stripe â†’ crea la Checkout Session e ritorna l'URL (redirect)
 * - senza chiavi (sviluppo) â†’ simula il webhook, stesso percorso del codice:
 *   markPaid + ticket firmati + email (log in dev).
 * Validation server-side: allowlist in lib/validators.ts; mai chiamate
 * dirette al client Convex.
 */
export async function createBookingAction(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Effettua l'accesso per prenotare." };

  const ip = await clientIp();
  if (!rateLimit("booking", hashIp(ip)).ok) {
    return { error: "Troppe richieste in poco tempo, riprova piÃ¹ tardi." };
  }

  let attendees: unknown;
  try {
    attendees = JSON.parse(String(formData.get("attendees") ?? "[]")) as unknown;
  } catch {
    return { error: "Dati ospiti non validi." };
  }

  const parsed = bookingSchema.safeParse({
    eventId: String(formData.get("eventId") ?? ""),
    quantity: Number(formData.get("quantity") ?? 0),
    attendees,
    contactName: String(formData.get("contactName") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    contactPhone: String(formData.get("contactPhone") ?? ""),
    lang: String(formData.get("lang") ?? "it"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  const input = parsed.data;

  // Evento pubblico e futuro (query pubblica: niente dati personali)
  const ev = await convex().query(api.events.publicEventById, {
    id: asId("events", input.eventId),
  });
  if (!ev || ev.remaining < input.quantity) return { error: "Posti non piÃ¹ disponibili." };
  const amountCents = Math.round(ev.pricePerPerson * 100) * input.quantity;

  const tokenHash = await readTokenHash();
  if (!tokenHash) return { error: "Sessione scaduta, accedi di nuovo." };

  let bookingId: string;
  try {
    bookingId = String(
      await convex().mutation(api.bookings.reserveSeats, {
        tokenHash,
        eventId: asId("events", input.eventId),
        quantity: input.quantity,
        attendees: input.attendees,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        lang: input.lang,
        amountCents,
      }),
    );
  } catch (e) {
    const msg = e instanceof ConvexError ? String(e.message) : "";
    if (msg === "409 full") return { error: "Posti esauriti." };
    if (msg === "409 closed") return { error: "Prenotazioni chiuse per questo evento." };
    return { error: "Prenotazione non riuscita, riprova." };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (secretKey) {
    try {
      const stripe = new Stripe(secretKey);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            quantity: input.quantity,
            price_data: {
              currency: "eur",
              unit_amount: Math.round(ev.pricePerPerson * 100),
              product_data: { name: ev.title },
            },
          },
        ],
        metadata: { bookingId },
        customer_email: input.contactEmail,
        success_url: `${siteUrl()}/account?booking=${bookingId}`,
        cancel_url: `${siteUrl()}/eventi/${ev.slug}?annullato=1`,
        locale: input.lang === "en" ? "en" : "it",
        automatic_tax: { enabled: true },
      });
      if (!session.url) return { error: "Pagamento momentaneamente non disponibile." };
      await convex().mutation(api.bookings.setStripeSession, {
        srvKey: srvKey(),
        bookingId: asId("bookings", bookingId),
        sessionId: session.id,
      });
      redirect(session.url); // Stripe Checkout (hosted)
    } catch (e) {
      // liberare i posti riservati se il checkout non parte
      await convex().mutation(api.bookings.cancelPending, {
        tokenHash,
        bookingId: asId("bookings", bookingId),
      }).catch(() => undefined);
      if (e instanceof ConvexError || !(e instanceof Stripe.errors.StripeError)) {
        return { error: "Pagamento momentaneamente non disponibile, riprova." };
      }
      throw e;
    }
    return {}; // unreachable (redirect) ma tsc lo esige
  }

  // â”€â”€â”€ DEV (senza chiavi Stripe): stesso percorso del webhook Stripe â”€â”€â”€â”€â”€â”€â”€â”€
  const devSessionId = `dev:${bookingId}`;
  const tickets = input.attendees.map((p) => {
    const code = randomCode(24);
    return { ...p, code, sig: signTicketCode(code) };
  });
  await convex().mutation(api.bookings.setStripeSession, {
    srvKey: srvKey(),
    bookingId: asId("bookings", bookingId),
    sessionId: devSessionId,
  });
  await convex().mutation(api.bookings.markPaidAndCreateTickets, {
    srvKey: srvKey(),
    sessionId: devSessionId,
    paidAt: Date.now(),
    tickets,
  });
  await sendBookingConfirmation({
    email: input.contactEmail,
    lang: input.lang,
    contactName: input.contactName,
    eventTitle: ev.title,
    eventStartAt: ev.startAt,
    quantity: input.quantity,
    amountCents,
    tickets: tickets.map((p) => ({ name: p.name, surname: p.surname, code: p.code })),
  });
  await revalidatePath("/account");
  redirect("/account?dev=1");
}

/** Recensione: 1 prenotazione pagata + evento concluso = 1 voto. */
export async function reviewSubmitAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Effettua l'accesso." };

  const ip = await clientIp();
  if (!rateLimit("review", hashIp(ip)).ok) return { error: "Troppe richieste, riprova piÃ¹ tardi." };

  const parsed = reviewSchema.safeParse({
    bookingId: String(formData.get("bookingId") ?? ""),
    rating: Number(formData.get("rating") ?? 0),
    comment: String(formData.get("comment") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };

  const tokenHash = await readTokenHash();
  if (!tokenHash) return { error: "Sessione scaduta, accedi di nuovo." };

  try {
    await convex().mutation(api.reviews.submit, {
      tokenHash,
      bookingId: asId("bookings", parsed.data.bookingId),
      rating: parsed.data.rating,
      comment: parsed.data.comment || undefined,
    });
  } catch (e) {
    const msg = e instanceof ConvexError ? String(e.message) : "";
    if (msg === "409 reviewed") return { error: "Hai giÃ  recensito questa prenotazione." };
    if (msg === "409 event-not-ended") return { error: "Potrai recensire dopo l'evento." };
    return { error: "Invio non riuscito, riprova." };
  }
  await revalidatePath("/account");
  return {};
}

/** Ripaga una prenotazione pending con una nuova Stripe Checkout Session. */
export async function retryCheckoutAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return;
  const tokenHash = await readTokenHash();
  if (!tokenHash) return;

  const raw = String(formData.get("bookingId") ?? "");
  if (!/^[a-z0-9]{20,40}$/.test(raw)) return;
  const bookingId = asId("bookings", raw);

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return; // in dev il pagamento Ã¨ simulato a livello webhook
  try {
    const rows = await convex().query(api.bookings.userBookings, { tokenHash });
    const row = rows.find((r) => String(r.booking._id) === raw);
    if (!row || row.booking.status !== "pending" || !row.event) return;
    const unit = Math.round(row.event.pricePerPerson * 100);
    if (unit <= 0) return;
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        { quantity: row.booking.quantity, price_data: { currency: "eur", unit_amount: unit, product_data: { name: row.event.title } } },
      ],
      metadata: { bookingId: raw },
      customer_email: row.booking.contactEmail,
      success_url: `${siteUrl()}/account?booking=${raw}`,
      cancel_url: `${siteUrl()}/account`,
      locale: "it",
      automatic_tax: { enabled: true },
    });
    if (session.url) {
      await convex().mutation(api.bookings.setStripeSession, { srvKey: srvKey(), bookingId, sessionId: session.id });
      redirect(session.url);
    }
  } catch {
    // silenzioso: retry sempre disponibile da /account
  }
  redirect("/account");
}

/** Annulla una prenotazione non ancora pagata (libera posti). */
export async function cancelBookingAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return;
  const tokenHash = await readTokenHash();
  if (!tokenHash) return;
  const raw = String(formData.get("bookingId") ?? "");
  if (!/^[a-z0-9]{20,40}$/.test(raw)) return;
  await convex().mutation(api.bookings.cancelPending, {
    tokenHash,
    bookingId: asId("bookings", raw),
  }).catch(() => undefined);
  await revalidatePath("/account");
}
