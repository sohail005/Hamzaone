"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";

type RequestRow = {
  id: string;
  requestNumber: string;
  customerName: string;
  projectName: string;
  category: string;
  createdAt: string;
  quantity: number;
  status: string;
  quotedPrice: number | null;
};

const STAT_TILES: { key: string; label: string }[] = [
  { key: "__total", label: "Total Requests" },
  { key: "PENDING_REVIEW", label: "Pending Review" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "QUOTATION_SENT", label: "Quotations Sent" },
  { key: "CUSTOMER_APPROVED", label: "Approved" },
  { key: "IN_PRODUCTION", label: "In Production" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const STATUS_TONE: Record<string, "success" | "warning" | "error" | "neutral" | "accent"> = {
  PENDING_REVIEW: "neutral",
  UNDER_REVIEW: "accent",
  QUOTATION_SENT: "accent",
  CUSTOMER_APPROVED: "success",
  PAYMENT_PENDING: "warning",
  PAID: "success",
  IN_PRODUCTION: "accent",
  QUALITY_CHECK: "accent",
  READY_TO_SHIP: "success",
  SHIPPED: "success",
  COMPLETED: "success",
  REJECTED: "error",
  CANCELLED: "error",
};

export default function AdminCustomCreationsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.customCreations
      .adminList({ status: status || undefined, search: search || undefined })
      .then((data: { requests: RequestRow[]; total: number; statusCounts: Record<string, number> }) => {
        setRequests(data.requests);
        setTotal(data.total);
        setStatusCounts(data.statusCounts);
        setLoaded(true);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load requests.");
        setLoaded(true);
      });
  }, [status, search]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Custom Creations</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {STAT_TILES.map((t) => (
          <div key={t.key} className="rounded-card bg-surface p-4 shadow-sm">
            <p className="text-xs text-text-muted">{t.label}</p>
            <p className="mt-1 text-xl font-bold">{t.key === "__total" ? total : statusCounts[t.key] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by request #, name, project, email"
          className="h-10 min-w-[260px] flex-1 rounded-full border border-border-input bg-surface px-4 text-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-full border border-border-input bg-surface px-4 text-sm">
          <option value="">All statuses</option>
          {STAT_TILES.filter((t) => t.key !== "__total").map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
      </div>

      {!loaded ? (
        <div className="rounded-card bg-surface p-10 text-center text-sm text-text-muted shadow-sm">Loading…</div>
      ) : error ? (
        <div className="rounded-card bg-surface p-10 text-center text-sm text-error-text shadow-sm">{error}</div>
      ) : requests.length === 0 ? (
        <div className="rounded-card bg-surface p-10 text-center text-sm text-text-muted shadow-sm">No custom creation requests yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-border text-left text-text-muted">
              <tr>
                <th className="px-4 py-3">Request #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Quoted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{r.requestNumber}</td>
                  <td className="px-4 py-3">{r.customerName}</td>
                  <td className="px-4 py-3">{r.projectName}</td>
                  <td className="px-4 py-3 text-text-muted">{r.category}</td>
                  <td className="px-4 py-3 text-text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{r.quantity}</td>
                  <td className="px-4 py-3"><StatusChip tone={STATUS_TONE[r.status] ?? "neutral"}>{r.status.replace(/_/g, " ")}</StatusChip></td>
                  <td className="px-4 py-3">{r.quotedPrice ? formatINR(r.quotedPrice) : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/custom-creations/${r.id}`} className="text-xs font-semibold text-accent-text">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
