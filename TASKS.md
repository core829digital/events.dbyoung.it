# EVENTS.DBYOUNG.IT — Task List

> Portale eventi premium-accessibili di Dimitri Bouterline / DBYoung @ Fattoria Isola, Laterina (Toscana).
> Stack: Next.js + TypeScript + Convex + Resend + Calendly + GitHub + Vercel + 21st.dev

## 0. Toolchain & Ambiente (richiesta esplicita utente)

- [x] Verificare `git` installato → `git version 2.56.0.windows.2` OK
- [x] Installare `Node.js LTS` → `v24.20.0` via `winget install OpenJS.NodeJS.LTS` OK
- [x] Verificare `npm` / `npx` (inclusi in Node.js, non pacchetti separati) → `11.19.0` OK
  - Nota: `npm`/`npx` non si installano a parte. Se PowerShell dice "termine non riconosciuto":
    1. PATH stale (processo avviato prima dell'installazione) → refresh PATH o riavvia terminale
    2. `npm.ps1` bloccato da ExecutionPolicy → fix applicato: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
    3. Workaround immediato: usare `npm.cmd` / `npx.cmd`
- [x] Fix PowerShell ExecutionPolicy `CurrentUser → RemoteSigned` OK
- [x] Riavvio non necessario: PATH refresh OK, `npm`/`npx` funzionano in PowerShell (RemoteSigned). Riverifica finale con nuovo terminale consigliata
- [x] `git init` + commit + push su GitHub OK (`https://github.com/core829digital/events.dbyoung.it.git`, branch `main`). Resta: import su Vercel + auto-deploy

## 1. Analisi (precisione atomica) — DONE

- [x] Analizzare `https://dbyoung.it` (brand DBYoung, 4 generi, shop beat, pagina /eventi → Isola Events, Calendly call 30min, booking@dbyoung.it)
- [x] Analizzare `https://dbyoung.it/eventi` (due format annunciati, portale dedicato su events.dbyoung.it)
- [x] Analizzare `https://fattoriaisola.com/it/home-2/` (villa seicentesca, 200ha, 5 appartamenti, parco, cappella, Chianti/olio)
- [x] Analizzare `/it/servizi/` (piscina 7x14 + idromassaggio, gazebo, equitazione/pensione cavalli, calcio/volley/bocce/ping-pong, MTB, trekking, BBQ — piscina adatta a feste)
- [x] Analizzare `/it/appartamenti/` (Colombaia 55mq/5p, Mulino 50mq/5p vista piscina, Fattoria 80mq/6p mobili antichi, Officina 45mq/4p, Falegnameria 60mq/6p accessibile)
- [x] Foto originali della tenuta integrate (fallback remoti solo come scorta di sicurezza)
- [x] Audit completo: nessuna pagina admin esistente (solo parola in testo GDPR da dbyoung.it) · rimosso `react-calendly` mai importato + SVG template + dict `form`/`LANGS` inutilizzati · `/api/send`+`/grazie` tenuti come canale di riserva Resend
  - `1.jpg` (panoramica), `laterina_2_bis.jpg`, `carrozza-e-paese-medievale`, `parco-villa-da-sopra1.jpg`
  - `Piscina-HD.jpg`, `piscina_con-verde_bella.jpg`, `festa-alla-Fattoria-dellIsola.jpg`, `gazebo-e-piscina.jpg`
  - `horse.jpg`, `carrozza-davanti-alla-fattoria`, `DIMITRI-A-CAVALLO.jpg`, appartamenti `M_040.jpg`, `F_DSCF2971.jpg`, `C_soggiorno...`, ecc.

## 2. Prodotto — i 2 tipi di evento

- [ ] Tipo A — Eventi organizzati DA Dimitri (Eventi DBYoung presenta: jazz/blues/classica/moderna, club/festival/privati, direzione artistica + band + produzione)
- [ ] Tipo B — Eventi organizzati DA TERZI in location (matrimoni, privati, corporate, shooting, retreat; affitto spazi + servizi + pernottamento 26 posti)
- [x] Positioning: nessun prezzo pubblico — ogni CTA porta alla call Calendly (decisione cliente 12-10-2026)
- [ ] Gallery "Vedi la location con i tuoi occhi" ispirata a Fattoria Isola (parco, piscina, villa, cappella, appartamenti, cavalli)

## 3. Scaffolding Next.js + TS (in corso)

- [x] `create-next-app ./events-app` + `robocopy /MOVE` in root OK
- [x] Rinominare `package.json` → `events-dbyoung-it`, verificare `npm run build` OK (15 pagine statiche + /api/send dinamica)
- [x] Dipendenze pulite: rimosso `react-calendly` (mai importato, si usa embed iframe) e SVG template inutilizzati
- [ ] Configurare Tailwind theme DBYoung (oro/verde Toscana, serif elegante + sans moderno), font, metadata SEO IT/EN
- [ ] Pagine: `/` `/eventi` `/eventi/[slug]` `/location` `/organizza` `/grazie` `/privacy` `/api/send`
- [ ] Componenti 21st.dev-style: hero cinematico, marquee, card eventi, galleria lightbox, CTA call, FAQ, footer
- [x] Contatto unico `contact@dbyoung.it` (mittente + destinatario Resend, footer, errori form)
- [x] Pagine legali identiche a dbyoung.it: `/privacy` `/termini` `/cookie` `/gdpr` (summary EN + testo vincolante IT, link nel footer)
- [ ] Embed Calendly (call 30min gratis) con fallback link diretto
- [ ] `convex/schema.ts`: `events`, `bookings`, `gallery`, `testimonials` + seed eventi demo
- [ ] README con setup `.env` (`CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `RESEND_API_KEY`, `NEXT_PUBLIC_CALENDLY_URL`)

## 4. Integrazioni & Deploy

- [ ] Convex: `npx convex dev` + `npx convex deploy`, seed dati
- [ ] Resend: dominio `events.dbyoung.it` verificato, mittente `Eventi DBYoung <contact@dbyoung.it>`, template IT/EN
- [ ] Calendly: URL reale cliente in `.env` + embed testato (no cookie-wall bloccante)
- [ ] GitHub: repo `events.dbyoung.it`, branch `main`, commit atomici
- [ ] Vercel: progetto collegato a GitHub, env vars, dominio `events.dbyoung.it`, test auto-deploy

## 5. Qualità & Handoff

- [ ] Lighthouse ≥90, responsive 360px→4K, a11y, `next lint` + `tsc --noEmit` verdi
- [x] Lingue IT/EN come dbyoung.it (toggle in navbar, cookie `ev-lang`, contenuti + email bilingue)
- [ ] Consegnare credenziali/checklist a Dimitri (Calendly, Resend, Convex, Vercel)

---
*Ultimo aggiornamento: 12-10-2026. Toolchain: node v24.20.0, npm/npx 11.19.0, git 2.56.0.*
