"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Field } from "@/components/Input";
import { formatINR } from "@/lib/format";

type TrackableOrder = {
  id: string;
  items: Array<{ name: string; qty: number }>;
  total: number;
  currency: "INR";
  paymentStatus: "pending" | "paid" | "failed";
  status: string;
  createdAt: string;
  updatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTrackableOrder(value: unknown): TrackableOrder | null {
  if (!isRecord(value) || !Array.isArray(value.items)) return null;
  const items = value.items.filter(
    (item): item is { name: string; qty: number } =>
      isRecord(item) && typeof item.name === "string" && typeof item.qty === "number",
  );
  if (
    typeof value.id !== "string" ||
    typeof value.total !== "number" ||
    value.currency !== "INR" ||
    (value.paymentStatus !== "pending" && value.paymentStatus !== "paid" && value.paymentStatus !== "failed") ||
    typeof value.status !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    items.length !== value.items.length
  ) {
    return null;
  }
  return {
    id: value.id,
    items,
    total: value.total,
    currency: value.currency,
    paymentStatus: value.paymentStatus,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function TrackOrderContent() {
  const params = useSearchParams();
  const orderFromLink = params.get("order") ?? "";
  const [orderId, setOrderId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackableOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayedOrderId = orderId ?? orderFromLink;

  async function trackOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const query = new URLSearchParams({ id: displayedOrderId.trim(), email: email.trim() });
      const response = await fetch(`/api/orders?${query.toString()}`, { cache: "no-store" });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = isRecord(payload) && typeof payload.error === "string"
          ? payload.error
          : "Could not look up this order.";
        throw new Error(message);
      }
      if (!isRecord(payload)) throw new Error("The order service returned an invalid response.");
      const result = parseTrackableOrder(payload.order);
      if (!result) throw new Error("The order service returned an invalid response.");
      setOrder(result);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Could not look up this order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold">Track your order</h1>
      <p className="mt-2 text-sm text-text-muted">Enter the order ID and checkout email to see the latest status.</p>

      <form onSubmit={trackOrder} className="mt-6 flex flex-col gap-4 rounded-card bg-surface p-5 shadow-sm">
        <Field
          id="order-id"
          label="Order ID"
          value={displayedOrderId}
          onChange={(event) => setOrderId(event.target.value)}
          required
          placeholder="HO-YYYY-<32 hex characters>"
        />
        <Field
          id="order-email"
          label="Checkout email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
        {error && <p role="alert" className="text-sm text-error-text">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Looking up order…" : "Track order"}
        </Button>
      </form>

      {order && (
        <section aria-live="polite" className="mt-6 rounded-card bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Order {order.id}</h2>
              <p className="mt-1 text-sm text-text-muted">
                Placed {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold capitalize">{order.status.replace(/_/g, " ")}</p>
              <p className="text-sm capitalize text-text-muted">Payment: {order.paymentStatus}</p>
            </div>
          </div>
          <ul className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
            {order.items.map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex justify-between gap-4">
                <span>{item.name} × {item.qty}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-border pt-4 font-semibold">
            <span>Total</span><span>{formatINR(order.total)}</span>
          </p>
        </section>
      )}
    </div>
  );
}

export function TrackOrderView() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[720px] px-4 py-12 sm:px-6">Loading order tracking…</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
