import "server-only";
import { createHash } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Client Convex SOLO LATO SERVER.
 * - URL: NEXT_PUBLIC_CONVEX_URL (in dev è il backend locale 127.0.0.1:3210).
 * - Tutte le funzioni sensibili richiedono tokenHash (sessione valida) oppure
 *   srvKey (hash del SERVER_SECRET): mai trasmesse al browser.
 */
let cached: ConvexHttpClient | null = null;

export function convex(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL mancante");
  if (!cached) cached = new ConvexHttpClient(url);
  return cached;
}

/** Hash del secret server-only passato alle funzioni Convex guardate. */
export function srvKey(): string {
  const secret = process.env.SERVER_SECRET;
  if (!secret) throw new Error("SERVER_SECRET mancante");
  return createHash("sha256").update(secret).digest("hex");
}

type IdNames = "users" | "events" | "bookings" | "tickets" | "reviews";
/** Cast server-side di un id (stringa walidata da zod) nel tipo Convex. */
export function asId<T extends IdNames>(name: T, s: string): Id<T> {
  if (!/^[a-z0-9]{20,40}$/.test(s)) throw new Error("id non valido");
  void name;
  return s as unknown as Id<T>;
}
