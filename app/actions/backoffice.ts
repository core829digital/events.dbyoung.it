"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import { asId, convex, srvKey } from "@/lib/server/convex";
import { getSessionUser, readTokenHash } from "@/lib/server/session";
import { rateLimit, clientIp, hashIp } from "@/lib/server/rate-limit";
import { eventFormSchema } from "@/lib/validators";

export type EventFormState = { error?: string; ok?: boolean };

async function token(): Promise<string | null> {
  return readTokenHash();
}

/** Guard server: solo admin|founder (ruolo ri-verificato in Convex). */
async function adminToken(): Promise<string | null> {
  const user = await getSessionUser();
  if (!user || user.role === "client") return null;
  return readTokenHash();
}

export async function upsertEventAction(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const t = await adminToken();
  if (!t) return { error: "Non autorizzato." };
  if (!rateLimit("api", hashIp(await clientIp())).ok) return { error: "Rallenta, riprova tra poco." };

  const parsed = eventFormSchema.safeParse({
    id: (v => (v ? String(v) : undefined))(formData.get("id")),
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    description: String(formData.get("description") ?? ""),
    image: String(formData.get("image") ?? ""),
    startAt: new Date(String(formData.get("startAt") ?? "")).getTime(),
    endAt: new Date(String(formData.get("endAt") ?? "")).getTime(),
    capacity: Number(formData.get("capacity") ?? 0),
    pricePerPerson: Number(formData.get("pricePerPerson") ?? -1),
    locationNote: String(formData.get("locationNote") ?? ""),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  const e = parsed.data;

  let persistedId: string;
  try {
    persistedId = String(
      await convex().mutation(api.events.upsert, {
        tokenHash: t,
        id: e.id ? asId("events", e.id) : undefined,
        slug: e.slug,
        title: e.title,
        tagline: e.tagline,
        description: e.description,
        image: e.image,
        startAt: e.startAt,
        endAt: e.endAt,
        capacity: e.capacity,
        pricePerPerson: e.pricePerPerson,
        locationNote: e.locationNote,
        published: e.published,
      }),
    );
  } catch (err) {
    const msg = err instanceof ConvexError ? String(err.message) : "";
    const map: Record<string, string> = {
      "409 slug": "URL già usato da un altro evento.",
      "422 slug": "URL non valido (a-z, 0-9, trattini).",
      "422 capacity": "Posti: da 1 a 2000.",
      "422 price": "Prezzo per persona: da 0 a 100.000.",
      "422 dates": "La fine deve seguire l'inizio.",
      "422 start-in-past": "L'inizio non può essere nel passato (oltre 24h).",
      "404": "Evento non trovato.",
    };
    return { error: map[msg] ?? "Salvataggio non riuscito, riprova." };
  }

  await revalidatePath("/backoffice/eventi");
  await revalidatePath("/eventi");
  // redirect() lancia NEXT_REDIRECT: va FUORI dal try/catch, altrimenti viene
  // intercettato e trasformato in errore.
  if (!e.id) redirect(`/backoffice/eventi/${persistedId}?created=1`);
  return { ok: true };
}

export async function publishEventAction(formData: FormData) {
  const t = await adminToken();
  if (!t) return;
  const id = String(formData.get("id") ?? "");
  if (!/^[a-z0-9]{20,40}$/.test(id)) return;
  await convex().mutation(api.events.setPublished, {
    tokenHash: t,
    id: asId("events", id),
    published: formData.get("published") === "1",
  });
  await revalidatePath("/backoffice/eventi");
  await revalidatePath("/eventi");
}

/** Solo founder (verificato in Convex); bloccato con booking pagati. */
export async function deleteEventAction(formData: FormData) {
  const t = await adminToken();
  if (!t) return;
  const id = String(formData.get("id") ?? "");
  if (!/^[a-z0-9]{20,40}$/.test(id)) return;
  try {
    await convex().mutation(api.events.remove, {
      tokenHash: t,
      srvKey: srvKey(),
      id: asId("events", id),
    });
  } catch {
    // 409 paid: l'evento resta per gli ospiti già pagati
  }
  await revalidatePath("/backoffice/eventi");
  redirect("/backoffice/eventi");
}

/** Cambio ruoli: SOLO founder, atti per admin o revoca. */
export async function setUserRoleAction(formData: FormData) {
  const t = await adminToken();
  if (!t) return;
  const targetEmail = String(formData.get("email") ?? "").toLowerCase();
  const role = String(formData.get("role") ?? "client");
  if (role !== "admin" && role !== "client") return;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(targetEmail) || targetEmail.length > 254) return;
  try {
    await convex().mutation(api.secure.setUserRole, {
      actorTokenHash: t,
      targetEmail,
      role,
    });
  } catch {
    // solo founder; tutto ok
  }
  await revalidatePath("/backoffice/utenti");
}
