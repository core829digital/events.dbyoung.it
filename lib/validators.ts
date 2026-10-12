import { z } from "zod";

export const quoteSchema = z.object({
  kind: z.enum(["dimitri", "terzi"], { message: "Scegli il tipo di evento" }),
  name: z.string().min(2, "Nome richiesto").max(80),
  email: z.string().email("Email non valida"),
  phone: z.string().min(6, "Telefono richiesto").max(30),
  date: z.string().min(1, "Data richiesta"),
  guests: z.coerce.number().int().min(2, "Minimo 2 ospiti").max(500),
  eventSlug: z.string().optional().default(""),
  message: z.string().min(10, "Raccontaci l'idea (min 10 caratteri)").max(2000),
  privacy: z.literal(true, { message: "Devi accettare la privacy policy" }),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
