"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { site } from "@/lib/site";
import { CalendlyEmbed } from "./CalendlyEmbed";

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Hero({ lang }: { lang: Lang }) {
  const reduce = useReducedMotion();
  const d = t(lang).hero;
  return (
    <section className="relative flex min-h-[100svh] overflow-hidden bg-ink text-cream">
      <div className="absolute inset-0">
        <Image
          src="https://fattoriaisola.com/wp-content/uploads/2019/12/parco-villa-da-sopra1.jpg"
          alt={lang === "it" ? "Fattoria Isola dall'alto — villa seicentesca e parco" : "Fattoria Isola from above — 17th-century villa and park"}
          fill
          priority
          className="object-cover opacity-45"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink" />
      </div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mb-auto mt-14 w-full px-4 pb-16 sm:mt-20 sm:px-6 lg:px-10"
      >
        <div className="grid items-stretch gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-ink/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-gold sm:text-xs">
              {d.badge}
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl lg:text-7xl">
              {d.titleA}
              <br />
              <span className="text-gold">{d.titleB}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base text-cream/80 sm:text-lg">
              {d.sub}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="#prenota" className="rounded-full bg-gold px-6 py-3 text-center font-semibold text-ink hover:bg-cream">
                {d.ctaCall}
              </a>
              <Link href="/eventi" className="rounded-full border border-cream/30 px-6 py-3 text-center hover:border-gold hover:text-gold">
                {d.ctaFormats}
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-cream/60">{d.socialLabel}</span>
              <a
                href={site.instagramIsola}
                target="_blank"
                rel="noreferrer"
                aria-label={d.socialFattoria}
                title="Fattoria Isola"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/25 text-cream/80 transition hover:border-gold hover:text-gold"
              >
                <InstagramIcon />
              </a>
              <a
                href={site.instagramEvents}
                target="_blank"
                rel="noreferrer"
                aria-label={d.socialEvents}
                title="Eventi DBYoung"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/25 text-cream/80 transition hover:border-gold hover:text-gold"
              >
                <InstagramIcon />
              </a>
            </div>
            <dl className="mt-8 grid max-w-2xl grid-cols-1 gap-3 text-sm sm:grid-cols-3 sm:gap-4">
              {d.stats.map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <dt className="font-display text-2xl text-gold">{v}</dt>
                  <dd className="text-cream/70">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div id="prenota" className="min-h-[560px] scroll-mt-24 lg:min-h-0">
            <CalendlyEmbed lang={lang} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
