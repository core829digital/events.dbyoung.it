import { cookies } from "next/headers";
import { LANG_COOKIE, type Lang } from "./i18n";

/** Legge la lingua dal cookie (solo Server Components / Route). */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get(LANG_COOKIE)?.value === "en" ? "en" : "it";
}
