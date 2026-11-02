import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";

/**
 * Primitivi crittografici server-only (Node runtime).
 * - Password: scrypt (N=2^16 costante implicita default, salt 16B)
 * - Token sessione: 32 byte random → sha256 memorizzato, origine nel cookie
 * - Firma QR payload: HMAC-SHA256 con SERVER_SECRET (mai direttamente al client)
 */

const SCRYPT_KEYLEN = 64;

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function randomCode(len = 24): string {
  // alfabeto senza caratteri ambigui (0/O, 1/I)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buf = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[buf[i] % alphabet.length];
  return out;
}

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function hmacHex(payload: string): string {
  const secret = process.env.SERVER_SECRET;
  if (!secret) throw new Error("SERVER_SECRET mancante");
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ab.length !== bb.length || ab.length === 0) return false;
  return timingSafeEqual(ab, bb);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password.normalize("NFKC"), salt, SCRYPT_KEYLEN, {
    N: 2 ** 15,
    r: 8,
    p: 1,
    // default maxmem Node (32MB) è al limite esatto: altrimenti RangeError
    maxmem: 64 * 1024 * 1024,
  }).toString("hex");
  return `s2$32768$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, nStr, salt, hash] = stored.split("$");
    if (scheme !== "s2") return false;
    const derived = scryptSync(password.normalize("NFKC"), salt, SCRYPT_KEYLEN, {
      N: Number(nStr),
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    });
    const actual = Buffer.from(hash, "hex");
    return derived.length === actual.length && timingSafeEqual(derived, actual);
  } catch {
    return false;
  }
}

/**
 * Payload QR: `EVQ1` + codice (24 char) + HMAC(code) troncato 32 hex.
 * Formato compatto e imfezionabile/fakeable solo col server secret.
 */
export function ticketPayload(code: string): string {
  return `EVQ1${code}${signTicketCode(code)}`;
}

/**
 * Firma del ticket: verifica conforme in safeEqual.
 */
export function signTicketCode(code: string): string {
  return hmacHex(`DBQ|${code}`).slice(0, 32);
}

export function verifyTicketPayload(raw: string): { code: string } | null {
  if (typeof raw !== "string" || !raw.startsWith("EVQ1")) return null;
  const body = raw.slice(4);
  const m = /^([A-Z0-9]{24})([a-f0-9]{32})$/.exec(body);
  if (!m || !safeEqualHex(signTicketCode(m[1]), m[2])) return null;
  return { code: m[1] };
}
