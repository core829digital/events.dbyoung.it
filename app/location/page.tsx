import nextDynamic from "next/dynamic";
import { SectionHeading } from "@/components/SectionHeading";
import { spaces, localizeSpace, appartamenti, site } from "@/lib/site";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";


const Gallery = nextDynamic(() => import("@/components/Gallery").then((m) => m.Gallery), {
  loading: () => <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/5 md:h-56" />)}</div>,
});

export const metadata = { title: "Location — Fattoria Isola" };

export default async function LocationPage() {
  const lang = await getLang();
  const d = t(lang).locationPage;
  return (
    <div className="w-full px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
      <SectionHeading kicker={d.kicker} title={d.title} sub={d.sub} />
      <div className="mt-8"><Gallery lang={lang} /></div>

      <h2 className="mt-14 font-display text-3xl text-cream">{d.spacesTitle}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {spaces.map((s) => {
          const l = localizeSpace(s, lang);
          return (
            <div key={s.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-display text-xl">{l.name}</p>
              <p className="mt-1 text-sm text-cream/65">{l.detail}</p>
            </div>
          );
        })}
      </div>

      <h2 className="mt-14 font-display text-3xl text-cream">{d.sleepTitle}</h2>
      <ul className="mt-4 space-y-3 text-cream/80">
        {appartamenti.map((a) => (
          <li key={a.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <b className="text-cream">{a.name}.</b> {lang === "it" ? a.it : a.en}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-cream/60">
        {d.sourceNote} <a className="underline" href={site.fattoria}>fattoriaisola.com</a>
      </p>
    </div>
  );
}
