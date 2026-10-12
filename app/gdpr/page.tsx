import { LegalPage } from "@/components/LegalPage";
import { getLang } from "@/lib/lang-server";

export const metadata = { title: "GDPR — Eventi DBYoung" };

export default async function Gdpr() {
  const lang = await getLang();
  return <LegalPage slug="gdpr" lang={lang} />;
}
