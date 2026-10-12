"use client";

import { site } from "@/lib/site";

export function CalendlyEmbed() {
  const url = site.calendlyUrl;
  const isPlaceholder = url.includes("tuo-nome");
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="border-b border-white/10 p-4 text-sm text-cream/70">
        Call conoscitiva gratuita · 30 min · {isPlaceholder ? "collega il tuo link Calendly in NEXT_PUBLIC_CALENDLY_URL" : url}
      </div>
      {isPlaceholder ? (
        <div className="p-8 text-center text-cream/70">
          <p className="font-display text-2xl text-cream">Calendly da collegare</p>
          <p className="mt-2 text-sm">Imposta <code>NEXT_PUBLIC_CALENDLY_URL</code> in Vercel/.env e l&apos;embed apparirà qui.</p>
          <a href={site.mainEvents} className="mt-4 inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink">Vai alla pagina eventi dbyoung.it</a>
        </div>
      ) : (
        <iframe
          src={url}
          title="Prenota una call conoscitiva"
          className="h-[700px] w-full bg-cream"
          loading="lazy"
        />
      )}
    </div>
  );
}
