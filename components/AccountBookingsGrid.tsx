import Image from "next/image";
import { ReviewForm } from "./ReviewForm";
import { cancelBookingAction, retryCheckoutAction } from "@/app/actions/booking";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type Rows = FunctionReturnType<typeof api.bookings.userBookings>;
type Row = Rows[number];

export function AccountBookingsGrid({ rows, now, lang }: { rows: Row[]; now: number; lang: Lang }) {
  const d = t(lang).accountPage;
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => {
        const ev = r.event;
        const paid = r.booking.status === "paid";
        const isPast = !!ev && ev.startAt <= now;
        return (
          <div key={r.booking._id} className="flex flex-col rounded-3xl border border-white/10 bg-ink-soft p-5">
            {ev ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{ev.title}</p>
                <p className="mt-1 text-cream/80">
                  {new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", { dateStyle: "full", timeStyle: "short" }).format(new Date(ev.startAt))}
                </p>
                <p className="mt-1 text-sm text-cream/60">{t(lang).booking.location}</p>
              </>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              {paid ? (
                <span className="rounded-full bg-gold/20 px-2.5 py-1 font-semibold text-gold">{d.paidBadge}</span>
              ) : r.booking.status === "pending" ? (
                <span className="rounded-full border border-cream/30 px-2.5 py-1 text-cream/70">{d.notPaid}</span>
              ) : (
                <span className="rounded-full border border-cream/20 px-2.5 py-1 text-cream/50">{d.cancelledBadge}</span>
              )}
              <span className="text-cream/60">{r.booking.quantity} {r.booking.quantity > 1 ? d.personPlural : d.person}</span>
            </div>

            {paid && r.tickets.length ? (
              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-cream/80">{d.myTickets}</p>
                <div className="grid grid-cols-2 flex-1 gap-3">
                  {r.tickets.map((t2) => (
                    <div key={t2._id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                      <Image src={`/api/qr/${t2.code}`} alt={`QR ${t2.name} ${t2.surname}`} width={120} height={120} className="mx-auto rounded-lg bg-[#faf8f4]" unoptimized />
                      <p className="mt-2 truncate text-xs font-semibold text-cream">{t2.name} {t2.surname}</p>
                      <p className="text-[10px] text-cream/50">{t2.status === "checkedIn" ? "✓" : ""}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-cream/50">{d.downloadHint}</p>
              </div>
            ) : null}

            {r.booking.status === "pending" ? (
              <div className="mt-4 flex gap-2">
                <form action={retryCheckoutAction} className="flex-1">
                  <input type="hidden" name="bookingId" value={String(r.booking._id)} />
                  <button type="submit" className="w-full rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-ink hover:bg-cream">
                    {d.goPay}
                  </button>
                </form>
                <form action={cancelBookingAction}>
                  <input type="hidden" name="bookingId" value={String(r.booking._id)} />
                  <button type="submit" className="rounded-full border border-cream/25 px-4 py-2.5 text-sm text-cream/70 hover:border-red-400 hover:text-red-300">
                    {d.cancelPending}
                  </button>
                </form>
              </div>
            ) : null}

            {isPast && paid ? (
              <div className="mt-4">
                <ReviewForm bookingId={String(r.booking._id)} lang={lang} canReview={r.canReview} alreadyReviewed={r.alreadyReviewed} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
