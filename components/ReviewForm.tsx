"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Input";

export function ReviewForm({
  orderId,
  email,
  productSlug,
  productName,
  alreadyReviewed,
}: {
  orderId: string;
  email: string;
  productSlug: string;
  productName: string;
  alreadyReviewed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyReviewed);

  if (done) {
    return <p className="text-sm text-text-muted">✓ You reviewed {productName}.</p>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold text-accent-text">
        Review {productName}
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { message } = await api.reviews.create({ orderId, email, productSlug, rating, quote });
      setDone(true);
      void message;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-chip border border-border p-4">
      <p className="text-sm font-semibold">Rate {productName}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            className={n <= rating ? "text-accent-text" : "text-text-muted"}
            style={{ fontSize: 20, lineHeight: 1 }}
          >
            ★
          </button>
        ))}
      </div>
      <Textarea id={`review-${productSlug}`} label="Your review" value={quote} onChange={(e) => setQuote(e.target.value)} required />
      {error && <p className="text-sm text-error-text">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit review"}</Button>
      </div>
    </form>
  );
}
