import { NextResponse } from "next/server";
import { Resend } from "resend";
import { quoteSchema } from "@/lib/validators";
import { site, events, localizeEvent } from "@/lib/site";
import type { Lang } from "@/lib/i18n";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lang: Lang = body?.lang === "en" ? "en" : "it";
  const parsed = quoteSchema(lang).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Error" }, { status: 400 });
  }
  const q = parsed.data;
  const ev = events.find((e) => e.slug === q.eventSlug);
  const evTitle = ev ? localizeEvent(ev, lang).title : lang === "it" ? "Da definire" : "To be defined";

  if (!process.env.RESEND_API_KEY) {
    console.warn("[events] RESEND_API_KEY mancante — loggo la richiesta:", q);
    return NextResponse.json({ ok: true, dev: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const kindLabel = q.kind === "dimitri"
    ? lang === "it" ? "Evento firmato Dimitri" : "Curated by Dimitri event"
    : lang === "it" ? "Evento organizzato in location" : "Venue-hosted event";
  const subject = `Nuova richiesta ${kindLabel} — ${q.name} — ${q.date}`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? site.emailFrom,
    to: [process.env.BOOKING_TO ?? site.emailTo],
    replyTo: q.email,
    subject,
    html: `
      <h2>${kindLabel}</h2>
      <p><b>Nome:</b> ${q.name}<br/><b>Email:</b> ${q.email}<br/><b>Tel:</b> ${q.phone}</p>
      <p><b>Data:</b> ${q.date} · <b>Ospiti:</b> ${q.guests}<br/><b>Format:</b> ${evTitle}</p>
      <p><b>Idea:</b></p><p>${q.message.replace(/\n/g, "<br/>")}</p>
      <hr/><p style="color:#666">events.dbyoung.it · Fattoria Isola</p>`,
  });
  if (error) return NextResponse.json({ error: "Email failed" }, { status: 502 });

  // Conferma all'utente nella sua lingua (best-effort)
  const confirm = lang === "it"
    ? { subject: "Abbiamo ricevuto la tua richiesta — Eventi DBYoung", body: `<p>Ciao ${q.name},</p><p>grazie! Ti risponderemo entro 24–48h per il tuo evento del ${q.date} (${q.guests} ospiti).</p><p>Nel frattempo puoi prenotare la call gratuita su events.dbyoung.it/organizza.</p><p>— Dimitri & Eventi DBYoung · Fattoria Isola</p>` }
    : { subject: "We received your request — Eventi DBYoung", body: `<p>Hi ${q.name},</p><p>thank you! We'll reply within 24–48h about your event on ${q.date} (${q.guests} guests).</p><p>Meanwhile you can book a free call at events.dbyoung.it/organizza.</p><p>— Dimitri & Eventi DBYoung · Fattoria Isola</p>` };
  await resend.emails.send({
    from: process.env.RESEND_FROM ?? site.emailFrom,
    to: [q.email],
    subject: confirm.subject,
    html: confirm.body,
  }).catch(() => undefined);

  return NextResponse.json({ ok: true });
}
