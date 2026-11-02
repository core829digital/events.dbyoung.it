"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createBookingAction, type BookingFormState } from "@/app/actions/booking";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

const inputCls =
  "w-full rounded-2xl border border-cream/20 bg-white/5 px-3.5 py-2.5 text-cream placeholder-cream/30 outline-none focus:border-gold focus:bg-white/10";

type Person = { name: string; surname: string; dob: string; cf: string };
const empty = (): Person => ({ name: "", surname: "", dob: "", cf: "" });

/**
 * Widget di prenotazione mobile-first.
 * 1) quantità persone (1..min(remaining,20))
 * 2) recapito + dettagli per persona (nome, cognome, data nascita, codice fiscale)
 * 3) action server → Stripe Checkout (o simulazione dev).
 * Niente happen client-side: tutto validato NUOVAMENTE server-side.
 */
export function BookWidget({
  eventId,
  lang,
  remaining,
  price,
  title,
  next,
}: {
  eventId: string;
  lang: Lang;
  remaining: number;
  price: number;
  title: string;
  next?: string;
}) {
  const d = t(lang).booking;
  const a = t(lang).accountPage;
  const [state, formAction, pending] = useActionState<BookingFormState, FormData>(createBookingAction, {});
  const [qty, setQty] = useState(1);
  const [people, setPeople] = useState<Person[]>([empty()]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  if (state.error === "Effettua l'accesso per prenotare." || a_showLogin(state)) {
    return <LoginPrompt lang={lang} next={next} />;
  }

  function setQtyUp(n: number) {
    setQty(n);
    setPeople((prev) => {
      const next = [...prev];
      while (next.length < n) next.push(empty());
      return next.slice(0, n);
    });
  }

  function setPerson(i: number, patch: Partial<Person>) {
    setPeople((prev) => prev.map((p, ix) => (ix === i ? { ...p, ...patch } : p)));
  }

  const total = price * qty;
  const fmt = new Intl.NumberFormat(lang === "en" ? "en-IE" : "it-IT", { style: "currency", currency: "EUR" });

  return remaining > 0 ? (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="quantity" value={qty} />
      <input type="hidden" name="attendees" value={JSON.stringify(people)} />
      <input type="hidden" name="contactName" value={contactName} />
      <input type="hidden" name="contactEmail" value={contactEmail} />
      <input type="hidden" name="contactPhone" value={contactPhone} />

      {/* Quantità (allowlist client, ri-verificata server) */}
      <div>
        <p className="text-sm font-semibold text-cream/80">{d.quantityLabel}</p>
        <div className="mt-2 flex items-center gap-3">
          <button type="button" aria-label="-" onClick={() => setQtyUp(Math.max(1, qty - 1))} className="h-11 w-11 rounded-full border border-cream/25 text-lg text-cream hover:border-gold">−</button>
          <span className="w-10 text-center text-xl text-cream">{qty}</span>
          <button type="button" aria-label="+" onClick={() => setQtyUp(Math.min(Math.max(remaining, 1), 20, qty + 1))} className="h-11 w-11 rounded-full border border-cream/25 text-lg text-cream hover:border-gold">+</button>
        </div>
      </div>

      <div className="rounded-2xl border border-cream/20 bg-white/5 px-4 py-3 text-sm">
        <div className="flex items-center justify-between text-cream/70">
          <span>{title}</span>
          <span>× {qty}</span>
        </div>
        <div className="mt-1 flex items-center justify-between font-semibold text-cream">
          <span>{lang === "en" ? "Total" : "Totale"}</span>
          <span>{fmt.format(total)}</span>
        </div>
      </div>

      {/* Recapito */}
      <p className="text-sm font-semibold text-cream/80">{d.contactTitle}</p>
      <input aria-label={d.contactName} className={inputCls} placeholder={d.contactName} value={contactName} onChange={(e) => setContactName(e.target.value)} maxLength={80} />
      <input aria-label={d.contactEmail} className={inputCls} placeholder={d.contactEmail} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} maxLength={254} />
      <input aria-label={d.contactPhone} className={inputCls} placeholder={d.contactPhone} type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} maxLength={30} />

      {/* Partecipanti: nome, cognome, DOB, codice fiscale (richiesta governo IT) */}
      <p className="text-sm font-semibold text-cream/80">{d.attendeesTitle}</p>
      {people.map((p, ix) => (
        <div key={ix} className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">{d.attendeeOf} {ix + 1}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input aria-label={d.attendeeName} className={inputCls} placeholder={d.attendeeName} value={p.name} onChange={(e) => setPerson(ix, { name: e.target.value })} maxLength={60} required />
            <input aria-label={d.attendeeSurname} className={inputCls} placeholder={d.attendeeSurname} value={p.surname} onChange={(e) => setPerson(ix, { surname: e.target.value })} maxLength={60} required />
            <input aria-label={d.attendeeDob} className={inputCls} type="date" value={p.dob} onChange={(e) => setPerson(ix, { dob: e.target.value })} maxLength={10} required />
            <input
              aria-label={d.attendeeCf}
              className={`${inputCls} uppercase`}
              placeholder={d.attendeeCf}
              value={p.cf}
              onChange={(e) => setPerson(ix, { cf: e.target.value.toUpperCase() })}
              maxLength={16}
              minLength={16}
              pattern="[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]"
              required
            />
          </div>
          {people.length > 1 ? (
            <button type="button" onClick={() => { setQty(qty - 1); setPeople((prev) => prev.filter((_, i2) => i2 !== ix)); }} className="mt-2 text-xs text-cream/50 hover:text-red-300">
              {d.removePerson}
            </button>
          ) : null}
        </div>
      ))}

      {state.error ? (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending || people.some((p) => p.name.length < 2 || p.surname.length < 2 || p.dob.length !== 10 || p.cf.length !== 16)}
        className="w-full rounded-full bg-gold px-6 py-3.5 font-semibold text-ink transition hover:bg-cream disabled:opacity-50"
      >
        {pending ? d.submitting : d.submit}
      </button>
      <p className="text-center text-xs text-cream/50">{a.downloadHint}</p>
    </form>
  ) : (
    <p className="rounded-2xl border border-cream/20 bg-white/5 px-4 py-6 text-center text-cream/70">{d.soldOut}</p>
  );
}

function a_showLogin(state: BookingFormState): boolean {
  return !!state.error?.startsWith("Effettua");
}

function LoginPrompt({ lang, next }: { lang: Lang; next?: string }) {
  const d = t(lang).booking;
  const target = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <div className="rounded-2xl border border-gold/40 bg-gold/10 p-6 text-center">
      <p className="font-semibold text-gold">{d.needLoginTitle}</p>
      <p className="mt-2 text-sm text-cream/70">{d.needLoginSub}</p>
      <Link href={`/login${target}`} className="mt-4 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-ink hover:bg-cream">
        {d.loginCta}
      </Link>
      <p className="mt-3 text-xs text-cream/50">{d.endNote}</p>
    </div>
  );
}
