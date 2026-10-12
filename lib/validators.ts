import { z } from "zod";
import type { Lang } from "./i18n";

const messages = {
  it: {
    kind: "Scegli il tipo di evento",
    name: "Nome richiesto",
    email: "Email non valida",
    phone: "Telefono richiesto",
    date: "Data richiesta",
    guests: "Minimo 2 ospiti",
    message: "Raccontaci l'idea (min 10 caratteri)",
    privacy: "Devi accettare la privacy policy",
  },
  en: {
    kind: "Choose the event type",
    name: "Name required",
    email: "Invalid email",
    phone: "Phone required",
    date: "Date required",
    guests: "Minimum 2 guests",
    message: "Tell us the idea (min 10 characters)",
    privacy: "You must accept the privacy policy",
  },
} satisfies Record<Lang, Record<string, string>>;

export function quoteSchema(lang: Lang = "it") {
  const m = messages[lang];
  return z.object({
    kind: z.enum(["dimitri", "terzi"], { message: m.kind }),
    name: z.string().min(2, m.name).max(80),
    email: z.string().email(m.email),
    phone: z.string().min(6, m.phone).max(30),
    date: z.string().min(1, m.date),
    guests: z.coerce.number().int().min(2, m.guests).max(500),
    eventSlug: z.string().optional().default(""),
    message: z.string().min(10, m.message).max(2000),
    privacy: z.literal(true, { message: m.privacy }),
    lang: z.enum(["it", "en"]).optional().default(lang),
  });
}

export type QuoteInput = z.infer<ReturnType<typeof quoteSchema>>;
