import type { Lang } from "@/lib/i18n";
import { legalDocs, legalBindingNote } from "@/lib/legal";

export function LegalPage({ slug, lang }: { slug: string; lang: Lang }) {
  const doc = legalDocs[slug];
  if (!doc) return null;
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 text-cream/80 sm:px-6 sm:py-14">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Legale</p>
      <h1 className="mt-2 font-display text-4xl text-cream">{doc.title}</h1>
      <p className="mt-4 rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm text-cream">
        {lang === "it" ? doc.summaryIt : doc.summaryEn} {legalBindingNote(lang)}
      </p>
      <p className="mt-3 text-sm text-cream/50">{doc.updated}</p>
      {doc.sections.map((s) => (
        <section key={s.h} className="mt-8">
          <h2 className="font-display text-xl text-cream">{s.h}</h2>
          <p className="mt-2 text-sm leading-relaxed text-cream/70">{s.p}</p>
        </section>
      ))}
    </div>
  );
}
