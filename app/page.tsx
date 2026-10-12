import nextDynamic from "next/dynamic";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { EventCards } from "@/components/EventCards";
import { SectionHeading } from "@/components/SectionHeading";
import { spaces, localizeSpace, site } from "@/lib/site";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";


const Gallery = nextDynamic(() => import("@/components/Gallery").then((m) => m.Gallery), {
  loading: () => <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/5 md:h-56" />)}</div>,
});

export default async function Home() {
  const lang = await getLang();
  const d = t(lang).home;
  return (
    <>
      <Hero lang={lang} />

      <section className="w-full px-4 py-16 sm:px-6 lg:px-10">
        <SectionHeading kicker={d.formatsKicker} title={d.formatsTitle} sub={d.formatsSub} />
        <div className="mt-8"><EventCards lang={lang} /></div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="w-full px-4 py-16 sm:px-6 lg:px-10">
          <SectionHeading kicker={d.venueKicker} title={d.venueTitle} sub={d.venueSub} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((s) => {
              const l = localizeSpace(s, lang);
              return (
                <div key={s.name} className="rounded-2xl border border-white/10 bg-ink p-5">
                  <p className="font-display text-xl text-cream">{l.name}</p>
                  <p className="mt-1 text-sm text-cream/65">{l.detail}</p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-gold">{s.size}</p>
                </div>
              );
            })}
          </div>
          <Link href="/location" className="mt-6 inline-block text-sm font-semibold text-cream underline decoration-gold decoration-2 underline-offset-4 hover:text-gold">
            {d.venueCta}
          </Link>
        </div>
      </section>

      <section className="w-full px-4 py-16 sm:px-6 lg:px-10">
        <SectionHeading kicker={d.galleryKicker} title={d.galleryTitle} sub={d.gallerySub} />
        <div className="mt-8"><Gallery lang={lang} /></div>
      </section>

      <section className="w-full px-4 py-16 sm:px-6 lg:px-10">
        <SectionHeading kicker={d.ctaKicker} title={d.ctaTitle} sub={d.ctaSub} />
        <div className="mt-8">
          <Link href="/organizza" className="inline-block rounded-full bg-gold px-8 py-3.5 font-semibold text-ink hover:bg-cream">
            {d.ctaButton}
          </Link>
        </div>
        <p className="mt-6 text-sm text-cream/60">
          {d.ctaNote} <a className="underline" href={site.mainEvents}>dbyoung.it/eventi</a>.
        </p>
      </section>
    </>
  );
}
