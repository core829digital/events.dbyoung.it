import { convex } from "@/lib/server/convex";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { readTokenHash } from "@/lib/server/session";
import { QrScannerPanel } from "@/components/backoffice/QrScannerPanel";
import { SectionHeading } from "@/components/SectionHeading";

export const dynamic = "force-dynamic";

type Ev = FunctionReturnType<typeof api.events.adminList>[number];

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const [{ event }, lang] = await Promise.all([searchParams, getLang()]);
  const d = t(lang).backofficePage;
  const tokenHash = (await readTokenHash())!;
  const all = (await convex().query(api.events.adminList, { tokenHash })) as Ev[];
  // eventi futuri e di oggi in testa (quelli passati in fondo, comunque consultabili)
  // — l'ordine usa il flag isPast calcolato in Convex, niente Date.now() nel render
  const future = all
    .filter((e) => e.published && !e.isPast)
    .sort((a, b) => a.startAt - b.startAt);
  const past = all
    .filter((e) => e.published && e.isPast)
    .sort((a, b) => b.startAt - a.startAt);
  const events = [...future, ...past].map((e) => ({ id: String(e._id), title: e.title, startAt: e.startAt }));

  return (
    <div>
      <SectionHeading kicker={d.kicker} title={d.scanTitle} sub={d.scanHint} />
      <div className="mt-8">
        {events.length ? (
          <QrScannerPanel lang={lang} events={events} defaultEventId={event} />
        ) : (
          <p className="text-cream/60">{d.none}</p>
        )}
      </div>
    </div>
  );
}
