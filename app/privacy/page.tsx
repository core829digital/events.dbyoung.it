export const metadata = { title: "Privacy — Isola Events" };

export default function Privacy() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 text-cream/80 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-cream">Privacy Policy</h1>
      <p className="mt-4 text-sm">Titolare: Dimitri Bouterline · Isola Events · Fattoria Isola, Laterina (AR) · booking@dbyoung.it</p>
      <h2 className="mt-8 font-display text-2xl text-cream">Dati raccolti</h2>
      <p className="mt-2 text-sm">Nome, email, telefono, data, ospiti e messaggio inviati dal form preventivo: servono solo per rispondere (base giuridica: misure precontrattuali, art. 6.1.b GDPR).</p>
      <h2 className="mt-6 font-display text-2xl text-cream">Conservazione e diritti</h2>
      <p className="mt-2 text-sm">Conserviamo le richieste 24 mesi. Puoi chiedere accesso, rettifica, cancellazione e opposizione scrivendo a booking@dbyoung.it. Reclamo al Garante.</p>
      <h2 className="mt-6 font-display text-2xl text-cream">Terze parti</h2>
      <p className="mt-2 text-sm">Hosting Vercel (USA/UE), email Resend, booking Calendly, database Convex. L&apos;embed Calendly carica contenuti di terzi previo consenso cookie.</p>
    </div>
  );
}
