import "server-only";
import { Resend } from "resend";

/**
 * Email transazionali (Resend) — QR inclusi come link PNG firmati serviti
 * dall'endpoint /api/qr, così le immagini passano in qualunque client mail.
 * In dev (senza RESEND_API_KEY) logga in console invece di inviare.
 */

const BRAND = "Eventi DBYoung";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");
}

function qrEndpointUrl(code: string): string {
  return `${siteUrl()}/api/qr/${encodeURIComponent(code)}`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmtDate(ms: number, lang: string): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(ms));
}

export type ConfirmationInput = {
  email: string;
  lang: "it" | "en";
  contactName: string;
  eventTitle: string;
  eventStartAt: number;
  quantity: number;
  amountCents: number;
  tickets: Array<{ name: string; surname: string; code: string }>;
};

export async function sendBookingConfirmation(t: ConfirmationInput): Promise<{ sent: boolean; dev?: true }> {
  const it = t.lang === "it";
  const lines = t.tickets
    .map((p, i) => {
      const url = qrEndpointUrl(p.code);
      return `
      <div style="margin:0 0 14px 0">
        <p style="margin:0 0 6px 0;font-weight:600">${i + 1}. ${esc(p.name)} ${esc(p.surname)}</p>
        <div style="padding:14px;border:1px solid #e2ded2;border-radius:14px;max-width:280px;text-align:center;background:#faf8f4">
          <img src="${url}" alt="QR ticket ${i + 1}" width="220" height="220" style="display:inline-block;border:0"/>
        </div>
      </div>`;
    })
    .join("");

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,Arial,sans-serif;color:#1c1a17;max-width:560px">
    <p style="font-size:12px;letter-spacing:.25em;text-transform:uppercase;color:#b3924a">${BRAND}</p>
    <h1 style="font-size:24px;margin:8px 0">${it ? "Prenotazione confermata" : "Booking confirmed"}</h1>
    <p>${it ? "Ciao" : "Hi"} ${esc(t.contactName)}.${it ? " Ci vediamo in tenuta!" : " See you at the estate!"}</p>
    <table style="font-size:14px;margin:14px 0">
      <tr><td style="padding:2px 12px 2px 0;color:#6b6459">${it ? "Evento" : "Event"}</td><td><b>${esc(t.eventTitle)}</b></td></tr>
      <tr><td style="padding:2px 12px 2px 0;color:#6b6459">${it ? "Data e ora" : "Date & time"}</td><td>${fmtDate(t.eventStartAt, t.lang)}</td></tr>
      <tr><td style="padding:2px 12px 2px 0;color:#6b6459">${it ? "Partecipanti" : "Guests"}</td><td>${t.quantity}</td></tr>
    </table>
    <p>${it
      ? "Ognuno riceve <b>il proprio QR</b>: verrà scansionato all'ingresso, un QR per persona."
      : "Each guest has <b>their own QR</b>: it's scanned at the entrance, one QR per person."}</p>
    ${lines}
    <p style="font-size:12px;color:#6b6459">${it
      ? "Se i QR non compaiono, attiva le immagini remote o scrivi a contact@dbyoung.it."
      : "If the QR don't appear, enable remote images or write to contact@dbyoung.it."}</p>
    <hr/>
    <p style="font-size:12px;color:#8a7a3c">events.dbyoung.it · Fattoria Isola, Laterina (AR)</p>
  </div>`;

  const subject = it
    ? `I tuoi QR per ${t.eventTitle} — ${BRAND}`
    : `Your QR tickets for ${t.eventTitle} — ${BRAND}`;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(
      `[events] RESEND_API_KEY assente — "${subject}" non inviata a ${t.email}. QR: ${t.tickets.map((x) => qrEndpointUrl(x.code)).join(", ")}`,
    );
    return { sent: false, dev: true };
  }
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? `${BRAND} <contact@dbyoung.it>`,
    to: [t.email],
    subject,
    html,
  });
  if (error) return { sent: false };
  return { sent: true };
}
