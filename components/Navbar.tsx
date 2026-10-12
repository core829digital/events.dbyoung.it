import Link from "next/link";
import { site } from "@/lib/site";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-tight text-cream">
            Isola <span className="text-gold">Events</span>
          </span>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-cream/60 sm:inline">
            Fattoria Isola
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-cream/85">
          <Link className="hidden hover:text-gold sm:inline" href="/eventi">Eventi</Link>
          <Link className="hidden hover:text-gold sm:inline" href="/location">Location</Link>
          <Link className="hidden hover:text-gold md:inline" href={site.mainSite}>dbyoung.it</Link>
          <Link
            href="/organizza"
            className="rounded-full bg-gold px-4 py-2 font-semibold text-ink transition hover:bg-cream"
          >
            Organizza
          </Link>
        </nav>
      </div>
    </header>
  );
}
