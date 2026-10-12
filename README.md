# Eventi DBYoung — events.dbyoung.it

Portale eventi di **Dimitri Bouterline (DBYoung)** presso **Fattoria Isola, Laterina (AR)**.
Due format: **1) eventi firmati Dimitri** · **2) eventi organizzati da terzi in location**.
Positioning: esperienza premium su misura — nessun listino pubblico, ogni lead va in call Calendly.

Stack: Next.js 16 + TypeScript + Tailwind v4 · Convex · Resend · Calendly · Vercel.

## Sviluppo

```bash
npm install
cp .env.example .env.local   # compila: Calendly URL, Resend, Convex
npm run dev                  # http://localhost:3000
npm run build                # verifica produzione
```

Le foto in `public/location/` sono le foto originali della tenuta (vedi `public/location/README.md`).
Ogni immagine ha un fallback remoto di sicurezza in `lib/site.ts`, usato solo se il file locale manca.

## Integrazioni

- **Convex**: `npx convex dev` (login richiesto) genera `convex/_generated/`, poi togliere `"convex"` da `exclude` in `tsconfig.json` e fare deploy. Schema: `events`, `bookings`, `gallery`.
- **Resend**: verifica `events.dbyoung.it`, `RESEND_API_KEY`, `RESEND_FROM=Eventi DBYoung <contact@dbyoung.it>`, `BOOKING_TO=contact@dbyoung.it`. Senza key, `/api/send` logga e risponde ok (dev).
- **Calendly**: `NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/core829/dbyoung-events` (già in `.env.local`; riportarlo nelle env Vercel).
- **Deploy**: push su GitHub → import su Vercel → env vars → dominio `events.dbyoung.it`.
