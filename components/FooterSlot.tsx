import { getLang } from "@/lib/lang-server";
import { Footer } from "./Footer";

/** Async server component: va usato dentro <Suspense> nel layout. */
export async function FooterSlot() {
  const lang = await getLang();
  return <Footer lang={lang} />;
}
