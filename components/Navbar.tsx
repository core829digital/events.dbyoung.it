"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { LangToggle } from "./LangToggle";

export function Navbar({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const d = t(lang).nav;
  const links = [
    { href: "/eventi", label: d.events },
    { href: "/location", label: d.location },
    { href: "/organizza", label: d.quote },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image
            src="/logo/events.dbyoung.it.jpg"
            alt="DBYoung Events — logo"
            width={44}
            height={44}
            priority
            className="h-10 w-10 shrink-0 rounded-full border border-gold/40 object-cover sm:h-11 sm:w-11"
          />
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="truncate font-display text-xl tracking-tight text-cream sm:text-2xl">
              Eventi <span className="text-gold">DBYoung</span>
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-cream/85 md:flex">
          {links.map((l) => (
            <Link key={l.href} className="hover:text-gold" href={l.href}>{l.label}</Link>
          ))}
          <LangToggle lang={lang} />
          <Link
            href="/organizza"
            className="rounded-full bg-gold px-5 py-2.5 font-semibold text-ink transition hover:bg-cream"
          >
            {d.book}
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <LangToggle lang={lang} />
          <Link
            href="/organizza"
            className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink"
          >
            {d.book}
          </Link>
          <button
            type="button"
            aria-label={open ? d.menuClose : d.menuOpen}
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
            {[{ href: "/", label: d.home }, ...links].map((l) => (
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
