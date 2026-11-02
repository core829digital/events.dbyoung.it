"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type ScanState =
  | { kind: "idle" }
  | { kind: "ok"; name: string; surname: string }
  | { kind: "already" }
  | { kind: "invalid"; msg: string };

const divId = "qr-scanner-area";

/**
 * Scanner QR con camera (html5-qrcode) + inserimento manuale del codice.
 * Ogni check-in passa da /api/backoffice/checkin (POST, sessione
 * admin|founder nel cookie httpOnly, firma HMAC verificata server-side,
 * doppioni e evento giusto validati in Convex).
 */
export function QrScannerPanel({
  lang,
  events,
  defaultEventId,
}: {
  lang: Lang;
  events: Array<{ id: string; title: string; startAt: number }>;
  defaultEventId?: string;
}) {
  const d = t(lang).backofficePage;
  const [eventId, setEventId] = useState(defaultEventId || events[0]?.id || "");
  const [running, setRunning] = useState(false);
  const [state, setState] = useState<ScanState>({ kind: "idle" });
  const [manual, setManual] = useState("");
  const [okTotal, setOkTotal] = useState(0);
  const lastCode = useRef<string | null>(null);
  const busy = useRef(false);
  const scanner = useRef<Html5Qrcode | null>(null);

  // ferma la camera smontando il componente o se l'admin cambia evento
  useEffect(() => {
    return () => {
      stop().catch(() => undefined);
    };
    async function stop() {
      const s = scanner.current;
      if (s) {
        scanner.current = null;
        setRunning(false);
        try {
          await s.stop();
        } catch {
          // camera già ferma
        }
      }
    }
  }, []);

  const onResult = useCallback(
    async (payload: string) => {
      if (!eventId || busy.current) return;
      const dedupe = payload.replace(/^[A-Z0-9]+$/, (c) => c);
      if (lastCode.current === dedupe) return;
      lastCode.current = dedupe;
      busy.current = true;
      try {
        const body = payload.startsWith("EVQ1")
          ? { payload, eventId }
          : { code: payload.toUpperCase().trim(), eventId };
        const res = await fetch("/api/backoffice/checkin", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; name?: string; surname?: string };
        if (res.ok && data.ok) {
          setOkTotal((n) => n + 1);
          setState({ kind: "ok", name: data.name ?? "?", surname: data.surname ?? "?" });
        } else if (res.status === 409 && data.error?.includes("Già")) {
          setState({ kind: "already" });
        } else {
          setState({ kind: "invalid", msg: data.error ?? d.scanInvalid });
        }
      } catch {
        setState({ kind: "invalid", msg: "Network" });
      } finally {
        // piccolo cooldown anti-double-scan
        setTimeout(() => {
          busy.current = false;
          lastCode.current = null;
        }, 2500);
        if (navigator.vibrate) navigator.vibrate(120);
      }
    },
    [eventId, d.scanInvalid],
  );

  async function toggleScanner() {
    if (running || !scanner.current) {
      const s = new Html5Qrcode(divId, { verbose: false });
      scanner.current = s;
      try {
        await s.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            void onResult(decoded);
          },
          () => { /* frame senza QR: callback di errore silenzioso */ },
        );
        setRunning(true);
      } catch {
        setState({ kind: "invalid", msg: lang === "en" ? "Camera unavailable." : "Camera non disponibile." });
        scanner.current = null;
      }
    } else {
      await scanner.current.stop().catch(() => undefined);
      scanner.current = null;
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <label className="block text-sm text-cream/70">
        <span className="mb-1.5 block">{t(lang).booking.when}</span>
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="w-full rounded-2xl border border-cream/20 bg-white/5 px-3.5 py-3 text-cream outline-none focus:border-gold"
        >
          {events.map((e) => (
            <option key={e.id} value={e.id} className="bg-ink">
              {e.title} · {new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", { dateStyle: "short", timeStyle: "short" }).format(new Date(e.startAt))}
            </option>
          ))}
        </select>
      </label>

      <div id={divId} className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-black/40 [&_video]:!w-full" />

      <button
        type="button"
        onClick={toggleScanner}
        disabled={!eventId}
        className="mt-4 w-full rounded-full bg-gold px-6 py-3.5 font-semibold text-ink transition hover:bg-cream disabled:opacity-50"
      >
        {running ? (lang === "en" ? "■ Stop camera" : "■ Ferma camera") : d.scan}
      </button>

      {/* Inserimento manuale (QR OSTACOLI? codice token a mano) */}
      <form
        action={(fd) => {
          const c = String(fd.get("code") ?? "");
          if (c) void onResult(c);
          setManual("");
        }}
        className="mt-4 flex gap-2"
      >
        <input
          name="code"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder={`${d.manualCode} · XXXXXXXXXXXXXXXXXXXXXXXX`}
          className="w-full rounded-2xl border border-cream/20 bg-white/5 px-3.5 py-2.5 font-mono uppercase tracking-widest text-cream placeholder-cream/30 outline-none focus:border-gold"
          maxLength={24}
          autoComplete="off"
        />
        <button type="submit" className="rounded-2xl border border-cream/25 px-4 text-sm text-cream/80 hover:border-gold hover:text-gold">↵</button>
      </form>

      <div className="mt-4 min-h-20" aria-live="polite">
        {state.kind === "ok" ? (
          <div className="rounded-2xl border border-gold bg-gold/10 px-4 py-3 text-sm text-gold">
            ✓ {d.scanOk} — <b>{state.surname} {state.name}</b> ({okTotal})
          </div>
        ) : state.kind === "already" ? (
          <div className="rounded-2xl border border-cream/30 bg-white/5 px-4 py-3 text-sm text-cream/80">↺ {d.scanDone}</div>
        ) : state.kind === "invalid" ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">✗ {state.msg}</div>
        ) : (
          <p className="px-4 py-3 text-sm text-cream/50">{d.scanHint}</p>
        )}
      </div>
    </div>
  );
}
