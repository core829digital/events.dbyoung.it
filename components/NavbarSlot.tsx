import { getLang } from "@/lib/lang-server";
import { getSessionUser } from "@/lib/server/session";
import { Navbar } from "./Navbar";

/** Async server component: va usato dentro <Suspense> nel layout. */
export async function NavbarSlot() {
  const [lang, user] = await Promise.all([getLang(), getSessionUser()]);
  return <Navbar lang={lang} user={user} />;
}
