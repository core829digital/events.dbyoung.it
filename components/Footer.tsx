import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function Footer({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <footer className="border-t border-white/10 bg-ink text-cream/75">
      <div className="grid w-full gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 sm:py-14 lg:grid-cols-3 lg:px-10">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo/events.dbyoung.it.jpg"
              alt="DBYoung Events — logo"
              width={56}
              height={56}
              loading="lazy"
              className="h-14 w-14 rounded-full border border-gold/40 object-cover"
            />
            <p className="font-display text-xl text-cream">Eventi DBYoung</p>
          </div>
          <p className="mt-2 text-sm">{site.byline}</p>
          <p className="mt-2 text-sm">{site.location}</p>
        </div>
        <div className="text-sm">
          <p className="uppercase tracking-[0.2em] text-cream/50">{d.footer.explore}</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="hover:text-gold" href="/eventi">{d.footer.formats}</Link></li>
            <li><Link className="hover:text-gold" href="/location">{d.footer.venue}</Link></li>
            <li><Link className="hover:text-gold" href="/organizza">{d.footer.book}</Link></li>
            <li><Link className="hover:text-gold" href="/privacy">{d.footer.privacy}</Link></li>
            <li><Link className="hover:text-gold" href="/termini">{d.footer.termini}</Link></li>
            <li><Link className="hover:text-gold" href="/cookie">{d.footer.cookie}</Link></li>
            <li><Link className="hover:text-gold" href="/gdpr">{d.footer.gdpr}</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="uppercase tracking-[0.2em] text-cream/50">{d.footer.contacts}</p>
          <ul className="mt-3 space-y-2">
            <li><a className="hover:text-gold" href={`mailto:${site.emailTo}`}>{site.emailTo}</a></li>
            <li><a className="hover:text-gold" href={site.mainSite}>dbyoung.it</a></li>
            <li><a className="hover:text-gold" href={site.fattoria}>fattoriaisola.com</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-cream/50">
        © 2026 Eventi DBYoung · Dimitri Bouterline · {d.footer.rights}
      </div>
    </footer>
  );
}
