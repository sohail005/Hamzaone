"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { orders } from "@/data/orders";
import { formatINR, cx } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";

const FILTERS = ["all", "printing", "shipped", "delivered", "pending", "canceled"];

function OrdersContent() {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get("status") ?? "all";

  const filtered = orders.filter((o) => {
    if (status === "all") return true;
    if (status === "pending") return o.paymentStatus === "pending";
    return o.status === status;
  });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => router.push(f === "all" ? "/admin/orders" : `/admin/orders?status=${f}`)}
            className={cx("rounded-full border px-4 py-1.5 text-sm font-medium capitalize", status === f ? "border-accent bg-mto-chip-bg text-accent-text" : "border-border-input text-text-muted")}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-b border-border text-left text-text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium text-accent-text">{o.id}</Link></td>
                <td className="px-4 py-3">{o.customer}</td>
                <td className="px-4 py-3">{formatINR(o.total)}</td>
                <td className="px-4 py-3"><StatusChip tone={o.paymentStatus === "paid" ? "success" : o.paymentStatus === "pending" ? "warning" : "error"}>{o.paymentStatus}</StatusChip></td>
                <td className="px-4 py-3 capitalize">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}
