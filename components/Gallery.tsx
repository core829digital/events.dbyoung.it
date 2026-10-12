"use client";

import Image from "next/image";
import { useState } from "react";
import { gallery } from "@/lib/site";
import { Reveal } from "./Reveal";

export function Gallery() {
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {gallery.map((g, i) => (
        <Reveal key={g.src} delay={(i % 4) * 0.06}>
          <figure className="group relative h-44 overflow-hidden rounded-2xl border border-white/10 md:h-56">
            <Image
              src={failed[g.src] ? g.fallback : g.src}
              alt={g.alt}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
              onError={() => setFailed((f) => ({ ...f, [g.src]: true }))}
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-3 text-xs text-cream/85">
              {g.alt} · {g.credit}
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
