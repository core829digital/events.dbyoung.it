"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { site } from "@/lib/site";

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-ink text-cream">
      <div className="absolute inset-0">
        <Image
          src="https://fattoriaisola.com/wp-content/uploads/2019/12/parco-villa-da-sopra1.jpg"
          alt="Fattoria Isola dall'alto — villa seicentesca e parco"
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
        className="relative w-full px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-10"
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-ink/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-gold sm:text-xs">
          Fattoria Isola · Laterina, Toscana
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl lg:text-7xl">
          Eventi premium,
          <br />
          <span className="text-gold">senza pensieri.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-cream/80 sm:text-lg">
          Villa seicentesca, parco secolare, piscina e cappella privata su 200 ettari.
          Partecipa agli eventi firmati Dimitri Bouterline — oppure organizza il tuo,
          con band dal vivo e strumenti veri.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/organizza" className="rounded-full bg-gold px-6 py-3 text-center font-semibold text-ink hover:bg-cream">
            Prenota call gratuita
          </Link>
          <Link href="/eventi" className="rounded-full border border-cream/30 px-6 py-3 text-center hover:border-gold hover:text-gold">
            Scopri i 2 format
          </Link>
        </div>
        <dl className="mt-10 grid max-w-2xl grid-cols-1 gap-3 text-sm sm:grid-cols-3 sm:gap-4">
          {[["200 ha", "tenuta agricola"], ["26", "posti letto in 5 alloggi"], ["150", "ospiti a bordo piscina"]].map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <dt className="font-display text-2xl text-gold">{v}</dt>
              <dd className="text-cream/70">{l}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-xs text-cream/50">
          Foto d&apos;ispirazione da <a className="underline" href={site.fattoria}>fattoriaisola.com</a> — originali in arrivo in <code>public/location/</code>.
        </p>
      </motion.div>
    </section>
  );
}
