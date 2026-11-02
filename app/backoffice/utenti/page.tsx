import { convex } from "@/lib/server/convex";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { getLang } from "@/lib/lang-server";
import { t } from "@/lib/i18n";
import { readTokenHash, getSessionUser } from "@/lib/server/session";
import { setUserRoleAction } from "@/app/actions/backoffice";
import { SectionHeading } from "@/components/SectionHeading";

export const dynamic = "force-dynamic";

type User = FunctionReturnType<typeof api.secure.listUsers>[number];

export default async function UsersPage() {
  const lang = await getLang();
  const d = t(lang).backofficePage;
  const [tokenHash, me] = await Promise.all([readTokenHash(), getSessionUser()]);
  if (!tokenHash || me?.role !== "founder") {
    return <p className="text-cream/60">{lang === "en" ? "Founder only." : "Solo founder."}</p>;
  }
  const users = (await convex().query(api.secure.listUsers, { actorTokenHash: tokenHash })) as User[];
  const fmt = (ms?: number) =>
    ms ? new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", { dateStyle: "short", timeStyle: "short" }).format(new Date(ms)) : "—";

  return (
    <div>
      <SectionHeading kicker={d.kicker} title={d.users} />
      <ul className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {users.map((u) => (
          <li key={u.email} className="rounded-3xl border border-white/10 bg-ink-soft p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-cream"><b>{u.name} {u.surname}</b> <span className="text-sm text-cream/60">{u.email}</span></p>
                <p className="text-xs text-cream/50">
                  {fmt(u.createdAt)} · last: {fmt(u.lastLoginAt)}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                u.status === "suspended" ? "border border-red-400/40 text-red-300"
                : u.role === "founder" ? "bg-gold/25 text-gold"
                : u.role === "admin" ? "bg-gold/15 text-gold"
                : "border border-cream/25 text-cream/60"
              }`}>
                {u.role === "founder" ? d.roleFounder : u.role === "admin" ? d.roleAdmin : d.roleClient}
              </span>
            </div>
            {u.role !== "founder" ? (
              <div className="mt-3 flex gap-2">
                {u.role === "client" ? (
                  <form action={setUserRoleAction}>
                    <input type="hidden" name="email" value={u.email} />
                    <input type="hidden" name="role" value="admin" />
                    <button className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-ink hover:bg-cream">{d.rolePromote}</button>
                  </form>
                ) : (
                  <form action={setUserRoleAction}>
                    <input type="hidden" name="email" value={u.email} />
                    <input type="hidden" name="role" value="client" />
                    <button className="rounded-full border border-cream/25 px-4 py-2 text-xs text-cream/80 hover:border-gold hover:text-gold">{d.roleDemote}</button>
                  </form>
                )}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
