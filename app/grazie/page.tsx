import Link from "next/link";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";


export default async function Grazie() {
  const lang = await getLang();
  const d = t(lang).grazie;
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-24">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">{d.kicker}</p>
      <h1 className="mt-2 font-display text-4xl text-cream">{d.title}</h1>
      <p className="mt-4 text-cream/70">{d.sub}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/organizza" className="rounded-full bg-gold px-6 py-3 font-semibold text-ink">{d.ctaCall}</Link>
        <Link href="/" className="rounded-full border border-cream/25 px-6 py-3">{d.ctaHome}</Link>
      </div>
    </div>
  );
}
