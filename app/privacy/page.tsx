import { LegalPage } from "@/components/LegalPage";
import { getLang } from "@/lib/lang-server";

export const metadata = { title: "Privacy — Eventi DBYoung" };

export default async function Privacy() {
  const lang = await getLang();
  return <LegalPage slug="privacy" lang={lang} />;
}
