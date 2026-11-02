import "server-only";
import { cookies } from "next/headers";
import { randomToken, sha256Hex } from "@/lib/crypto";
import { api } from "@/convex/_generated/api";
import { asId, convex, srvKey } from "./convex";

/**
 * Sessioni: token opaco in cookie httpOnly + hash sha256 salvato su Convex.
 * - cookie `ev-sess`: solo stringa casuale, nessun dato personale
 * - il client non vede il token (httpOnly); le funzioni Convex ricevono
 *   solo l'hash come argomento
 */
export const SESSION_COOKIE = "ev-sess";
const SESSION_TTL_MS = 30 * 24 * 3600 * 1000; // 30 giorni

export type SessionUser = {
  name: string;
  surname: string;
  email: string;
  role: "client" | "admin" | "founder";
};

export async function readTokenHash(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  return sha256Hex(token);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const hash = await readTokenHash();
  if (!hash) return null;
  try {
    return ((await convex().query(api.secure.me, { tokenHash: hash })) ?? null) as SessionUser | null;
  } catch {
    return null;
  }
}

/** Set cookie `ev-sess` e crea la riga `sessions` (hash del token). */
export async function createSessionForUser(userId: string, ipHash?: string) {
  const token = randomToken(32);
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await convex().mutation(api.secure.createSession, {
    srvKey: srvKey(),
    tokenHash: sha256Hex(token),
    userId: asId("users", userId),
    expiresAt,
    ipHash,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function destroySession() {
  const hash = await readTokenHash();
  if (hash) {
    try {
      await convex().mutation(api.secure.logoutByToken, { tokenHash: hash });
    } catch {
      // best-effort: il cookie viene comunque invalidato
    }
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Guard per le pagine: null se non autenticato o fuori ruolo. */
export async function requireUser(roles?: SessionUser["role"][]): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;
  return user;
}
