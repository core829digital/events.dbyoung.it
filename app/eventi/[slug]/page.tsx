import { notFound } from "next/navigation";
import Link from "next/link";
import { events } from "@/lib/site";
import { SmartImage } from "@/components/SmartImage";

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ev = events.find((e) => e.slug === slug);
  if (!ev) notFound();
  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">{ev.tagline}</p>
      <h1 className="mt-2 font-display text-3xl text-cream sm:text-4xl lg:text-5xl">{ev.title}</h1>
      <div className="relative mt-6 h-56 overflow-hidden rounded-3xl border border-white/10 bg-ink-soft sm:h-72">
        <SmartImage src={ev.image} fallback={ev.imageFallback} alt={ev.title} sizes="100vw" className="object-cover" />
      </div>
      <p className="mt-6 text-lg text-cream/80">{ev.description}</p>
      <ul className="mt-6 space-y-2 text-cream/80">
        {ev.highlights.map((h) => <li key={h}>✓ {h}</li>)}
      </ul>
      <p className="mt-6 text-gold">{ev.priceFrom} · {ev.capacity} · {ev.music}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/organizza" className="rounded-full bg-gold px-6 py-3 font-semibold text-ink hover:bg-cream">Richiedi per questa data →</Link>
        <Link href="/eventi" className="rounded-full border border-cream/25 px-6 py-3 hover:border-gold hover:text-gold">← Tutti gli eventi</Link>
      </div>
    </article>
  );
}
