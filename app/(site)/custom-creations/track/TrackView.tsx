"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";
import { Timeline } from "@/components/Timeline";

type TrackResult = {
  requestNumber: string;
  projectName: string;
  category: string;
  status: string;
  quotedPrice: number | null;
  finalAmount: number | null;
  productionDays: number | null;
  paymentStatus: string;
  convertedOrderId: string | null;
  createdAt: string;
  history: { previousStatus: string | null; newStatus: string; createdAt: string }[];
  latestQuotation: { secureToken: string; status: string; finalAmount: number; validUntil: string } | null;
};

export function TrackView() {
  const params = useSearchParams();
  const [requestNumber, setRequestNumber] = useState(params.get("requestNumber") ?? "");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { api } = await import("@/lib/api");
      const data = (await api.customCreations.track(requestNumber.trim(), { email: email.trim() })) as TrackResult;
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not find that request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold">Track your custom creation request</h1>
      <form onSubmit={lookup} className="mt-6 flex flex-col gap-4 rounded-card bg-surface p-6 shadow-sm">
        <Field id="requestNumber" label="Request number" value={requestNumber} onChange={(e) => setRequestNumber(e.target.value)} placeholder="CC-2026-123456" />
        <Field id="email" label="Email used in your request" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <p className="text-sm text-error-text">{error}</p>}
        <Button type="submit" loading={loading}>Track request</Button>
      </form>

      {result && (
        <div className="mt-6 flex flex-col gap-4 rounded-card bg-surface p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">{result.projectName}</h2>
            <p className="text-sm text-text-muted">{result.requestNumber} · Submitted {new Date(result.createdAt).toLocaleDateString()}</p>
          </div>
          <Timeline
            steps={result.history.map((h) => h.newStatus.replace(/_/g, " "))}
            current={result.history.length - 1}
          />
          {result.latestQuotation && result.latestQuotation.status === "sent" && (
            <div className="rounded-input border border-border p-4">
              <p className="text-sm font-semibold">Quotation ready — ₹{result.latestQuotation.finalAmount}</p>
              <p className="text-xs text-text-muted">Valid until {new Date(result.latestQuotation.validUntil).toLocaleDateString()}</p>
              <Link href={`/custom-creations/quotation/${result.latestQuotation.secureToken}`} className="mt-2 inline-block text-sm font-semibold text-accent-text">
                View and respond to quotation →
              </Link>
            </div>
          )}
          {result.convertedOrderId && (
            <Link href={`/account/orders/${result.convertedOrderId}`} className="text-sm font-semibold text-accent-text">
              View order {result.convertedOrderId} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
