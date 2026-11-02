import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { redirect } from "next/navigation";
import Link from "next/link";
import { readTokenHash, getSessionUser } from "@/lib/server/session";
import { convex } from "@/lib/server/convex";
import { api } from "@/convex/_generated/api";
import { AccountBookingsGrid } from "@/components/AccountBookingsGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { logoutAction } from "@/app/actions/auth";
import type { FunctionReturnType } from "convex/server";

export const metadata = { title: "Il mio account — Eventi DBYoung" };
export const dynamic = "force-dynamic";

type Rows = FunctionReturnType<typeof api.bookings.userBookings>;
type Row = Rows[number];

export default async function AccountPage() {
  const [lang, tokenHash, user] = await Promise.all([
    getLang(),
    readTokenHash(),
    getSessionUser(),
  ]);
  if (!tokenHash || !user) redirect("/login?next=/account");
  const d = t(lang).accountPage;

  const rows = (await convex().query(api.bookings.userBookings, { tokenHash })) as Row[];
  const now = rows[0]?.now ?? 0;

  const active = rows.filter((r) => r.event && r.event.startAt > now && r.booking.status === "paid");
  const pending = rows.filter((r) => r.booking.status === "pending");
  const past = rows.filter(
    (r) => (r.event && r.event.startAt <= now && r.booking.status === "paid") || r.booking.status === "cancelled",
  );

  return (
    <div className="w-full px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
      <SectionHeading kicker={d.kicker} title={d.title} sub={d.sub} />
      <div className="mt-2 flex flex-wrap gap-3">
        {user.role !== "client" ? (
          <Link
            href="/backoffice"
            className="rounded-full border border-gold/50 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold hover:text-ink"
          >
            {d.backofficeCta}
          </Link>
        ) : null}
        <Link href="/eventi" className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">
          {d.bookMoreCta}
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="rounded-full border border-cream/25 px-5 py-2.5 text-sm text-cream/80 hover:border-gold hover:text-gold">
            {lang === "en" ? "Log out" : "Esci"}
          </button>
        </form>
      </div>

      {pending.length > 0 ? (
        <>
          <h3 className="mb-3 mt-10 font-display text-2xl text-gold">{lang === "en" ? "Awaiting payment" : "In attesa di pagamento"}</h3>
          <AccountBookingsGrid rows={pending} now={now} lang={lang} />
        </>
      ) : null}

      <h3 className="mb-3 mt-10 font-display text-2xl text-gold">{d.upcoming}</h3>
      {active.length ? (
        <AccountBookingsGrid rows={active} now={now} lang={lang} />
      ) : (
        <p className="text-cream/60">{d.noneYet}</p>
      )}

      <h3 className="mb-3 mt-10 font-display text-2xl text-gold">{d.past}</h3>
      {past.length ? (
        <AccountBookingsGrid rows={past} now={now} lang={lang} />
      ) : (
        <p className="text-cream/60">{d.noneYet}</p>
      )}
    </div>
  );
}
