import Link from "next/link";
import { notFound } from "next/navigation";
import { convex } from "@/lib/server/convex";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { asId } from "@/lib/server/convex";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { readTokenHash } from "@/lib/server/session";
import { SectionHeading } from "@/components/SectionHeading";

export const dynamic = "force-dynamic";

type Bookings = FunctionReturnType<typeof api.bookings.adminBookingsByEvent>;
type Stats = FunctionReturnType<typeof api.tickets.eventCheckInStats>;

export default async function EventGuestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]{20,40}$/.test(id)) notFound();
  const lang = await getLang();
  const d = t(lang).backofficePage;
  const tokenHash = (await readTokenHash())!;

  const eventId = asId("events", id);
  const [ev, bookings, checkIns] = await Promise.all([
    convex().query(api.events.adminEvent, { tokenHash, eventId }),
    convex().query(api.bookings.adminBookingsByEvent, { tokenHash, eventId }) as Promise<Bookings>,
    convex().query(api.tickets.eventCheckInStats, { tokenHash, eventId }) as Promise<Stats>,
  ]);
  if (!ev) notFound();

  const fmt = (ms: number) => new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", { dateStyle: "short", timeStyle: "short" }).format(new Date(ms));

  return (
    <div>
      <SectionHeading kicker={d.guests} title={ev.title} sub={fmt(ev.startAt)} />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link href={`/backoffice/scan?event=${id}`} className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">
          {d.scan} →
        </Link>
        <span className="text-sm text-cream/70">
          {d.checkinProgress}: <b className="text-gold">{checkIns?.checkedIn ?? 0}</b>/{checkIns?.total ?? 0}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {bookings.length ? (
          bookings.map(({ booking, tickets }) => (
            <div key={booking._id} className="rounded-3xl border border-white/10 bg-ink-soft p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-full px-2.5 py-1 font-semibold ${booking.status === "paid" ? "bg-gold/20 text-gold" : booking.status === "pending" ? "border border-cream/30 text-cream/70" : "border border-cream/20 text-cream/50"}`}>
                  {booking.status === "paid" ? t(lang).accountPage.paidBadge : booking.status === "pending" ? t(lang).accountPage.notPaid : t(lang).accountPage.cancelledBadge}
                </span>
                <span className="text-cream/60">{booking.contactName} · {booking.contactEmail}</span>
                <span className="text-cream/50">{fmt(booking.createdAt)}</span>
                {booking.status === "paid" ? <span className="text-gold">€ {(Number(booking.amountCents) / 100).toFixed(2)}</span> : null}
              </div>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {tickets.map((t) => (
                  <li key={t._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm">
                    <span>
                      <b className="text-cream">{t.surname} {t.name}</b>
                      <span className="ml-2 text-xs text-cream/50">{t.cf}</span>
                    </span>
                    {t.status === "checkedIn" ? (
                      <span className="rounded-full bg-gold/20 px-2.5 py-1 text-xs font-semibold text-gold">✓ {d.scanOk}</span>
                    ) : (
                      <span className="text-xs text-cream/50">—</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-cream/60">{lang === "en" ? "No bookings yet." : "Ancora nessuna prenotazione."}</p>
        )}
      </div>
      <p className="mt-4 text-xs text-cream/40">{ev.isPast ? (lang === "en" ? "Event ended" : "Evento concluso") : ""}</p>
    </div>
  );
}
