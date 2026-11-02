"use client";

import { useActionState, useState } from "react";
import { reviewSubmitAction, type ReviewFormState } from "@/app/actions/booking";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function ReviewForm({
  bookingId,
  lang,
  canReview,
  alreadyReviewed,
}: {
  bookingId: string;
  lang: Lang;
  canReview: boolean;
  alreadyReviewed: boolean;
}) {
  const d = t(lang).accountPage;
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(reviewSubmitAction, {});

  return (
    <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4">
      <p className="text-sm font-semibold text-gold">{d.reviewTitle}</p>
      {alreadyReviewed ? (
        <p className="mt-1 text-xs text-cream/60">{d.reviewed}</p>
      ) : canReview && !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-ink hover:bg-cream"
        >
          {d.reviewCta}
        </button>
      ) : null}
      {open && !alreadyReviewed ? (
        <form action={formAction} className="mt-3">
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="rating" value={rating} />
          <div className="flex flex-row-reverse justify-end gap-1.5">
            {[5, 4, 3, 2, 1].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star`}
                onClick={() => setRating(n)}
                className={`h-8 w-8 text-2xl ${n <= rating ? "text-gold" : "text-cream/25"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            name="comment"
            rows={2}
            maxLength={500}
            placeholder={d.reviewComment}
            className="mt-2 w-full rounded-xl border border-cream/20 bg-white/5 px-3 py-2 text-sm text-cream placeholder-cream/30 outline-none focus:border-gold"
          />
          {state.error ? <p className="mt-2 text-xs text-red-300">{state.error}</p> : null}
          <button
            type="submit"
            disabled={pending || rating < 1}
            className="mt-2 w-full rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-cream disabled:opacity-50"
          >
            {d.reviewSubmit}
          </button>
        </form>
      ) : null}
    </div>
  );
}
