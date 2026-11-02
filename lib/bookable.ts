import { api } from "@/convex/_generated/api";
import { convex } from "@/lib/server/convex";
import type { FunctionReturnType } from "convex/server";
import type { Lang } from "@/lib/i18n";

export type PublicUpcoming = FunctionReturnType<typeof api.events.publicUpcoming>;
export type UpcomingEvent = NonNullable<FunctionReturnType<typeof api.events.publicEventById>>;

export function fmtDate(ms: number, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

export function fmtDay(ms: number, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

export function euro(n: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "en" ? "en-IE" : "it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export async function fetchUpcoming(): Promise<PublicUpcoming> {
  return (await convex().query(api.events.publicUpcoming, {})) as PublicUpcoming;
}
