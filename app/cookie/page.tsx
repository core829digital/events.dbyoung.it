import { LegalPage } from "@/components/LegalPage";
import { getLang } from "@/lib/lang-server";

export const metadata = { title: "Cookie — Eventi DBYoung" };

export default async function Cookie() {
  const lang = await getLang();
  return <LegalPage slug="cookie" lang={lang} />;
}
