import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
 * Rate limiter in-memory (finestra scorrevole). Sufficiente per istanza
 * singola / dev; in produzione Vercel aggiunge WAF/DDoS a livello piattaforma.
 */
type Bucket = { hits: number[]; };
const buckets = new Map<string, Bucket>();

export const LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, max: 8 }, // login/registrati: 8 / 15min per IP
  booking: { windowMs: 60 * 60 * 1000, max: 6 }, // prenotazioni: 6 / ora per utente
  review: { windowMs: 60 * 60 * 1000, max: 4 },
  api: { windowMs: 60 * 1000, max: 60 }, // endpoint pubblici: 60 / min per IP
  scan: { windowMs: 60 * 1000, max: 160 }, // scanner backoffice: battiti rapidi
  loginAttemptsPerAccount: { windowMs: 15 * 60 * 1000, max: 5 },
} as const;

export type LimitName = keyof typeof LIMITS;

export function rateLimit(name: LimitName, key: string): { ok: boolean; retryAfterSec: number } {
  const { windowMs, max } = LIMITS[name];
  const bucketKey = `${name}:${key}`;
  const now = Date.now();
  const bucket = buckets.get(bucketKey) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= max) {
    buckets.set(bucketKey, bucket);
    const retryAfterSec = Math.ceil((windowMs - (now - bucket.hits[0])) / 1000);
    return { ok: false, retryAfterSec };
  }
  bucket.hits.push(now);
  buckets.set(bucketKey, bucket);

  // pulizia periodica (mantiene la mappa piccola)
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.hits.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }
  return { ok: true, retryAfterSec: 0 };
}

/** IP reale dell'utente (server only) — mai affidabile da input utente. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd ?? h.get("x-real-ip") ?? "unknown";
}

/** IP anonymizzato: solo i 4 __ fondamentali per il rate-limit, senza log PII. */
export function hashIp(ip: string): string {
  const salt = process.env.SERVER_SECRET ?? "no-secret";
  return makeFullHash(`${salt}|${ip}`).slice(0, 24);
}

function makeFullHash(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
