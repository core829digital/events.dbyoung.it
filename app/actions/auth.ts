"use server";

import { redirect } from "next/navigation";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import { convex, srvKey } from "@/lib/server/convex";
import { createSessionForUser, destroySession } from "@/lib/server/session";
import { hashIp, clientIp, rateLimit } from "@/lib/server/rate-limit";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { loginSchema, registerSchema } from "@/lib/validators";

export type AuthFormState = { error?: string };

/** Redirect interno whitelistato (mai external/off-road). */
function safeNext(raw: FormDataEntryValue | null): string {
  const next = typeof raw === "string" ? raw : "";
  if (/^\/[a-z][\w\-/]*$/.test(next) && !next.startsWith("//")) return next;
  return "/account";
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    surname: String(formData.get("surname") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    passwordConfirm: String(formData.get("passwordConfirm") ?? ""),
    accept: formData.get("accept") === "on",
    lang: String(formData.get("lang") ?? "it"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };

  const ip = await clientIp();
  const lim = rateLimit("auth", ip);
  if (!lim.ok) return { error: `Troppe richieste. Riprova tra ${Math.ceil(lim.retryAfterSec / 60)} minuti.` };

  const { email, password, name, surname } = parsed.data;
  try {
    const userId = await convex().mutation(api.secure.registerUser, {
      srvKey: srvKey(),
      email,
      passwordHash: hashPassword(password),
      name,
      surname,
    });
    await createSessionForUser(String(userId), hashIp(ip));
  } catch (e) {
    const msg = e instanceof ConvexError ? String(e.message) : "";
    if (msg === "409") return { error: "Email già registrata. Accedi." };
    return { error: "Registrazione non riuscita, riprova." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: "Email o password non valide." };

  const ip = await clientIp();
  // Rate-limit: per IP e per account (brute force + credential stuffing)
  if (!rateLimit("auth", ip).ok) return { error: "Troppi tentativi. Riprova più tardi." };
  const perAccount = rateLimit("loginAttemptsPerAccount", parsed.data.email);
  if (!perAccount.ok) return { error: "Troppi tentativi su questo account. Riprova più tardi." };

  try {
    const record = await convex().query(api.secure.authRecord, {
      srvKey: srvKey(),
      email: parsed.data.email,
    });
    // verifyPassword esegue scrypt anche con placeholder → timing simile (no user enum)
    const ok = record?.passwordHash && record.status === "active"
      ? verifyPassword(parsed.data.password, record.passwordHash)
      : verifyPassword(parsed.data.password, "s2$32768$0");
    if (!record || !ok) {
      rateLimit("loginAttemptsPerAccount", parsed.data.email); // consuma tentativo
      return { error: "Credenziali non valide." };
    }
    await createSessionForUser(String(record.id), hashIp(ip));
  } catch {
    return { error: "Login non riuscito, riprova." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
