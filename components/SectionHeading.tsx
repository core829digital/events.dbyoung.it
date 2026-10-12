import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <Reveal className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{kicker}</p>
      <h2 className="mt-2 font-display text-3xl leading-tight text-cream sm:text-4xl">{title}</h2>
      {sub ? <p className="mt-3 text-cream/70">{sub}</p> : null}
    </Reveal>
  );
}
