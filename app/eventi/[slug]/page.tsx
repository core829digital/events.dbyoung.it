import { notFound } from "next/navigation";
import { convex, asId } from "@/lib/server/convex";
import { api } from "@/convex/_generated/api";
import { getLang } from "@/lib/lang-server";
import { localizeEvent } from "@/lib/site";
import { events } from "@/lib/site";
import { EventStaticDetail } from "@/components/EventStaticDetail";
import { BookableEventDetail } from "@/components/BookableEventDetail";

export const dynamic = "force-dynamic";

/**
 * Disambigua: un slug può riferirsi a
 * 1) un evento prenotabile (creato da Dimitri nel backoffice, dati Convex) —
 *    pagina attiva con prenotazione Stripe + QR; oppure
 * 2) un format statico del marketing (lib/site.ts) con CTA call.
 * Nomi KISS: i prenotabili hanno slug unici creati nel backoffice.
 */
export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 60) notFound();
  const lang = await getLang();

  const bookable = await convex().query(api.events.publicEvent, { slug });
  if (bookable) {
    const reviews = await convex().query(api.events.publicEventReviews, {
      eventId: asId("events", String(bookable._id)),
    });
    return <BookableEventDetail ev={bookable} reviews={reviews} lang={lang} />;
  }

  const raw = events.find((e) => e.slug === slug);
  if (!raw) notFound();
  const ev = localizeEvent(raw, lang);
  return <EventStaticDetail slug={slug} lang={lang} />;
}
