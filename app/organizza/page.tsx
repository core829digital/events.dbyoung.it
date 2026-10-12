import { QuoteForm } from "@/components/QuoteForm";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata = { title: "Organizza — Isola Events" };

export default function OrganizzaPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
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
