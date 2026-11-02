import { NextResponse, type NextRequest } from "next/server";

/**
 * Protezioni perimetrali (OWASP A05/A09 + best practice):
 * - Security headers su tutte le risposte: CSP, nosniff, frame-ancestors,
 *   Referrer-Policy, Permissions-Policy (camera solo first-party per lo
 *   scanner del backoffice).
 * - Host allowlist: rifiuta richieste servite con Host/X-Forwarded-Host
 *   estranei al dominio del sito (anti DNS-rebinding / host spoofing).
 * - IP allowlist del backoffice: valutata SOLO server-side in
 *   app/backoffice/layout + /api/backoffice/* (env BACKOFFICE_IP_ALLOWLIST).
 */

const DEFAULT_HOSTS = ["events.dbyoung.it", "www.events.dbyoung.it"];
const DEV_HOSTS = ["localhost:3100", "127.0.0.1:3100", "localhost:3000", "127.0.0.1:3000"];

function csp(dev: boolean): string {
  return [
    "default-src 'self'",
    // Next inline bootstrap + framer-motion inline; eval仅在 dev per HMR
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://fattoriaisola.com",
    "font-src 'self'",
    "connect-src 'self'",
    // widget Calendly (hero + organizza)
    "frame-src https://calendly.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    dev ? "upgrade-insecure-requests" : "upgrade-insecure-requests",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const dev = process.env.NODE_ENV !== "production";

  // Host allowlist (edge, prima di qualunque rendering — no PII nei log)
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  const configured = (process.env.NEXT_PUBLIC_SITE_URL ?? "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
  const allowed = new Set(configured ? [configured, `www.${configured.replace(/^www\./, "")}`] : DEFAULT_HOSTS);
  if (dev) DEV_HOSTS.forEach((h) => allowed.add(h));
  if (!host || !allowed.has(host)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", csp(dev));
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  );
  if (!dev) {
    // HSTS: solo produzione (localhost non è https)
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
