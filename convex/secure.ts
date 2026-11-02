import { ConvexError } from "convex/values";
import { internalMutation, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

/**
 * Sicurezza a livello Convex: ogni funzione che tocca dati personali o scritture
 * richiede:
 *  - una sessione valida (tokenHash del cookie httpOnly) → requireSession
 *  - un ruolo abilitato → requireRole
 * oppure
 *  - il secret lato-server hashato (circolato solo Next ⇄ Convex, mai client)
 *    → requireServer
 *
 * Così anche chi conosce NEXT_PUBLIC_CONVEX_URL non può chiamare le mutation
 * direttamente: manca sia la sessione valida sia il secret.
 */

const ROLES = ["client", "admin", "founder"] as const;
export type Role = (typeof ROLES)[number];

function refuse(): never {
  throw new ConvexError("403");
}

export async function requireServer(ctx: MutationCtx | QueryCtx, srvKey: string) {
  const expected = process.env.SERVER_SECRET_HASH;
  if (!srvKey || !expected || srvKey !== expected) refuse();
}

/** Cleanup best-effort: rimuove le sessioni scadute (idempotente). */
async function pruneExpired(ctx: MutationCtx, now: number) {
  const expired = (await ctx.db.query("sessions").collect()).filter(
    (s) => s.expiresAt < now,
  );
  for (const s of expired) await ctx.db.delete(s._id);
}

export async function requireSession(
  ctx: MutationCtx | QueryCtx,
  tokenHash: string,
): Promise<{ user: Doc<"users"> }> {
  const now = Date.now();
  if (!tokenHash) refuse();
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
    .unique();
  if (!session || session.expiresAt < now) refuse();
  const user = await ctx.db.get(session.userId);
  if (!user || user.status !== "active") refuse();
  return { user };
}

/** Sessione valida + ruolo abilitato, altrimenti 403. */
export async function requireRole(
  ctx: MutationCtx | QueryCtx,
  tokenHash: string,
  roles: Role[],
): Promise<{ user: Doc<"users"> }> {
  const { user } = await requireSession(ctx, tokenHash);
  if (!roles.includes(user.role as Role)) refuse();
  return { user };
}

/**
 * Profilo minimo della sessione corrente, per Navbar / client portal.
 * Ritorna null se la sessione è assente o scaduta (fallback pubblico).
 */
export const me = query({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) => {
    try {
      const { user } = await requireSession(ctx, tokenHash);
      return {
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      };
    } catch {
      return null;
    }
  },
});

/** Touched dopo un login riuscito. */
export const touchLastLogin = internalMutation({
  args: { userId: v.id("users"), at: v.number() },
  handler: async (ctx, { userId, at }) => {
    await ctx.db.patch(userId, { lastLoginAt: at });
  },
});

/** Logout: invalida la sessione con questo token. */
export const logoutByToken = mutation({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) => {
    if (!tokenHash) return;
    const s = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (s) await ctx.db.delete(s._id);
  },
});

/**
 * Crea un nuovo utente. Chiamata SOLO dal server Next (requireServer):
 * la password arriva già hashata (scrypt) e non in chiaro mai verso Convex.
 * Se l'email coincide con AUTH_FOUNDER_EMAIL e non esiste ancora un founder,
 * l'account diventa founder (bootstrap per Dimitri).
 */
export const registerUser = mutation({
  args: {
    srvKey: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    surname: v.string(),
  },
  handler: async (ctx, args) => {
    await requireServer(ctx, args.srvKey);
    const email = args.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) throw new ConvexError("422");
    const exists = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (exists) throw new ConvexError("409");

    // Bootstrap founder: solo il primo account con AUTH_FOUNDER_EMAIL
    const founderEmail = (process.env.AUTH_FOUNDER_EMAIL ?? "").toLowerCase().trim();
    let role: "client" | "founder" = "client";
    if (founderEmail && email === founderEmail) {
      const users = await ctx.db.query("users").collect();
      const already = users.some((u) => u.role === "founder");
      if (!already) role = "founder";
    }
    return ctx.db.insert("users", {
      email,
      passwordHash: args.passwordHash,
      name: args.name,
      surname: args.surname,
      role,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

/** Record per il login (check password nel server Next; requireServer). */
export const authRecord = query({
  args: { srvKey: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    await requireServer(ctx, args.srvKey);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();
    return user
      ? { id: user._id, passwordHash: user.passwordHash, status: user.status, role: user.role }
      : null;
  },
});

/** Crea una sessione (token già hashato dal server Next; requireServer). */
export const createSession = mutation({
  args: {
    srvKey: v.string(),
    tokenHash: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
    ipHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireServer(ctx, args.srvKey);
    await pruneExpired(ctx, Date.now());
    return ctx.db.insert("sessions", {
      tokenHash: args.tokenHash,
      userId: args.userId,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
      ipHash: args.ipHash,
    });
  },
});

/** Password hash: SOLO server (srvKey) — usato per reset pass da Next. */
export const setUserPasswordHash = mutation({
  args: {
    srvKey: v.string(),
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    await requireServer(ctx, args.srvKey);
    const target = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .unique();
    if (!target) throw new ConvexError("404");
    await ctx.db.patch(target._id, { passwordHash: args.passwordHash });
    // revoca sessioni attive: nuova password vale da subito
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", target._id))
      .collect();
    for (const s of sessions) await ctx.db.delete(s._id);
    return target._id;
  },
});

/**
 * Gestione ruoli: SOLO founder. founder → admin (delegato) o client (revoca).
 * Mai possibile cambiare il ruolo di un altro founder.
 */
export const setUserRole = mutation({
  args: {
    actorTokenHash: v.string(),
    targetEmail: v.string(),
    role: v.union(v.literal("admin"), v.literal("client")),
  },
  handler: async (ctx, args) => {
    const { user: actor } = await requireRole(ctx, args.actorTokenHash, ["founder"]);
    if (actor.email.toLowerCase() === args.targetEmail.toLowerCase()) refuse();
    const target = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.targetEmail.toLowerCase()))
      .unique();
    if (!target || target.role === "founder") refuse();
    await ctx.db.patch(target._id, { role: args.role });
    // revoca sessioni: la nuova role vale dai prossimi accessi
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", target._id))
      .collect();
    for (const s of sessions) await ctx.db.delete(s._id);
    return target._id;
  },
});

/** Elenco utenti: SOLO founder (email, ruolo, ultimo login — mai hash). */
export const listUsers = query({
  args: { actorTokenHash: v.string() },
  handler: async (ctx, { actorTokenHash }) => {
    await requireRole(ctx, actorTokenHash, ["founder"]);
    const users = await ctx.db.query("users").collect();
    return users
      .map((u) => ({
        email: u.email,
        name: u.name,
        surname: u.surname,
        role: u.role,
        status: u.status,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});
