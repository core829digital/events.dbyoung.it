import dynamic from "next/dynamic";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { EventCards } from "@/components/EventCards";
import { SectionHeading } from "@/components/SectionHeading";
import { spaces, site } from "@/lib/site";

const Gallery = dynamic(() => import("@/components/Gallery").then((m) => m.Gallery), {
  loading: () => <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/5 md:h-56" />)}</div>,
});
const Pricing = dynamic(() => import("@/components/Pricing").then((m) => m.Pricing), {
  loading: () => <div className="grid gap-6 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/5" />)}</div>,
});

export default function Home() {
  return (
    <>
      <Hero />

      <section className="w-full px-4 sm:px-6 lg:px-10 py-16">
        <SectionHeading
          kicker="I 2 format"
          title={<>Scegli come vivere Isola.</>}
          sub="Tipo 1: vieni a un evento organizzato da Dimitri. Tipo 2: organizza il tuo evento nella tenuta — matrimoni, privati, corporate, shooting."
        />
        <div className="mt-8"><EventCards /></div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-16">
          <SectionHeading kicker="La location" title="Fattoria Isola, un'isola nel centro della Toscana." sub="Villa seicentesca del Granduca, parco con piante rare, cappella privata, 5 appartamenti, piscina 7×14, cavalli e 200 ettari. A 500 m da Laterina, 50 km da Firenze e Siena." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((s) => (
              <div key={s.name} className="rounded-2xl border border-white/10 bg-ink p-5">
                <p className="font-display text-xl text-cream">{s.name}</p>
                <p className="mt-1 text-sm text-cream/65">{s.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-widest text-gold">{s.size}</p>
              </div>
            ))}
          </div>
          <Link href="/location" className="mt-6 inline-block text-sm font-semibold text-cream underline decoration-gold decoration-2 underline-offset-4 hover:text-gold">
            Vedi la gallery →
          </Link>
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-10 py-16">
        <SectionHeading kicker="Gallery" title="Guarda con i tuoi occhi." sub="Foto originali della tenuta in arrivo in public/location/ — anteprima dai collegamenti pubblici di fattoriaisola.com." />
        <div className="mt-8"><Gallery /></div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-10 py-16">
        <SectionHeading kicker="Prezzi chiari" title="Premium nell'esperienza, accessibile nel prezzo." />
        <div className="mt-8"><Pricing /></div>
        <p className="mt-6 text-sm text-cream/60">
          DBYoung suona con strumenti veri — jazz, blues, classica e moderna. Dettagli e preventivi su misura in call gratuita. Vedi anche <a className="underline" href={site.mainEvents}>dbyoung.it/eventi</a>.
        </p>
      </section>
    </>
  );
}
