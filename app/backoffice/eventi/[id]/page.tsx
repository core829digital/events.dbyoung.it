import Link from "next/link";
import { notFound } from "next/navigation";
import { convex } from "@/lib/server/convex";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { asId } from "@/lib/server/convex";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { readTokenHash } from "@/lib/server/session";
import { publishEventAction, deleteEventAction } from "@/app/actions/backoffice";
import { EventForm } from "@/components/backoffice/EventForm";
import { SectionHeading } from "@/components/SectionHeading";

export const dynamic = "force-dynamic";

type Ev = NonNullable<FunctionReturnType<typeof api.events.adminEvent>>;

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]{20,40}$/.test(id)) notFound();
  const lang = await getLang();
  const d = t(lang).backofficePage;
  const tokenHash = (await readTokenHash())!;
  const ev = (await convex().query(api.events.adminEvent, {
    tokenHash,
    eventId: asId("events", id),
  })) as Ev | null;
  if (!ev) notFound();

  return (
    <div>
      <SectionHeading kicker={d.eventFormKicker} title={d.eventFormTitleEdit} />
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form action={publishEventAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="published" value={ev.published ? "0" : "1"} />
          <button type="submit" className={`rounded-full px-5 py-2.5 text-sm font-semibold ${ev.published ? "border border-cream/25 text-cream/80 hover:border-gold hover:text-gold" : "bg-gold text-ink hover:bg-cream"}`}>
            {ev.published ? d.unpublish : d.publish}
          </button>
        </form>
        <Link href={`/backoffice/eventi/${id}/ospiti`} className="rounded-full border border-cream/25 px-5 py-2.5 text-sm text-cream/80 hover:border-gold hover:text-gold">{d.guests}</Link>
        <Link href={`/backoffice/scan?event=${id}`} className="rounded-full border border-cream/25 px-5 py-2.5 text-sm text-cream/80 hover:border-gold hover:text-gold">{d.scan}</Link>
        <Link href={`/eventi/${ev.slug}`} target="_blank" className="rounded-full border border-cream/25 px-5 py-2.5 text-sm text-cream/60 hover:border-gold hover:text-gold">↗/eventi/{ev.slug}</Link>
      </div>
      <p className="mt-3 text-sm text-cream/60">
        {d.seatsTaken}: {ev.taken}/{ev.capacity} · {d.published}: {ev.published ? "✔" : "—"}
      </p>
      <div className="mt-8">
        <EventForm
          lang={lang}
          def={{
            id,
            slug: ev.slug,
            title: ev.title,
            tagline: ev.tagline,
            description: ev.description,
            image: ev.image,
            startAt: ev.startAt,
            endAt: ev.endAt,
            capacity: ev.capacity,
            pricePerPerson: ev.pricePerPerson,
            locationNote: ev.locationNote,
            published: ev.published,
          }}
        />
      </div>
      {ev.taken === 0 ? (
        <form action={deleteEventAction} className="mt-10">
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="rounded-full border border-red-400/40 px-5 py-2.5 text-sm text-red-300 hover:bg-red-500/10">🗑 {lang === "en" ? "Delete (founder only)" : "Elimina evento (founder)"}</button>
        </form>
      ) : null}
    </div>
  );
}
