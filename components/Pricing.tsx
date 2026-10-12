import Link from "next/link";
import { pricing } from "@/lib/site";
import { Reveal } from "./Reveal";

export function Pricing() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {pricing.map((p, i) => (
        <Reveal key={p.name} delay={i * 0.08}>
          <div className={`rounded-3xl border p-6 ${p.featured ? "border-gold bg-gold/10" : "border-white/10 bg-white/5"}`}>
            <h3 className="font-display text-2xl text-cream">{p.name}</h3>
            <p className="mt-1 text-gold">{p.price}</p>
            <p className="mt-1 text-sm text-cream/60">{p.for}</p>
            <ul className="mt-4 space-y-2 text-sm text-cream/80">
              {p.features.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
            <Link href="/organizza" className={`mt-6 block rounded-full py-2.5 text-center text-sm font-semibold ${p.featured ? "bg-gold text-ink hover:bg-cream" : "border border-cream/25 hover:border-gold hover:text-gold"}`}>
              {p.cta}
            </Link>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
