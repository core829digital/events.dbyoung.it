import Image from "next/image";
import Link from "next/link";
import { events, type EventKind } from "@/lib/site";
import { Reveal } from "./Reveal";

export function EventCards({ filter }: { filter?: EventKind }) {
  const list = filter ? events.filter((e) => e.kind === filter) : events;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {list.map((e, i) => (
        <Reveal key={e.slug} delay={(i % 2) * 0.08}>
          <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:border-gold/50">
            <div className="relative h-56">
              <Image
                src={e.image}
                alt={e.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-xs uppercase tracking-widest text-gold">
                {e.kind === "dimitri" ? "Firmato Dimitri" : "Organizza tu"}
              </span>
            </div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-cream/50">{e.tagline}</p>
              <h3 className="mt-1 font-display text-2xl text-cream">{e.title}</h3>
              <p className="mt-2 text-sm text-cream/70">{e.description}</p>
              <p className="mt-3 text-sm text-gold">{e.priceFrom} · {e.capacity}</p>
              <Link href={`/eventi/${e.slug}`} className="mt-4 inline-block text-sm font-semibold text-cream underline decoration-gold decoration-2 underline-offset-4 hover:text-gold">
                Dettagli →
              </Link>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
