import Link from "next/link";
import Image from "next/image";
import { convex } from "@/lib/server/convex";
import { api } from "@/convex/_generated/api";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

function fmt(ms: number, lang: "it" | "en") {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

export async function UpcomingEvents() {
  const lang = await getLang();
  const d = t(lang).booking;
  const list = await convex().query(api.events.publicUpcoming, {});
  return (
    <Reveal className="max-w-2xl">
      {list.length ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{d.upcomingKicker}</p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-cream sm:text-4xl">{d.upcomingTitle}</h2>
          <p className="mt-3 text-cream/70">{d.upcomingSub}</p>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {list.map((e) => (
              <li key={e._id} className="overflow-hidden rounded-3xl border border-white/10 bg-ink-soft">
                <Link href={`/eventi/${e.slug}`} className="block">
                  <Image src={e.image} alt={e.title} width={640} height={360} className="h-40 w-full object-cover" unoptimized />
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-gold">{fmt(e.startAt, lang)}</p>
                    <p className="mt-1 font-display text-xl text-cream">{e.title}</p>
                    <p className="mt-2 text-sm text-cream/70">
                      {e.remaining > 0 ? `${e.remaining} ${d.seatsRemaining}` : d.soldOut}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Reveal>
  );
}
