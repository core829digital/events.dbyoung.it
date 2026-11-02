# Eventi DBYoung — events.dbyoung.it

Portale eventi di **Dimitri Boutourline (DBYoung)** presso **Fattoria Isola, Laterina (AR)**.
Due format: **1) eventi firmati Dimitri** — **2) eventi organizzati da terzi in location**.
Positioning: esperienza premium su misura — nessun listino pubblico per le call Calendly (marketing).

In più, un **sistema di eventi prenotabili** completo: biglietti con QR per persona
(nome, cognome, data di nascita, codice fiscale), pagamento Stripe, check-in in
backoffice, recensioni 5 stelle.

Stack: Next.js 16 + TypeScript + Tailwind v4 · Convex (DB) · Stripe (pagamenti) ·
Resend (email) · Calendly (call marketing) · Vercel.

## Ruoli e portali

| Ruolo   | Cosa può fare                                                                                        |
| ------- | ---------------------------------------------------------------------------------------------------- |
| Client  | Crea l'account, prenota gli eventi, vede i propri QR, cancella prenotazioni pending, lascia recensioni |
| Admin   | Tutto del client + backoffice: crea/modifica/pubblica eventi, vede prenotati e incassi, scanner QR    |
| Founder | Solo Dimitri (`AUTH_FOUNDER_EMAIL`): tutto dell'admin + gestione ruoli + eliminazione eventi          |

Il primo account registrato con l'email `AUTH_FOUNDER_EMAIL` diventa **founder** (bootstrap).
Il founder può promuovere client → admin dalla pagina `/backoffice/utenti`.

## Flusso di prenotazione (eventi prenotabili)

1. L'evento (creato nel backoffice, con capienza massima) appare in `/eventi` e nel dettaglio.
2. L'utente sceglie la quantità (1..posti rimasti) e inserisce per **ogni persona**
   nome, cognome, data di nascita e codice fiscale (formato Agenzia delle Entrate).
3. Paga con **Stripe Checkout** (quantity = persone, totale = prezzo × posti).
4. Il webhook Stripe (firma verificata, importo verificato) marca il booking pagato e
   crea un ticket con codice univoco per persona; l'email Resend contiene il QR
   (`/api/qr/<code>`).
5. All'ingresso un admin/founder scansiona il QR dal backoffice (`/backoffice/scan`):
   il ticket viene marcato `checkedIn` (doppioni e QR di altri eventi rifiutati).
6. A evento finito l'utente lascia 1–5 stelle da `/account`; le recensioni compaiono
   in fondo alla pagina dell'evento.

Senza chiavi Stripe il punto 3–4 usa un percorso **dev** che simula il webhook con lo
stesso codice (booking pagato, ticket creati, email loggata a console): tutto il
sistema resta testabile in locale.

## Sicurezza (OWASP top-10)

- **Auth**: sessioni opache in cookie httpOnly `ev-sess`; nel database è salvato solo
  `sha256(token)`. Password con scrypt (N=2^15). Rate limit per IP e per account.
- **Autorizzazione**: ogni funzione Convex verifica sessione e ruolo **dentro il DB**
  (`requireSession`/`requireRole`/`requireServer`), quindi una URL Convex pubblica non
  espone nulla. Il client non parla mai direttamente con Convex: tutte le scritture
  passano da server action / route Next che forniscono `tokenHash` o `srvKey`.
- **Validazione e sanitizzazione**: allowlist zod per ogni form (`lib/validators.ts`),
  campi prefabbricati (immagine evento da enum locale), testi ripuliti, escape HTML
  nelle email.
- **QR firmati**: payload `EVQ1` + codice 24 char + HMAC-SHA256 troncato (SERVER_SECRET).
- **Stripe**: verifica firma webhook, controllo che `amount_total` coincida con il
  booking; idempotente.
- **Header**: `proxy.ts` applica CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy
  (camera solo first-party), host allowlist.
- **IP allowlist backoffice**: `BACKOFFICE_IP_ALLOWLIST` (solo lato server).
- **Capacità**: prenotazione atomica con grazia di 45 minuti per i pagamenti pendenti.

## Sviluppo

```bash
npm install
cp .env.example .env.local   # compila le variabili (vedi sotto)
npx convex dev               # backend locale + push funzioni
npm run dev                  # http://localhost:3000
npm run build                # verifica produzione
```

### Variabili d'ambiente

Vedi `.env.example`. Le più importanti:

- `SERVER_SECRET` (random 32 byte) e `SERVER_SECRET_HASH` = sha256 del secret.
  Imposta il hash anche nel deployment Convex:
  `npx convex env set SERVER_SECRET_HASH <sha256>`
- `AUTH_FOUNDER_EMAIL=contact@dbyoung.it` (bootstrap founder, anche in Convex env).
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` per i pagamenti reali;
  `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- `RESEND_API_KEY` + `RESEND_FROM` per le email con i QR.
- `BACKOFFICE_IP_ALLOWLIST` per limitare il backoffice a IP noti.
- `NEXT_PUBLIC_CONVEX_URL` (e `CONVEX_DEPLOYMENT`) del progetto Convex.

### Convex

```bash
npx convex login            # collega il progetto al tuo account
npx convex dev              # sviluppo: crea/aggiorna il deployment
npx convex deploy --prod    # produzione (env vars da impostare sul deployment)
```

Lo schema è in `convex/schema.ts`: `users`, `sessions`, `events`, `bookings`,
`tickets`, `reviews`. Le funzioni sono in `convex/*.ts` con i guard in `secure.ts`.

## Struttura principale

```
app/
  page.tsx                 home marketing
  eventi/                  lista + dettaglio (prenotabile o format statico)
  account/                 portale client (QR, recensioni, cancellazioni)
  login/, registrati/      auth
  backoffice/              dashboard, eventi CRUD, ospiti, scanner, utenti (founder)
  api/qr/[code]/           PNG del QR (solo ticket pagati)
  api/stripe/webhook/      webhook Stripe (firma verificata)
  api/backoffice/checkin/  endpoint check-in (scanner)
  actions/                 server action (auth, booking, backoffice)
convex/                    database + funzioni con guardie
lib/                       i18n, validators, crypto, helpers server
proxy.ts                   header di sicurezza + host allowlist
```

## Contatti

Tutto passa da **contact@dbyoung.it** — brand **Eventi DBYoung**.

## Deploy

Push su GitHub → import su Vercel → env vars → dominio `events.dbyoung.it`.
Per Convex: `npx convex deploy --prod` e impostare le env del deployment
(`SERVER_SECRET_HASH`, `AUTH_FOUNDER_EMAIL`, eventuali chiavi email/pagamenti).
