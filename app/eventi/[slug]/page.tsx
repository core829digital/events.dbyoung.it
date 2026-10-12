import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { events } from "@/lib/site";

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ev = events.find((e) => e.slug === slug);
  if (!ev) notFound();
  return (
    <article className="mx-auto max-w-4xl px-5 py-14">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">{ev.tagline}</p>
      <h1 className="mt-2 font-display text-4xl text-cream sm:text-5xl">{ev.title}</h1>
      <div className="relative mt-6 h-72 overflow-hidden rounded-3xl border border-white/10">
        <Image src={ev.image} alt={ev.title} fill className="object-cover" sizes="100vw" />
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
