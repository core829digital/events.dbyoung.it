import Stripe from "stripe";
import { api } from "@/convex/_generated/api";
import { convex, srvKey } from "@/lib/server/convex";
import { randomCode, signTicketCode } from "@/lib/crypto";
import { sendBookingConfirmation } from "@/lib/server/email";
import { guard } from "@/lib/server/req-guard";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe Webhook — unica fonte di verità del pagamento.
 * FIRMA OBBLIGATORIA: stripe.webhooks.constructEvent verificando
 * `stripe-signature` con STRIPE_WEBHOOK_SECRET.
 * (in sviluppo locale, senza chiavi configurate, Stripe chiama qui con
 * firma verificabile solo se hai configurato il secret — vedi README.)
 */
export async function POST(req: Request) {
  const bad = await guard({});
  if (bad) return bad;

  // limiti dimensione/body: Stripe body modesto; comunque cap da body read
  const raw = await req.text();
  if (raw.length > 1_000_000) return new Response("Bad request", { status: 400 });

  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!whSecret || !key) {
    // nessuna configurazione Stripe: in dev rispondiamo ok per non bloccare i retry
    console.warn("[stripe] STRIPE_WEBHOOK_SECRET/config assente: evento ignorato");
    return new Response("Not configured", { status: 200 });
  }

  const sig = req.headers.get("stripe-signature") ?? "";
  const stripe = new Stripe(key);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, whSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const secretKey = srvKey();
  switch (event.type) {
    case "checkout.session.completed": {
      const sess = event.data.object;
      if (sess.payment_status !== "paid" && sess.payment_status !== "unpaid") break; // solo pagati o async
      if (sess.payment_status === "unpaid" && sess.status !== "complete") break;

      const bundle = await convex().query(api.tickets.paidBookingBundle, {
        srvKey: secretKey,
        sessionId: sess.id,
      });
      if (!bundle) break; // pagamento fuori dal nostro sistema
      const booking = bundle.booking as Record<string, unknown>;
      if (booking.status === "paid") break; // idempotente
      // Integrità importi: l'importo Stripe deve corrispondere (centesimi EUR)
      if (sess.currency !== "eur" || (sess.amount_total ?? 0) !== (booking.amountCents as number)) {
        console.error("[stripe] amount mismatch", sess.id);
        break;
      }
      const ev = bundle.event as Record<string, unknown> | null;
      const attendees = (booking.attendees as Array<{ name: string; surname: string; dob: string; cf: string }>) ?? [];
      const eventStart = Number(ev?.startAt ?? 0);
      const tickets = attendees.map((p) => {
        const code = randomCode(24);
        return { ...p, code, sig: signTicketCode(code) };
      });
      await convex().mutation(api.bookings.markPaidAndCreateTickets, {
        srvKey: secretKey,
        sessionId: sess.id,
        paymentIntentId: typeof sess.payment_intent === "string" ? sess.payment_intent : undefined,
        paidAt: Date.now(),
        tickets,
      });
      await sendBookingConfirmation({
        email: String(booking.contactEmail),
        lang: (booking.lang === "en" ? "en" : "it"),
        contactName: String(booking.contactName),
        eventTitle: String(ev?.title ?? "Evento"),
        eventStartAt: eventStart,
        quantity: Number(booking.quantity),
        amountCents: Number(booking.amountCents),
        tickets: tickets.map((t) => ({ name: t.name, surname: t.surname, code: t.code })),
      }).catch(() => undefined);
      break;
    }
    case "checkout.session.expired": {
      const sess = event.data.object;
      await convex().mutation(api.bookings.markCancelledBySession, {
        srvKey: secretKey,
        sessionId: sess.id,
      }).catch(() => undefined);
      break;
    }
    default:
      break;
  }
  return new Response("OK", { status: 200 });
}

/** Solo POST (i GET non esistono: no info leak sull'esistenza dell'endpoint). */
export async function GET() {
  void rateLimit; void clientIp;
  return new Response("Method not allowed", { status: 405 });
}
