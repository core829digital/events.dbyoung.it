import type { Lang } from "@/lib/i18n";

export interface LegalSection {
  h: string;
  p: string;
}

export interface LegalDoc {
  slug: string;
  title: string;
  summaryIt: string;
  summaryEn: string;
  updated: string;
  sections: LegalSection[];
}

const updatedLine = "Ultimo aggiornamento: settembre 2026 · Titolare: Dimitri Bouturline (DBYoung)";

export const legalDocs: Record<string, LegalDoc> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    summaryIt: "Raccogliamo solo il necessario (dati di contatto, ordini via Stripe, newsletter con consenso). Nessun dato carta conservato. Diritti (accesso, cancellazione, portabilità): privacy@dbyoung.it.",
    summaryEn: "We collect only what we need (contact details, orders via Stripe, newsletter with consent). No card data stored. Rights (access, deletion, portability): privacy@dbyoung.it.",
    updated: `${updatedLine} — events.dbyoung.it`,
    sections: [
      { h: "1. Dati che raccogliamo", p: "Nome, email, contenuti dei messaggi (form contatti/booking), email newsletter, dati d'ordine (prodotti acquistati, importi, esiti pagamento via Stripe) e dati tecnici anonimi/aggregati di navigazione (pagine viste, click, dispositivo)." },
      { h: "2. Finalità e basi giuridiche (GDPR art. 6)", p: "Rispondere a richieste (esecuzione di misure precontrattuali); evadere ordini e obblighi fiscali (obbligo legale/contratto); newsletter solo previo consenso (revocabile anytime); statistiche aggregate e sicurezza (legittimo interesse)." },
      { h: "3. Pagamenti — Stripe", p: "I pagamenti sono elaborati da Stripe tramite Payment Link. Non conserviamo numeri di carta. Si applica l'informativa privacy di Stripe." },
      { h: "4. Email — Resend", p: "Le email transazionali (ordini, booking, newsletter) sono inviate tramite Resend. L'iscrizione alla newsletter richiede doppio opt-in ove attivato." },
      { h: "5. Conservazione", p: "Dati di contatto: fino a 24 mesi dall'ultimo scambio; dati fiscali: 10 anni; dati newsletter: fino a revoca del consenso." },
      { h: "6. I tuoi diritti (GDPR artt. 15–22)", p: "Accesso, rettifica, cancellazione, limitazione, portabilità, opposizione e revoca del consenso: scrivi a privacy@dbyoung.it. Reclamo al Garante (garanteprivacy.it)." },
      { h: "7. Cookie", p: "Vedi la Cookie Policy (/cookie). Nessun cookie di profilazione senza consenso." },
    ],
  },
  termini: {
    slug: "termini",
    title: "Termini di utilizzo",
    summaryIt: "L'acquisto di un file garantisce una licenza d'uso (non il copyright). Beni digitali: il recesso termina con l'inizio del download. I contratti live si concordano separatamente per iscritto.",
    summaryEn: "Buying a file grants a usage license (not copyright). Digital goods: withdrawal ends when download starts. Live contracts are agreed separately in writing.",
    updated: `${updatedLine} — events.dbyoung.it`,
    sections: [
      { h: "1. Oggetto", p: "dbyoung.it vende beat, sample pack e servizi di organizzazione eventi di Dimitri Bouturline (DBYoung). L'acquisto di un file non trasferisce il diritto d'autore, ma una licenza d'uso secondo il piano scelto." },
      { h: "2. Licenze beat", p: "Base (MP3): 1 brano commerciale fino a 50.000 stream. Premium (WAV+Stems): fino a 250.000 stream, video monetizzati, 1 videoclip. Esclusiva (su richiesta): il beat viene ritirato dallo shop. Credit obbligatorio: «Prod. DBYoung»." },
      { h: "3. Sample pack", p: "Tutti i suoni sono royalty-free per produzioni originali. Vietata la rivendita/redistribuzione dei sample grezzi o in pack concorrenti." },
      { h: "4. Pagamenti e consegna", p: "Pagamenti via Stripe Payment Link. Consegna digitale via email entro 24h (di norma immediata). Essendo beni digitali scaricabili, il diritto di recesso (art. 59 Codice del Consumo) decade con l'inizio del download previo consenso — salvo difetti di file, sostituiti o rimborsati." },
      { h: "5. Eventi", p: "Le prenotazioni dal calendario sono call conoscitive gratuite. I contratti di organizzazione eventi (preventivi, caparre, produzione) sono stipulati separatamente per iscritto." },
      { h: "6. Uso vietato", p: "Vietato rivendere i file grezzi, aggirare i pagamenti o usare il marchio DBYoung senza autorizzazione." },
      { h: "7. Legge applicabile", p: "Legge italiana. Foro competente: quello del consumatore (o Milano per B2B)." },
    ],
  },
  cookie: {
    slug: "cookie",
    title: "Cookie Policy",
    summaryIt: "Solo cookie tecnici di default. I cookie di terze parti (Calendly, Stripe, Spotify) si caricano solo dopo il tuo consenso.",
    summaryEn: "Only technical cookies by default. Third-party cookies (Calendly, Stripe, Spotify) load only after your consent.",
    updated: `${updatedLine} — events.dbyoung.it`,
    sections: [
      { h: "Cookie tecnici (sempre attivi)", p: "Preferenze essenziali, sicurezza, bilanciamento. Non richiedono consenso." },
      { h: "Statistiche aggregate", p: "Conteggi visite/click interni in forma aggregata." },
      { h: "Terze parti (solo previo consenso)", p: "Calendly (widget booking), Stripe (pagamenti), Spotify/YouTube (player embed), Vercel Analytics (se attivato)." },
      { h: "Gestione del consenso", p: "Puoi gestire i cookie dalle impostazioni del browser. Il banner di consenso del sito blocca i contenuti di terzi (Calendly, Spotify) fino alla tua scelta — puoi cambiare idea in qualsiasi momento cancellando la scelta dal browser (localStorage)." },
    ],
  },
  gdpr: {
    slug: "gdpr",
    title: "GDPR & Trattamento dati",
    summaryIt: "Titolare: Dimitri Bouturline (DBYoung). Responsabili: Vercel, Convex, Stripe, Resend, Calendly. Esercita i tuoi diritti: privacy@dbyoung.it (risposta entro 30 giorni).",
    summaryEn: "Data controller: Dimitri Bouturline (DBYoung). Processors: Vercel, Convex, Stripe, Resend, Calendly. Exercise your rights: privacy@dbyoung.it (reply within 30 days).",
    updated: `${updatedLine} — events.dbyoung.it`,
    sections: [
      { h: "Titolare", p: "Dimitri Bouturline (DBYoung) — email privacy@dbyoung.it." },
      { h: "Responsabili esterni (art. 28)", p: "Vercel (hosting), Convex (database), Stripe (pagamenti), Resend (email), Calendly (booking) — con DPA e, ove extra-UE, clausole SCC." },
      { h: "Misure", p: "HTTPS, accessi admin con autenticazione, minimizzazione, backup, log accessi." },
      { h: "Data breach", p: "Notifica al Garante entro 72h e agli interessati ove ad alto rischio (artt. 33–34 GDPR)." },
      { h: "Minori", p: "I servizi non sono rivolti a under-14 senza consenso genitoriale." },
      { h: "Diritti", p: "Per esercitare i diritti (accesso, cancellazione, portabilità, opposizione): privacy@dbyoung.it — risposta entro 30 giorni." },
    ],
  },
};

export function legalBindingNote(lang: Lang) {
  return lang === "it"
    ? "Testo legalmente vincolante in italiano."
    : "English summary above — the full legally binding text below is in Italian.";
}
