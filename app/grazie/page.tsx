import Link from "next/link";

export default function Grazie() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Richiesta inviata</p>
      <h1 className="mt-2 font-display text-4xl text-cream">Grazie! Ti risponderemo entro 24–48h.</h1>
      <p className="mt-4 text-cream/70">Nel frattempo prenota la call conoscitiva gratuita da 30 minuti.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/organizza" className="rounded-full bg-gold px-6 py-3 font-semibold text-ink">Prenota la call</Link>
        <Link href="/" className="rounded-full border border-cream/25 px-6 py-3">Torna home</Link>
      </div>
    </div>
  );
}
