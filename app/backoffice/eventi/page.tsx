import Link from "next/link";
import { convex } from "@/lib/server/convex";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { readTokenHash } from "@/lib/server/session";

export const dynamic = "force-dynamic";

type Ev = FunctionReturnType<typeof api.events.adminList>[number];

export default async function BackofficeEventi() {
  const lang = await getLang();
  const d = t(lang).backofficePage;
  const tokenHash = (await readTokenHash())!;
  const events = (await convex().query(api.events.adminList, { tokenHash })) as Ev[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-cream">{d.events}</h2>
        <Link href="/backoffice/eventi/nuovo" className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">
          {d.newEvent}
        </Link>
      </div>
      {events.length ? (
        <ul className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {events.map((e) => (
            <li key={e._id} className="flex flex-col justify-between rounded-3xl border border-white/10 bg-ink-soft p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full px-2.5 py-1 font-semibold ${e.published ? "bg-gold/20 text-gold" : "border border-cream/25 text-cream/60"}`}>
                    {e.published ? d.published : d.draft}
                  </span>
                  {e.isPast ? <span className="text-cream/40">{t(lang).accountPage.past}</span> : null}
                </div>
                <p className="mt-2 font-display text-xl text-cream">{e.title}</p>
                <p className="mt-1 text-sm text-cream/70">
                  {new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(e.startAt))}
                  {" · "}
                  {Math.max(0, e.capacity - e.remaining)}/{e.capacity} {t(lang).booking.peopleCount} · € {e.pricePerPerson / 1}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <Link className="rounded-full bg-gold px-4 py-2 font-semibold text-ink hover:bg-cream" href={`/backoffice/eventi/${String(e._id)}`}>{d.edit}</Link>
                <Link className="rounded-full border border-cream/20 px-4 py-2 text-cream/80 hover:border-gold hover:text-gold" href={`/backoffice/eventi/${String(e._id)}/ospiti`}>{d.guests}</Link>
                <Link className="rounded-full border border-cream/20 px-4 py-2 text-cream/80 hover:border-gold hover:text-gold" href={`/backoffice/scan?event=${String(e._id)}`}>{d.scan}</Link>
                <Link className="rounded-full border border-cream/20 px-4 py-2 text-cream/60 hover:border-gold hover:text-gold" href={`/eventi/${e.slug}`} target="_blank">↗</Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-cream/60">{d.none}</p>
      )}
    </div>
  );
}
