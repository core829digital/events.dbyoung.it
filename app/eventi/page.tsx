import { EventCards } from "@/components/EventCards";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata = { title: "Eventi — Isola Events" };

export default function EventiPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <SectionHeading kicker="Eventi · Isola Events" title="Due modi di vivere la tenuta." sub="Tipo 1 — Eventi organizzati da Dimitri Bouterline. Tipo 2 — Eventi che organizzi tu in Fattoria Isola, con il nostro supporto se lo vuoi." />
      <h3 className="mb-4 mt-10 font-display text-2xl text-gold">Tipo 1 · Firmati Dimitri</h3>
      <EventCards filter="dimitri" />
      <h3 className="mb-4 mt-12 font-display text-2xl text-gold">Tipo 2 · Organizza tu in location</h3>
      <EventCards filter="terzi" />
    </div>
  );
}
