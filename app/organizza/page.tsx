import nextDynamic from "next/dynamic";
import { SectionHeading } from "@/components/SectionHeading";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";


const QuoteForm = nextDynamic(() => import("@/components/QuoteForm").then((m) => m.QuoteForm), {
  loading: () => <div className="h-96 animate-pulse rounded-3xl bg-white/5" />,
});
const CalendlyEmbed = nextDynamic(() => import("@/components/CalendlyEmbed").then((m) => m.CalendlyEmbed), {
  loading: () => <div className="h-96 animate-pulse rounded-3xl bg-white/5" />,
});

export const metadata = { title: "Organizza — Isola Events" };

export default async function OrganizzaPage() {
  const lang = await getLang();
  const d = t(lang).organizzaPage;
  return (
    <div className="w-full px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
      <SectionHeading kicker={d.kicker} title={d.title} sub={d.sub} />
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <QuoteForm lang={lang} />
        <CalendlyEmbed lang={lang} />
      </div>
    </div>
  );
}
