import { gallery } from "@/lib/site";
import { Reveal } from "./Reveal";
import { SmartImage } from "./SmartImage";

export function Gallery() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {gallery.map((g, i) => (
        <Reveal key={g.src} delay={(i % 4) * 0.06}>
          <figure className="group relative h-40 overflow-hidden rounded-2xl border border-white/10 bg-ink-soft sm:h-48 lg:h-56">
            <SmartImage
              src={g.src}
              fallback={g.fallback}
              alt={g.alt}
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-105"
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
