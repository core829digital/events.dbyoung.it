import QRCode from "qrcode";
import { api } from "@/convex/_generated/api";
import { convex, srvKey } from "@/lib/server/convex";
import { ticketPayload } from "@/lib/crypto";
import { guard } from "@/lib/server/req-guard";
import { rateLimit, clientIp, hashIp } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PNG del QR per un ticket.
 * Serve il QR SOLO se il ticket esiste e la prenotazione è pagata (check DB,
 * requireServer): chi indovina un codice a caso non riceve nessuna immagine.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const bad = await guard({});
  if (bad) return bad;

  const lim = rateLimit("api", hashIp(await clientIp()));
  if (!lim.ok) {
    return new Response("Too many requests", { status: 429, headers: { "retry-after": String(lim.retryAfterSec) } });
  }

  const { code } = await params;
  if (!/^[A-Z0-9]{24}$/.test(code)) return new Response("Not found", { status: 404 });

  let info: { title?: string } | null = null;
  try {
    info = await convex().query(api.tickets.paidByCode, { srvKey: srvKey(), code });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
  if (!info) return new Response("Not found", { status: 404 });

  const png = await QRCode.toBuffer(ticketPayload(code), {
    margin: 1,
    width: 512,
    errorCorrectionLevel: "M",
    color: { dark: "#1c1a17", light: "#faf8f4" },
  });
  return new Response(new Uint8Array(png), {
    headers: {
      "content-type": "image/png",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
    },
  });
}
