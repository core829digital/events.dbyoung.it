"use client";

import { site } from "@/lib/site";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function CalendlyEmbed({ lang, height }: { lang: Lang; height?: string }) {
  const d = t(lang).calendly;
  const url = site.calendlyUrl;
  const isPlaceholder = url.includes("tuo-nome");
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="border-b border-white/10 p-4 text-sm text-cream/70">
        {d.title} · {isPlaceholder ? "collega il tuo link Calendly in NEXT_PUBLIC_CALENDLY_URL" : url}
      </div>
      {isPlaceholder ? (
        <div className="p-8 text-center text-cream/70">
          <p className="font-display text-2xl text-cream">{d.placeholderTitle}</p>
          <p className="mt-2 text-sm">{d.placeholderBody}</p>
          <a href={site.mainEvents} className="mt-4 inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink">{d.placeholderCta}</a>
        </div>
      ) : (
        <iframe
          src={url}
          title={d.iframeTitle}
          className={`${height ?? "min-h-[540px] flex-1"} w-full bg-cream`}
          loading="lazy"
        />
      )}
    </div>
  );
}
