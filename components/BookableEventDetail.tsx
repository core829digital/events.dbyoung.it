import Link from "next/link";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { fmtDate, euro } from "@/lib/bookable";
import { BookWidget } from "./BookWidget";

type Review = { rating: number; comment?: string; createdAt: number };

/**
 * Dettaglio evento prenotabile (dati da Convex, solo contenuti pubblici).
 * Include il widget di prenotazione, sempre mobile-first (è lì che tutto
 * oggi accade: phone first). Le recensioni sono pubbliche e anonime.
 */
export async function BookableEventDetail({
  ev,
  reviews,
  lang,
}: {
  ev: NonNullable<FunctionReturnType<typeof api.events.publicEvent>>;
  reviews: Review[];
  lang: Lang;
}) {
  const d = t(lang).booking;
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  return (
    <article className="w-full px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{fmtDate(ev.startAt, lang)}</p>
      <h1 className="mt-2 font-display text-3xl text-cream sm:text-4xl lg:text-5xl">{ev.title}</h1>
      {ev.tagline ? <p className="mt-2 text-lg text-cream/70">{ev.tagline}</p> : null}
      <Image
        src={ev.image}
        alt={ev.title}
        width={1600}
        height={900}
        sizes="100vw"
        className="mt-6 h-56 w-full rounded-3xl border border-white/10 object-cover sm:h-80"
        unoptimized
      />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[3fr,2fr]">
        <div>
          <p className="whitespace-pre-line text-lg text-cream/85">{ev.description}</p>
          {ev.locationNote ? (
            <p className="mt-4 whitespace-pre-line text-sm text-cream/60">{ev.locationNote}</p>
          ) : null}
          <ul className="mt-6 space-y-2 text-cream/80">
            <li>✓ {d.location}</li>
          </ul>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-gold/30 bg-ink-soft p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{d.bookTitle}</p>
            <p className="mt-1 font-display text-3xl text-cream">
              {euro(ev.pricePerPerson, lang)}
              <span className="ml-2 text-sm font-sans text-cream/60">{t(lang).accountPage.person}</span>
            </p>
            <p className="mt-2 text-sm text-cream/70">
              {ev.remaining > 0 ? `${ev.remaining} ${d.seatsRemaining}` : d.soldOut}
            </p>
            <div className="mt-4">
              <BookWidget
                eventId={String(ev._id)}
                lang={lang}
                remaining={ev.remaining}
                price={ev.pricePerPerson}
                title={ev.title}
              />
            </div>
            <p className="mt-4 text-xs text-cream/50">{d.endNote}</p>
          </div>
        </aside>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/eventi" className="rounded-full border border-cream/25 px-6 py-3 hover:border-gold hover:text-gold">
          {d.back}
        </Link>
      </div>

      {reviews.length ? (
        <section className="mt-14 border-t border-white/10 pt-8">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="font-display text-2xl text-cream">{d.reviewsTitle}</h2>
            <p className="text-gold" aria-label={`${avg.toFixed(1)} / 5`}>
              {"★".repeat(Math.round(avg))}
              <span className="text-cream/40">{"★".repeat(5 - Math.round(avg))}</span>
              <span className="ml-2 text-sm text-cream/60">{avg.toFixed(1)} · {reviews.length} {reviews.length === 1 ? d.reviewOne : d.reviewsMany}</span>
            </p>
          </div>
          <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.createdAt} className="rounded-2xl border border-white/10 bg-ink-soft p-4">
                <p className="text-gold text-sm">{"★".repeat(r.rating)}<span className="text-cream/25">{"★".repeat(5 - r.rating)}</span></p>
                {r.comment ? <p className="mt-1.5 text-sm text-cream/80">{r.comment}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
