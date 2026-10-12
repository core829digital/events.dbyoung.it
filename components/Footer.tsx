import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-cream/75">
      <div className="grid w-full gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 sm:py-14 lg:grid-cols-3 lg:px-10">
        <div>
          <p className="font-display text-xl text-cream">Isola Events</p>
          <p className="mt-2 text-sm">{site.byline}</p>
          <p className="mt-2 text-sm">{site.location}</p>
        </div>
        <div className="text-sm">
          <p className="uppercase tracking-[0.2em] text-cream/50">Esplora</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="hover:text-gold" href="/eventi">I due format</Link></li>
            <li><Link className="hover:text-gold" href="/location">La location</Link></li>
            <li><Link className="hover:text-gold" href="/organizza">Organizza / Preventivo</Link></li>
            <li><Link className="hover:text-gold" href="/privacy">Privacy</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="uppercase tracking-[0.2em] text-cream/50">Contatti</p>
          <ul className="mt-3 space-y-2">
            <li><a className="hover:text-gold" href={`mailto:${site.emailTo}`}>{site.emailTo}</a></li>
            <li><a className="hover:text-gold" href={site.mainSite}>dbyoung.it</a></li>
            <li><a className="hover:text-gold" href={site.fattoria}>fattoriaisola.com</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-cream/50">
        © 2026 Isola Events · Dimitri Bouterline · Tutti i diritti riservati.
      </div>
    </footer>
  );
}
