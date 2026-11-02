import { api } from "@/convex/_generated/api";
import { convex } from "@/lib/server/convex";
import { verifyTicketPayload } from "@/lib/crypto";
import { guard } from "@/lib/server/req-guard";
import { rateLimit, clientIp, hashIp } from "@/lib/server/rate-limit";
import { readTokenHash } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Check-in ingresso evento (SOLO backoffice: admin | founder).
 * Body json: { payload?: "EVQ1...firma", code?: "XXXX..." (inserimento manuale),
 *              eventId }
 * - firma HMAC validator prima di tutto (anti-fake QR)
 * - Convex verifica ruolo admin|founder + evento giusto + doppione
 */
const ERRORS: Record<string, string> = {
  "404 ticket": "Ticket non trovato.",
  "409 wrong-event": "Il ticket non appartiene a questo evento.",
  "409 already": "Già registrato in ingresso.",
  "403": "Non autorizzato.",
};

export async function POST(req: Request) {
  const bad = await guard({ backoffice: true });
  if (bad) return bad;

  const lim = rateLimit("scan", hashIp(await clientIp()));
  if (!lim.ok) {
    return Response.json({ error: "Rallenta.", rateLimited: true }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { payload?: string; code?: string; eventId?: string } | null;
  if (!body || typeof body.eventId !== "string" || !/^[a-z0-9]{20,40}$/.test(body.eventId)) {
    return Response.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  // payload QR firmato OPPURE codice scritto a mano (stesso percorso)
  let code: string | null = null;
  if (body.payload) {
    const verified = verifyTicketPayload(body.payload.trim());
    if (!verified) return Response.json({ error: "QR non valido (firma errata)." }, { status: 400 });
    code = verified.code;
  } else if (body.code && /^[A-Z0-9]{24}$/.test(body.code)) {
    code = body.code;
  }
  if (!code) return Response.json({ error: "Codice mancante o malformato." }, { status: 400 });

  const tokenHash = await readTokenHash();
  if (!tokenHash) return Response.json({ error: "Sessione scaduta: ri-effettua l'accesso." }, { status: 401 });

  try {
    const ok = await convex().mutation(api.tickets.checkIn, {
      tokenHash,
      eventId: body.eventId as never,
      code,
    });
    return Response.json({
      ok: true,
      personIndex: ok.personIndex,
      name: ok.name,
      surname: ok.surname,
      code,
    });
  } catch (e) {
    // ConvexHttpClient incapsula il messaggio ("[Request ID…] Uncaught
    // ConvexError: 409 already"): normalizziamo cercando la chiave nota.
    const raw = e instanceof Error ? e.message : String(e);
    const errKey = (Object.keys(ERRORS) as Array<keyof typeof ERRORS>).find((k) => raw.includes(k)) ?? "409";
    return Response.json(
      { ok: false, error: ERRORS[errKey] ?? "Stato non accettato.", code },
      { status: errKey === "404 ticket" ? 404 : errKey === "403" ? 403 : 409 },
    );
  }
}
