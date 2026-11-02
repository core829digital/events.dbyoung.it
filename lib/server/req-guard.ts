import "server-only";
import { headers } from "next/headers";

/**
 * Guardie server-side per le route API / pagine sensibili:
 * - Host allowlist: rifiuta richieste dirette a un host non consentito
 *   (il bind effettivo viene fatto dalla piattaforma; qui validiamo il dominio
 *   dichiarato via X-Forwarded-Host / Host).
 * - IP allowlist (solo per il backoffice), configurabile a env:
 *   BACKOFFICE_IP_ALLOWLIST="203.0.113.7, 203.0.113.8" (vuoto = disattivo).
 */

export async function requestIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

const DEV_HOSTS = new Set([
  "localhost:3100",
  "127.0.0.1:3100",
  "localhost:3000",
  "127.0.0.1:3000",
]);

export async function hostAllowed(): Promise<boolean> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").toLowerCase();
  if (!host) return false;
  if (process.env.NODE_ENV !== "production" && DEV_HOSTS.has(host)) return true;
  const allowed = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/^https?:\/\//, "").toLowerCase();
  if (!allowed) return false;
  return host === allowed.replace(/\/$/, "") || host === `www.${allowed.replace(/\/$/, "")}`;
}

export async function backofficeIpAllowed(): Promise<boolean> {
  const list = (process.env.BACKOFFICE_IP_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0) return true; // disattivo
  const ip = await requestIp();
  return list.includes(ip);
}

/** Ritorna una Response di errore se la guardia fallisce, altrimenti null. */
export async function guard(opts: { backoffice?: boolean }): Promise<Response | null> {
  if (!(await hostAllowed())) {
    return new Response("Not found", { status: 404 });
  }
  if (opts.backoffice && !(await backofficeIpAllowed())) {
    return new Response("Forbidden", { status: 403 });
  }
  return null;
}
