import Link from "next/link";
import { convex } from "@/lib/server/convex";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { readTokenHash } from "@/lib/server/session";

export const dynamic = "force-dynamic";

type Stats = FunctionReturnType<typeof api.events.adminStats>;
type Ev = FunctionReturnType<typeof api.events.adminList>[number];

export default async function BackofficeDash() {
  const lang = await getLang();
  const d = t(lang).backofficePage;
  const tokenHash = (await readTokenHash())!;
  const [stats, events] = await Promise.all([
    convex().query(api.events.adminStats, { tokenHash }) as Promise<Stats>,
    convex().query(api.events.adminList, { tokenHash }) as Promise<Ev[]>,
  ]);
  const next = events.filter((e) => !e.isPast).slice(0, 3);

  const cards = [
    { label: d.statsUpcoming, value: stats?.upcomingCount ?? 0 },
    { label: d.statsPaid, value: stats?.paidBookings ?? 0 },
    { label: d.statsRevenue, value: `€ ${stats?.revenueEur ?? 0}` },
    { label: d.statsCheckin, value: stats?.checkedInTickets ?? 0 },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-3xl border border-white/10 bg-ink-soft p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">{c.label}</p>
            <p className="mt-2 font-display text-3xl text-cream sm:text-4xl">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-2xl text-cream">{d.events}</h2>
        <Link href="/backoffice/eventi/nuovo" className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">
          {d.newEvent}
        </Link>
      </div>
      {next.length ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {next.map((e) => (
            <li key={e._id} className="rounded-3xl border border-white/10 bg-ink-soft p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">
                {new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(e.startAt))}
              </p>
              <p className="mt-1 font-display text-lg text-cream">{e.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-full px-2.5 py-1 font-semibold ${e.published ? "bg-gold/20 text-gold" : "border border-cream/25 text-cream/60"}`}>
                  {e.published ? d.published : d.draft}
                </span>
                <span className="text-cream/60">{e.capacity} {t(lang).booking.capacity.toLowerCase()}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <Link className="rounded-full border border-cream/20 px-3 py-1.5 text-cream/80 hover:border-gold hover:text-gold" href={`/backoffice/eventi/${String(e._id)}`}>{d.edit}</Link>
                <Link className="rounded-full border border-cream/20 px-3 py-1.5 text-cream/80 hover:border-gold hover:text-gold" href={`/backoffice/eventi/${String(e._id)}/ospiti`}>{d.guests}</Link>
                <Link className="rounded-full border border-cream/20 px-3 py-1.5 text-cream/80 hover:border-gold hover:text-gold" href={`/backoffice/scan?event=${String(e._id)}`}>{d.scan}</Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-cream/60">{d.none}</p>
      )}
    </div>
  );
}
