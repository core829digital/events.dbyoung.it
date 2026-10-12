import { getLang } from "@/lib/lang-server";
import { type Lang } from "@/lib/i18n";


export const metadata = { title: "Privacy — Isola Events" };

const copy: Record<Lang, { title: string; owner: string; h1: string; p1: string; h2: string; p2: string; h3: string; p3: string }> = {
  it: {
    title: "Privacy Policy",
    owner: "Titolare: Dimitri Bouterline · Isola Events · Fattoria Isola, Laterina (AR) · booking@dbyoung.it",
    h1: "Dati raccolti",
    p1: "Nome, email, telefono, data, ospiti e messaggio inviati dal form di contatto: servono solo per rispondere (base giuridica: misure precontrattuali, art. 6.1.b GDPR).",
    h2: "Conservazione e diritti",
    p2: "Conserviamo le richieste 24 mesi. Puoi chiedere accesso, rettifica, cancellazione e opposizione scrivendo a booking@dbyoung.it. Reclamo al Garante.",
    h3: "Terze parti",
    p3: "Hosting Vercel (USA/UE), email Resend, booking Calendly, database Convex. L'embed Calendly carica contenuti di terzi previo consenso cookie.",
  },
  en: {
    title: "Privacy Policy",
    owner: "Controller: Dimitri Bouterline · Isola Events · Fattoria Isola, Laterina (AR) · booking@dbyoung.it",
    h1: "Data collected",
    p1: "Name, email, phone, date, guests and message sent via the contact form: used only to reply (lawful basis: pre-contractual measures, Art. 6(1)(b) GDPR).",
    h2: "Retention and rights",
    p2: "We keep requests for 24 months. You may request access, rectification, erasure and objection by writing to booking@dbyoung.it. Complaints to the supervisory authority.",
    h3: "Third parties",
    p3: "Vercel hosting (US/EU), Resend email, Calendly booking, Convex database. The Calendly embed loads third-party content subject to cookie consent.",
  },
};

export default async function Privacy() {
  const lang = await getLang();
  const c = copy[lang];
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 text-cream/80 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-cream">{c.title}</h1>
      <p className="mt-4 text-sm">{c.owner}</p>
      <h2 className="mt-8 font-display text-2xl text-cream">{c.h1}</h2>
      <p className="mt-2 text-sm">{c.p1}</p>
      <h2 className="mt-6 font-display text-2xl text-cream">{c.h2}</h2>
      <p className="mt-2 text-sm">{c.p2}</p>
      <h2 className="mt-6 font-display text-2xl text-cream">{c.h3}</h2>
      <p className="mt-2 text-sm">{c.p3}</p>
    </div>
  );
}
