"use client";

import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { LANG_COOKIE } from "@/lib/i18n";

/** Selettore lingua IT/EN come su dbyoung.it (salvato in cookie + refresh). */
export function LangToggle({ lang }: { lang: Lang }) {
  const router = useRouter();
  function setLang(l: Lang) {
    if (l === lang) return;
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }
  return (
    <div className="flex items-center rounded-full border border-cream/25 bg-white/5 p-0.5 text-[11px] font-semibold">
      {(["it", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-label={l === "it" ? "Italiano" : "English"}
          onClick={() => setLang(l)}
          className={`rounded-full px-2.5 py-1 uppercase transition-all ${
            lang === l ? "bg-gold text-ink" : "text-cream/55 hover:text-cream"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
