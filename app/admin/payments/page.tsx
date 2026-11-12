"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { formatINR, cx } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";

type Payment = { id: string; orderId: string; method: string; amount: number; status: string; maskedId: string; date: string };

const FILTERS = ["all", "paid", "pending", "failed", "refunded"];

function PaymentsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const status = params.get("status") ?? "all";
  const selectedId = params.get("id");

  useEffect(() => {
    api.admin.list("payments").then(({ payments }: { payments: Payment[] }) => {
      setPayments(payments);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  const filtered = status === "all" ? payments : payments.filter((p) => p.status === status);
  const selected = payments.find((p) => p.id === selectedId);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Payments</h1>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => router.push(f === "all" ? "/admin/payments" : `/admin/payments?status=${f}`)}
            className={cx("rounded-full border px-4 py-1.5 text-sm font-medium capitalize", status === f ? "border-accent bg-mto-chip-bg text-accent-text" : "border-border-input text-text-muted")}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted">No payments yet.</p>
        ) : (
        <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="border-b border-border text-left text-text-muted">
              <tr><th className="px-4 py-3">Payment ID</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <button onClick={() => router.push(`/admin/payments?id=${p.id}`)} className="font-medium text-accent-text">{p.maskedId}</button>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{p.orderId}</td>
                  <td className="px-4 py-3">{formatINR(p.amount)}</td>
                  <td className="px-4 py-3"><StatusChip tone={p.status === "paid" ? "success" : p.status === "pending" ? "warning" : p.status === "failed" ? "error" : "neutral"}>{p.status}</StatusChip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {selected && (
          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold">Payment details</h2>
            <p className="text-sm text-text-muted">{selected.maskedId}</p>
            <p className="mt-2 text-sm">Order: {selected.orderId}</p>
            <p className="text-sm">Method: {selected.method}</p>
            <p className="text-sm">Amount: {formatINR(selected.amount)}</p>
            <p className="text-sm">Date: {selected.date}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  return (
    <Suspense>
      <PaymentsContent />
    </Suspense>
  );
}
