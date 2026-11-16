"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";

const SYNC_MESSAGES: Record<string, string> = {
  paid: "Payment found and confirmed — the order is now paid.",
  failed: "Razorpay confirms this payment failed.",
  still_pending: "Razorpay has authorized but not yet captured this payment.",
  no_change: "No new payment found at Razorpay for this order.",
  already_paid: "This order is already marked paid.",
};

export function RecheckPaymentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function recheck() {
    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      const { synced } = await api.orders.recheckPayment(orderId);
      setMessage(SYNC_MESSAGES[synced] ?? "Checked Razorpay for this order.");
      if (synced === "paid" || synced === "failed") router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not recheck this payment.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" onClick={recheck} disabled={checking}>
        {checking ? "Checking Razorpay…" : "Recheck payment with Razorpay"}
      </Button>
      {message && <p className="text-sm text-text-muted">{message}</p>}
      {error && <p className="text-sm text-error-text">{error}</p>}
    </div>
  );
}
