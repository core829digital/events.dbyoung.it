"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/eventi", label: "Eventi" },
  { href: "/location", label: "Location" },
  { href: "/organizza", label: "Preventivo" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" className="flex min-w-0 items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="truncate font-display text-xl tracking-tight text-cream sm:text-2xl">
            Isola <span className="text-gold">Events</span>
          </span>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-cream/60 lg:inline">
            Fattoria Isola
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-cream/85 md:flex">
          {links.map((l) => (
            <Link key={l.href} className="hover:text-gold" href={l.href}>{l.label}</Link>
          ))}
          <Link
            href="/organizza"
            className="rounded-full bg-gold px-5 py-2.5 font-semibold text-ink transition hover:bg-cream"
          >
            Organizza
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/organizza"
            className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink"
          >
            Organizza
          </Link>
          <button
            type="button"
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="rounded-full border border-cream/25 p-2 text-cream"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-white/10 px-4 py-3 md:hidden">
          <ul className="space-y-1 text-base">
            {[{ href: "/", label: "Home" }, ...links].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-cream/90 hover:bg-white/5 hover:text-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
