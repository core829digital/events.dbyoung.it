import dynamic from "next/dynamic";
import { SectionHeading } from "@/components/SectionHeading";

const QuoteForm = dynamic(() => import("@/components/QuoteForm").then((m) => m.QuoteForm), {
  loading: () => <div className="h-96 animate-pulse rounded-3xl bg-white/5" />,
});
const CalendlyEmbed = dynamic(() => import("@/components/CalendlyEmbed").then((m) => m.CalendlyEmbed), {
  loading: () => <div className="h-96 animate-pulse rounded-3xl bg-white/5" />,
});

export const metadata = { title: "Organizza — Isola Events" };

export default function OrganizzaPage() {
  return (
    <div className="w-full px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
      <SectionHeading
        kicker="Organizza"
        title="Raccontaci l'idea, al resto pensiamo noi."
        sub="Due strade: partecipa a un evento firmato Dimitri, oppure organizza il tuo in location. Compila per il preventivo (risposta 24–48h) oppure prenota subito la call gratuita da 30 min."
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <QuoteForm />
        <CalendlyEmbed />
      </div>
    </div>
  );
}
