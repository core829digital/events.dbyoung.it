import Link from "next/link";
import { events, localizeEvent, type EventKind } from "@/lib/site";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { Reveal } from "./Reveal";
import { SmartImage } from "./SmartImage";

export function EventCards({ filter, lang }: { filter?: EventKind; lang: Lang }) {
  const d = t(lang).cards;
  const list = (filter ? events.filter((e) => e.kind === filter) : events).map((e) => localizeEvent(e, lang));
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
      {list.map((e, i) => (
        <Reveal key={e.slug} delay={(i % 2) * 0.08}>
          <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:border-gold/50">
            <div className="relative h-56 bg-ink-soft">
              <SmartImage
                src={e.image}
                fallback={e.imageFallback}
                alt={e.title}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-xs uppercase tracking-widest text-gold">
                {e.kind === "dimitri" ? d.byDimitri : d.byYou}
              </span>
            </div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-cream/50">{e.tagline}</p>
              <h3 className="mt-1 font-display text-2xl text-cream">{e.title}</h3>
              <p className="mt-2 text-sm text-cream/70">{e.description}</p>
              <p className="mt-3 text-sm text-cream/60">{e.capacity} · {e.music}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link href="/organizza" className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">
                  {d.bookCall}
                </Link>
                <Link href={`/eventi/${e.slug}`} className="text-sm font-semibold text-cream underline decoration-gold decoration-2 underline-offset-4 hover:text-gold">
                  {d.details}
                </Link>
              </div>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
