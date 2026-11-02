import { z } from "zod";
import type { Lang } from "./i18n";

/**
 * Allowlist e sanitizzazione di TUTTI gli input utente:
 * - charset esplicito (no markup, no controllo)
 * - lunghezze limitate
 * - pattern per CI/codice fiscale / date
 */

/** Rimuove markup, caratteri di controllo, spazi eccessivi. */
export function sanitizeText(raw: string): string {
  return raw
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f]/g, " ")
    .replace(/</g, "\u2039") // < → ‹ (no markup in nessuno stream/email)
    .replace(/>/g, "\u203a")
    .replace(/\s+/g, " ")
    .trim();
}

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email("Email non valida"),
  password: z.string().min(1, "Password richiesta").max(128),
});

// scrypt + regole ANAC-like: 10+, lettera+numerosi
export const passwordSchema = z
  .string()
  .min(10, "Password: minimo 10 caratteri")
  .max(128)
  .regex(/[a-z]/, "Serve almeno una minuscola")
  .regex(/[A-Z]/, "Serve almeno una maiuscola")
  .regex(/[0-9]/, "Serve almeno un numero");

export const registerSchema = z
  .object({
    name: z
      .string()
      .transform(sanitizeText)
      .pipe(z.string().min(2, "Nome troppo corto").max(60).regex(/^[a-zA-ZÀ-Ωà-ÿ' -]+$/, "Nome non valido")),
    surname: z
      .string()
      .transform(sanitizeText)
      .pipe(z.string().min(2, "Cognome troppo corto").max(60).regex(/^[a-zA-ZÀ-Ωà-ÿ' -]+$/, "Cognome non valido")),
    email: z.string().trim().toLowerCase().max(254).email("Email non valida"),
    password: passwordSchema,
    passwordConfirm: z.string().min(1, "Conferma la password"),
    accept: z.literal(true, { message: "Accetta la privacy policy" }),
    lang: z.enum(["it", "en"]).optional().default("it"),
  })
  .refine((v) => v.password === v.passwordConfirm, { message: "Le password non coincidono" });

/** Codice fiscale (16 caratteri, formato standard Agenzia Entrate). */
export const CF_SCHEMA = z
  .string()
  .transform((s) => s.trim().toUpperCase().replace(/\s/g, ""))
  .pipe(
    z
      .string()
      .length(16, "Codice fiscale: 16 caratteri")
      .regex(
        /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/,
        "Codice fiscale non valido",
      ),
  );

/** Data di nascita yyyy-mm-dd; tra 1900 e oggi-16anni? No: anche minori ok (CF). */
export const DOB_SCHEMA = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data di nascita non valida")
  .refine((s) => {
    const [y, m, d] = s.split("-").map(Number);
    if (y < 1900 || m < 1 || m > 12 || d < 1 || d > 31) return false;
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }, "Data di nascita non valida");

export const ATTENDEE_SCHEMA = z.object({
  name: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(2, "Nome troppo corto").max(60).regex(/^[a-zA-ZÀ-Ωà-ÿ' -]+$/, "Nome non valido")),
  surname: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(2, "Cognome troppo corto").max(60).regex(/^[a-zA-ZÀ-Ωà-ÿ' -]+$/, "Cognome non valido")),
  dob: DOB_SCHEMA,
  cf: CF_SCHEMA,
});

export const bookingSchema = z.object({
  eventId: z.string().regex(/^[a-z0-9]{20,40}$/, "Evento non valido"),
  quantity: z.coerce.number().int().min(1, "Almeno 1 posto").max(20, "Massimo 20 posti per prenotazione"),
  attendees: z.array(ATTENDEE_SCHEMA).min(1).max(20),
  contactName: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(2).max(80)),
  contactEmail: z.string().trim().toLowerCase().max(254).email("Email non valida"),
  contactPhone: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(6, "Telefono richiesto").max(30).regex(/^[+\d ()-]+$/, "telefono non valido")),
  lang: z.enum(["it", "en"]).default("it"),
});

export const reviewSchema = z.object({
  bookingId: z.string().regex(/^[a-z0-9]{20,40}$/, "Prenotazione non valida"),
  rating: z.coerce.number().int().min(1, "Voto 1-5").max(5),
  comment: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().max(500, "Massimo 500 caratteri"))
    .optional(),
});

/** Evento form (backoffice admin/founder) */
export const eventFormSchema = z.object({
  id: z.string().regex(/^[a-z0-9]{20,40}$/).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .transform((s) => s.normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    .pipe(z.string().min(3).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug non valido")),
  title: z.string().transform(sanitizeText).pipe(z.string().min(3, "Titolo richiesto").max(120)),
  tagline: z.string().transform(sanitizeText).pipe(z.string().max(160)),
  description: z.string().transform((s) => s.replace(/\r/g, "")).pipe(z.string().min(10).max(4000)),
  image: z.enum([
    "/location/panoramica.jpg",
    "/location/piscina.jpg",
    "/location/piscina-sera.jpg",
    "/location/villa-parco.jpg",
    "/location/carrozza.jpg",
    "/location/cavalli.jpg",
    "/location/cappella.jpg",
    "/location/appartamenti.jpg",
  ]),
  startAt: z.coerce.number().int().positive(),
  endAt: z.coerce.number().int().positive(),
  capacity: z.coerce.number().int().min(1, "Almeno 1 posto").max(2000),
  pricePerPerson: z.coerce.number().min(0).max(100000),
  locationNote: z.string().transform(sanitizeText).pipe(z.string().max(300)),
  published: z.coerce.boolean(),
});

// Tipi per applicazioni esterne + form di richiesta (legacy /api/send)
export type ReviewInput = z.infer<typeof reviewSchema>;
export type EventFormInput = z.infer<typeof eventFormSchema>;

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
    name: z.string().transform(sanitizeText).pipe(z.string().min(2, m.name).max(80)),
    email: z.string().transform(sanitizeText).pipe(z.string().email(m.email).max(254)),
    phone: z.string().transform(sanitizeText).pipe(z.string().min(6, m.phone).max(30).regex(/^[+\d ()-]+$/, m.phone)),
    date: z.string().transform(sanitizeText).pipe(z.string().min(1, m.date).max(40)),
    guests: z.coerce.number().int().min(2, m.guests).max(500),
    eventSlug: z.string().optional().default(""),
    message: z.string().transform((s) => s.replace(/\r/g, "")).pipe(z.string().min(10, m.message).max(2000)),
    privacy: z.literal(true, { message: m.privacy }),
    lang: z.enum(["it", "en"]).optional().default(lang),
  });
}

export type QuoteInput = z.infer<ReturnType<typeof quoteSchema>>;

