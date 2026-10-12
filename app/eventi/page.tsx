import { EventCards } from "@/components/EventCards";
import { SectionHeading } from "@/components/SectionHeading";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";


export const metadata = { title: "Eventi — Eventi DBYoung" };

export default async function EventiPage() {
  const lang = await getLang();
  const d = t(lang).eventiPage;
  return (
    <div className="w-full px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
      <SectionHeading kicker={d.kicker} title={d.title} sub={d.sub} />
      <h3 className="mb-4 mt-10 font-display text-2xl text-gold">{d.type1}</h3>
      <EventCards filter="dimitri" lang={lang} />
      <h3 className="mb-4 mt-12 font-display text-2xl text-gold">{d.type2}</h3>
      <EventCards filter="terzi" lang={lang} />
    </div>
  );
}
