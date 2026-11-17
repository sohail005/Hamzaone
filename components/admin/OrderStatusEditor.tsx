"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/orderStatus";

export function OrderStatusEditor({
  orderId,
  initialStatus,
  initialTrackingNumber,
  initialCarrier,
}: {
  orderId: string;
  initialStatus: string;
  initialTrackingNumber?: string;
  initialCarrier?: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber ?? "");
  const [carrier, setCarrier] = useState(initialCarrier ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.orders.update(orderId, {
        status,
        trackingNumber: trackingNumber.trim() || null,
        carrier: carrier.trim() || null,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Fulfilment</h2>
      <div>
        <label className="text-sm font-semibold" htmlFor="order-status">Status</label>
        <select
          id="order-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1.5 h-12 w-full rounded-input border border-border-input bg-surface px-4 text-sm"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="carrier" label="Carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. Delhivery" />
        <Field id="tracking-number" label="Tracking number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="AWB number" />
      </div>
      {error && <p className="text-sm text-error-text">{error}</p>}
      {saved && !error && <p className="text-sm text-success-text">Saved.</p>}
      <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
    </form>
  );
}
