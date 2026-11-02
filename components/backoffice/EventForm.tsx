"use client";

import { useActionState, useId } from "react";
import { upsertEventAction, type EventFormState } from "@/app/actions/backoffice";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export type EventDefaults = {
  id?: string;
  slug?: string;
  title?: string;
  tagline?: string;
  description?: string;
  image?: string;
  startAt?: number;
  endAt?: number;
  capacity?: number;
  pricePerPerson?: number;
  locationNote?: string;
  published?: boolean;
};

const IMAGES = [
  ["panoramica.jpg", "Panoramica tenuta"],
  ["piscina.jpg", "Piscina 7×14"],
  ["piscina-sera.jpg", "Festa a bordo piscina"],
  ["villa-parco.jpg", "Villa seicentesca + parco"],
  ["carrozza.jpg", "Carrozza e borgo"],
  ["cavalli.jpg", "Cavalli / scuderie"],
  ["cappella.jpg", "Cappella privata"],
  ["appartamenti.jpg", "Interni toscani"],
] as const;

function toLocalInput(ms?: number): string {
  if (!ms) return "";
  const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

/** Form prefabbricato con allowlist: campi chiusi, nessun input libero oltre descrizione/note. */
export function EventForm({ lang, def }: { lang: Lang; def?: EventDefaults }) {
  const d = t(lang).backofficePage;
  const uid = useId();  const [state, formAction, pending] = useActionState<EventFormState, FormData>(upsertEventAction, {});
  const inputCls = "w-full rounded-2xl border border-cream/20 bg-white/5 px-3.5 py-2.5 text-cream placeholder-cream/30 outline-none focus:border-gold";
  const labelCls = "block text-sm text-cream/70";

  return (
    <form action={formAction} className="max-w-3xl space-y-5">
      {def?.id ? <input type="hidden" name="id" value={def.id} /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelCls}><span className="mb-1.5 block">{d.eventFieldTitle}</span>
          <input className={inputCls} name="title" defaultValue={def?.title ?? ""} required minLength={3} maxLength={120} />
        </label>
        <label className={labelCls}><span className="mb-1.5 block">{d.eventFieldSlug}</span>
          <input className={inputCls} name="slug" defaultValue={def?.slug ?? ""} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={60} placeholder="serata-jazz-bordo-piscina" />
        </label>
      </div>
      <label className={labelCls}><span className="mb-1.5 block">{d.eventFieldTagline}</span>
        <input className={inputCls} name="tagline" defaultValue={def?.tagline ?? ""} maxLength={160} />
      </label>
      <label className={labelCls}><span className="mb-1.5 block">{d.eventFieldDescription}</span>
        <textarea className={`${inputCls} min-h-28`} name="description" defaultValue={def?.description ?? ""} required minLength={10} maxLength={4000} />
      </label>
      <div>
        <p className="mb-1.5 text-sm text-cream/70">{d.eventFieldImage}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {IMAGES.map(([file, label]) => (
            <label key={file} className="cursor-pointer rounded-2xl border border-cream/20 bg-white/5 p-2 text-center text-xs text-cream/70 hover:border-gold has-checked:border-gold has-checked:text-gold">
              <input type="radio" name="image" value={`/location/${file}`} defaultChecked={def?.image === `/location/${file}` || (!def && file === "panoramica.jpg")} />
              {label}
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelCls}><span className="mb-1.5 block">{d.eventFieldStartAt}</span>
          <input type="datetime-local" className={inputCls} name="startAt" defaultValue={toLocalInput(def?.startAt)} required />
        </label>
        <label className={labelCls}><span className="mb-1.5 block">{d.eventFieldEndAt}</span>
          <input type="datetime-local" className={inputCls} name="endAt" defaultValue={toLocalInput(def?.endAt)} required />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <label className={labelCls}><span className="mb-1.5 block">{d.eventFieldCapacity}</span>
          <input type="number" min={1} max={2000} className={inputCls} name="capacity" defaultValue={def?.capacity ?? 100} required />
        </label>
        <label className={labelCls}><span className="mb-1.5 block">{d.eventFieldPrice}</span>
          <input type="number" min={0} max={100000} step="0.5" className={inputCls} name="pricePerPerson" defaultValue={def?.pricePerPerson ?? ""} required />
        </label>
      </div>
      <label className={labelCls}><span className="mb-1.5 block">{d.eventFieldLocationNote}</span>
        <input className={inputCls} name="locationNote" defaultValue={def?.locationNote ?? ""} maxLength={300} />
      </label>
      <label className="flex items-center gap-2.5 text-sm text-cream/70">
        <input type="checkbox" name="published" defaultChecked={def?.published ?? false} className="h-4 w-4 accent-[#c9a227]" />
        <span>{d.eventFieldPublished}</span>
      </label>
      {state.error ? (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>
      ) : null}
      {state.ok ? <p className="text-sm text-gold">{d.eventSaved}</p> : null}
      <button type="submit" disabled={pending} className="w-full rounded-full bg-gold px-6 py-3.5 font-semibold text-ink hover:bg-cream disabled:opacity-50 sm:w-auto sm:px-10">
        {pending ? "…" : d.eventSave}
      </button>
    </form>
  );
}
