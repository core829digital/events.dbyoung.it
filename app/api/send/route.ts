import { NextResponse } from "next/server";
import { Resend } from "resend";
import { quoteSchema } from "@/lib/validators";
import { site, events } from "@/lib/site";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi" }, { status: 400 });
  }
  const q = parsed.data;
  const ev = events.find((e) => e.slug === q.eventSlug);

  if (!process.env.RESEND_API_KEY) {
    console.warn("[events] RESEND_API_KEY mancante — loggo la richiesta:", q);
    return NextResponse.json({ ok: true, dev: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const kindLabel = q.kind === "dimitri" ? "Evento firmato Dimitri" : "Evento organizzato in location";
  const subject = `Nuova richiesta ${kindLabel} — ${q.name} — ${q.date}`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? site.emailFrom,
    to: [process.env.BOOKING_TO ?? site.emailTo],
    replyTo: q.email,
    subject,
    html: `
      <h2>${kindLabel}</h2>
      <p><b>Nome:</b> ${q.name}<br/><b>Email:</b> ${q.email}<br/><b>Tel:</b> ${q.phone}</p>
      <p><b>Data:</b> ${q.date} · <b>Ospiti:</b> ${q.guests}<br/><b>Format:</b> ${ev?.title ?? "Da definire"}</p>
      <p><b>Idea:</b></p><p>${q.message.replace(/\n/g, "<br/>")}</p>
      <hr/><p style="color:#666">events.dbyoung.it · Fattoria Isola</p>`,
  });
  if (error) return NextResponse.json({ error: "Invio email non riuscito" }, { status: 502 });

  // Conferma all'utente (best-effort)
  await resend.emails.send({
    from: process.env.RESEND_FROM ?? site.emailFrom,
    to: [q.email],
    subject: "Abbiamo ricevuto la tua richiesta — Isola Events",
    html: `<p>Ciao ${q.name},</p><p>grazie! Ti risponderemo entro 24–48h per il tuo evento del ${q.date} (${q.guests} ospiti).</p><p>Nel frattempo puoi prenotare la call gratuita su events.dbyoung.it/organizza.</p><p>— Dimitri & Isola Events · Fattoria Isola</p>`,
  }).catch(() => undefined);

  return NextResponse.json({ ok: true });
}
