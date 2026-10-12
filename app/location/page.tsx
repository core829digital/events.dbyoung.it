import dynamic from "next/dynamic";
import { SectionHeading } from "@/components/SectionHeading";
import { spaces, site } from "@/lib/site";

const Gallery = dynamic(() => import("@/components/Gallery").then((m) => m.Gallery), {
  loading: () => <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/5 md:h-56" />)}</div>,
});

export const metadata = { title: "Location — Fattoria Isola" };

const appartamenti = [
  ["Colombaia", "55 mq · 5 persone · 1° piano · camera tripla con baldacchino + soggiorno con divano-letto, vista campagna"],
  ["Mulino", "50 mq · 5 persone · piano terra · terrazza vista piscina + camino per la stagione fredda"],
  ["Fattoria", "80 mq · 6 persone · scala privata · 2 triple + mobili antichi veri, giardino con gazebo"],
  ["Officina", "45 mq · 4 persone · piano terra · matrimoniale + divano-letto, terrazza coperta"],
  ["Falegnameria", "60 mq · 6 persone · piano terra accessibile · 2 triple + soggiorno, terrazza"],
];

export default function LocationPage() {
  return (
    <div className="w-full px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
      <SectionHeading
        kicker="Location · Fattoria Isola"
        title="Villa '600, parco, piscina, cappella e 5 appartamenti."
        sub="Azienda agricola da 200+ ettari a 500 m da Laterina: Chianti, olio EVO, granturco e girasole; riserva faunistica; pensione cavalli. Come raggiungerci: A1 Valdarno (da Firenze) / Arezzo (da Roma), treni regionali a Laterina 5 km e Montevarchi 15 km, aeroporti Firenze 60 km · Pisa 140 km · Fiumicino 200 km."
      />
      <div className="mt-8"><Gallery /></div>

      <h2 className="mt-14 font-display text-3xl text-cream">Spazi per eventi</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {spaces.map((s) => (
          <div key={s.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="font-display text-xl">{s.name}</p>
            <p className="mt-1 text-sm text-cream/65">{s.detail}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 font-display text-3xl text-cream">Dormire in tenuta · 26 posti</h2>
      <ul className="mt-4 space-y-3 text-cream/80">
        {appartamenti.map(([n, d]) => (
          <li key={n} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <b className="text-cream">{n}.</b> {d}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-cream/60">
        Cucine attrezzate, wi-fi, spazi esterni privati con tavolo e sedie. Fonte: {site.fattoria}
      </p>
    </div>
  );
}
