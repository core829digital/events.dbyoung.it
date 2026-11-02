"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction, type AuthFormState } from "@/app/actions/auth";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

const inputCls =
  "w-full rounded-2xl border border-cream/20 bg-white/5 px-4 py-3 text-cream placeholder-cream/30 outline-none focus:border-gold focus:bg-white/10";
const labelCls = "block text-sm text-cream/70";
const btnCls =
  "w-full rounded-full bg-gold px-6 py-3.5 font-semibold text-ink transition hover:bg-cream disabled:opacity-60";

export function AuthForm({ mode, lang, next }: { mode: "login" | "register"; lang: Lang; next?: string }) {
  const d = t(lang).authPage;
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(mode === "login" ? loginAction : registerAction, {});
  return (
    <form action={formAction} className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-ink-soft p-6 sm:p-8">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <input type="hidden" name="lang" value={lang} />
      {mode === "register" ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className={labelCls}><span className="mb-1.5 block">{d.name}</span>
              <input className={inputCls} name="name" autoComplete="given-name" required maxLength={60} minLength={2} />
            </label>
            <label className={labelCls}><span className="mb-1.5 block">{d.surname}</span>
              <input className={inputCls} name="surname" autoComplete="family-name" required maxLength={60} minLength={2} />
            </label>
          </div>
          <label className={`${labelCls} mt-3 block`}><span className="mb-1.5 block">{d.email}</span>
            <input className={inputCls} name="email" type="email" autoComplete="email" required maxLength={254} />
          </label>
          <label className={`${labelCls} mt-3 block`}><span className="mb-1.5 block">{d.password}</span>
            <input
              className={inputCls}
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              maxLength={128}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}"
              title={d.passwordHint}
            />
          </label>
          <p className="mt-1 text-xs text-cream/50">{d.passwordHint}</p>
          <label className={`${labelCls} mt-3 block`}><span className="mb-1.5 block">{d.passwordConfirm}</span>
            <input className={inputCls} name="passwordConfirm" type="password" autoComplete="new-password" required minLength={10} maxLength={128} />
          </label>
          <label className="mt-4 flex items-start gap-2.5 text-sm text-cream/70">
            <input type="checkbox" name="accept" required className="mt-0.5 h-4 w-4 accent-[#c9a227]" />
            <span>
              {d.acceptPrivacy} <Link className="text-gold hover:underline" href="/privacy">{d.privacyPolicy}</Link>
            </span>
          </label>
        </>
      ) : null}
      {mode === "login" ? (
        <>
          <label className={labelCls}><span className="mb-1.5 block">{d.email}</span>
            <input className={inputCls} name="email" type="email" autoComplete="email" required maxLength={254} />
          </label>
          <label className={`${labelCls} mt-3 block`}><span className="mb-1.5 block">{d.password}</span>
            <input className={inputCls} name="password" type="password" autoComplete="current-password" required maxLength={128} />
          </label>
        </>
      ) : null}
      {state.error ? (
        <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={`${btnCls} mt-5`}>
        {pending ? (mode === "login" ? "…" : "…") : mode === "login" ? d.login : d.register}
      </button>
      <p className="mt-4 text-center text-sm text-cream/60">
        {mode === "login" ? d.registerLinkPre : d.loginLinkPre}{" "}
        <Link className="text-gold hover:underline" href={mode === "login" ? `/registrati${next ? `?next=${encodeURIComponent(next)}` : ""}` : `/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>
          {mode === "login" ? d.registerLink : d.loginLink}
        </Link>
      </p>
    </form>
  );
}
