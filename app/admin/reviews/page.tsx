"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusChip } from "@/components/StatusChip";

type Review = {
  id: string;
  orderId: string;
  productSlug: string;
  productName: string;
  customerName: string;
  rating: number;
  quote: string;
  createdAt: string;
  approved: boolean;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.reviews.adminList().then(({ reviews }: { reviews: Review[] }) => {
      setReviews(reviews);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  async function setApproved(id: string, value: boolean) {
    setBusyId(id);
    setError(null);
    try {
      const { review } = await api.reviews.adminSetApproved(id, value);
      setReviews((rs) => rs.map((r) => (r.id === id ? review : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this review.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await api.reviews.adminDelete(id);
      setReviews((rs) => rs.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this review.");
    } finally {
      setBusyId(null);
    }
  }

  function Row({ review }: { review: Review }) {
    return (
      <tr className="border-b border-border last:border-0">
        <td className="px-4 py-3">
          <p className="font-medium">{review.productName}</p>
          <p className="text-xs text-text-muted">{review.customerName} · {review.orderId}</p>
        </td>
        <td className="px-4 py-3">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</td>
        <td className="max-w-[320px] px-4 py-3 text-text-muted">{review.quote}</td>
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-3">
            {!review.approved && (
              <button disabled={busyId === review.id} onClick={() => setApproved(review.id, true)} className="text-xs font-semibold text-success-text disabled:opacity-50">Approve</button>
            )}
            {review.approved && (
              <button disabled={busyId === review.id} onClick={() => setApproved(review.id, false)} className="text-xs font-semibold text-text-muted disabled:opacity-50">Unpublish</button>
            )}
            <button disabled={busyId === review.id} onClick={() => remove(review.id)} className="text-xs font-semibold text-error-text disabled:opacity-50">Delete</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Reviews</h1>
      {error && <p className="text-sm text-error-text">{error}</p>}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Pending approval</h2>
          <StatusChip tone="warning">{pending.length}</StatusChip>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-text-muted">No reviews waiting for approval.</p>
        ) : (
          <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
            <table className="w-full min-w-[640px] text-sm">
              <tbody>{pending.map((r) => <Row key={r.id} review={r} />)}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Published</h2>
        {approved.length === 0 ? (
          <p className="text-sm text-text-muted">No published reviews yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
            <table className="w-full min-w-[640px] text-sm">
              <tbody>{approved.map((r) => <Row key={r.id} review={r} />)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
