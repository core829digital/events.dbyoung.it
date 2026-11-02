import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { SectionHeading } from "@/components/SectionHeading";
import { EventForm } from "@/components/backoffice/EventForm";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const lang = await getLang();
  const d = t(lang).backofficePage;
  return (
    <div>
      <SectionHeading kicker={d.eventFormKicker} title={d.eventFormTitleNew} sub={d.eventFormTitleNewSub} />
      <div className="mt-8">
        <EventForm lang={lang} />
      </div>
    </div>
  );
}
