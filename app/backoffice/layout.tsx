import { redirect } from "next/navigation";
import Link from "next/link";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { getSessionUser } from "@/lib/server/session";
import { backofficeIpAllowed } from "@/lib/server/req-guard";

export const dynamic = "force-dynamic";

/**
 * Guardia del backoffice (server):
 * - sessione valida con ruolo admin|founder, altrimenti redirect a /login
 * - allowlist IP server-only (env BACKOFFICE_IP_ALLOWLIST), opzionale
 */
export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const ipOk = await backofficeIpAllowed();
  if (!ipOk) {
    return (
      <div className="w-full px-4 py-20 text-center">
        <p className="font-display text-3xl text-cream">403</p>
        <p className="mt-2 text-cream/60">Accesso non consentito da questa rete.</p>
      </div>
    );
  }
  const user = await getSessionUser();
  if (!user || user.role === "client") redirect("/login?next=/backoffice");
  const lang = await getLang();
  const d = t(lang).backofficePage;

  const nav = [
    { href: "/backoffice", label: d.dashTitle },
    { href: "/backoffice/eventi", label: d.events },
    { href: "/backoffice/scan", label: d.scan },
    ...(user.role === "founder" ? [{ href: "/backoffice/utenti", label: d.users }] : []),
  ];

  return (
    <div className="w-full px-4 py-10 sm:px-6 lg:px-10">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">{d.kicker}</p>
        <span className="rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
          {user.role === "founder" ? d.roleFounder : d.roleAdmin}
        </span>
      </div>
      <nav className="mb-8 flex flex-wrap gap-2">
        {nav.map((n, i) => (
          <Link
            key={n.href}
            href={n.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              i === 0 ? "bg-gold text-ink hover:bg-cream" : "border border-cream/20 text-cream/80 hover:border-gold hover:text-gold"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
