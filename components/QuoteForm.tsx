"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { events } from "@/lib/site";
import { quoteSchema } from "@/lib/validators";

export function QuoteForm() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<"dimitri" | "terzi">("dimitri");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const raw = {
      kind,
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      date: String(fd.get("date") ?? ""),
      guests: Number(fd.get("guests") ?? 0),
      eventSlug: String(fd.get("eventSlug") ?? ""),
      message: String(fd.get("message") ?? ""),
      privacy: fd.get("privacy") === "on",
    };
    const parsed = quoteSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Controlla i campi");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("Invio non riuscito, riprova o scrivi a booking@dbyoung.it");
      router.push("/grazie");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di invio");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="grid grid-cols-2 gap-2 rounded-full bg-ink p-1 text-sm">
        {(["dimitri", "terzi"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-full py-2.5 font-semibold ${kind === k ? "bg-gold text-ink" : "text-cream/70 hover:text-cream"}`}
          >
            {k === "dimitri" ? "Evento firmato Dimitri" : "Organizzo io in location"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Nome e cognome<input name="name" required className="mt-1 w-full rounded-xl bg-ink px-3 py-2.5 text-cream outline-none ring-gold/40 focus:ring-2" placeholder="Maria Rossi" /></label>
        <label className="text-sm">Email<input name="email" type="email" required className="mt-1 w-full rounded-xl bg-ink px-3 py-2.5 text-cream outline-none focus:ring-2 focus:ring-gold/40" placeholder="maria@email.it" /></label>
        <label className="text-sm">Telefono<input name="phone" required className="mt-1 w-full rounded-xl bg-ink px-3 py-2.5 text-cream outline-none focus:ring-2 focus:ring-gold/40" placeholder="+39 ..." /></label>
        <label className="text-sm">Data desiderata<input name="date" type="date" required className="mt-1 w-full rounded-xl bg-ink px-3 py-2.5 text-cream outline-none focus:ring-2 focus:ring-gold/40" /></label>
        <label className="text-sm">Ospiti<input name="guests" type="number" min={2} max={500} defaultValue={60} required className="mt-1 w-full rounded-xl bg-ink px-3 py-2.5 text-cream outline-none focus:ring-2 focus:ring-gold/40" /></label>
        <label className="text-sm">Format
          <select name="eventSlug" className="mt-1 w-full rounded-xl bg-ink px-3 py-2.5 text-cream outline-none focus:ring-2 focus:ring-gold/40">
            <option value="">Da definire in call</option>
            {events.filter((ev) => ev.kind === kind).map((ev) => (
              <option key={ev.slug} value={ev.slug}>{ev.title}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-4 block text-sm">La tua idea<textarea name="message" required minLength={10} rows={4} className="mt-1 w-full rounded-xl bg-ink px-3 py-2.5 text-cream outline-none focus:ring-2 focus:ring-gold/40" placeholder="Matrimonio di 80 persone a giugno, rito in cappella, cena a bordo piscina..." /></label>
      <label className="mt-4 flex items-start gap-2 text-xs text-cream/70">
        <input name="privacy" type="checkbox" className="mt-0.5" /> Ho letto e accetto la <a href="/privacy" className="underline">Privacy Policy</a>.
      </label>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button disabled={sending} className="mt-5 w-full rounded-full bg-gold py-3 font-semibold text-ink hover:bg-cream disabled:opacity-60">
        {sending ? "Invio..." : "Invia la richiesta →"}
      </button>
      <p className="mt-2 text-center text-xs text-cream/50">Risposta entro 24–48h · oppure prenota subito la call qui sotto</p>
    </form>
  );
}
