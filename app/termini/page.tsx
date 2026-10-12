import { LegalPage } from "@/components/LegalPage";
import { getLang } from "@/lib/lang-server";

export const metadata = { title: "Termini — Eventi DBYoung" };

export default async function Termini() {
  const lang = await getLang();
  return <LegalPage slug="termini" lang={lang} />;
}
