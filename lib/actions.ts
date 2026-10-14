"use server";

import { cookies } from "next/headers";
import { LANG_COOKIE, type Lang } from "./i18n";

/** Imposta il cookie lingua dal selettore (chiamata dal client). */
export async function setLangCookie(lang: Lang) {
  (await cookies()).set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
}
