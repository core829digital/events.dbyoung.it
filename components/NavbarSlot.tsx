import { getLang } from "@/lib/lang-server";
import { Navbar } from "./Navbar";

/** Async server component: va usato dentro <Suspense> nel layout. */
export async function NavbarSlot() {
  const lang = await getLang();
  return <Navbar lang={lang} />;
}
