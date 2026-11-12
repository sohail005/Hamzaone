import Link from "next/link";
import { api } from "@/lib/api";
import { StatusChip } from "@/components/StatusChip";

export default async function AdminCustomRequestsPage() {
  const { "custom-requests": customRequests } = await api.admin.list("custom-requests");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Custom requests</h1>
      {customRequests.length === 0 ? (
        <p className="text-sm text-text-muted">No custom requests yet.</p>
      ) : (
      <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-b border-border text-left text-text-muted">
            <tr>
              <th className="px-4 py-3">Request</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {customRequests.map((r: { id: string; customer: string; fileName: string; material: string; status: string }) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{r.id}</td>
                <td className="px-4 py-3">{r.customer}</td>
                <td className="px-4 py-3 text-text-muted">{r.fileName}</td>
                <td className="px-4 py-3">{r.material}</td>
                <td className="px-4 py-3"><StatusChip tone={r.status === "completed" ? "success" : r.status === "new" ? "warning" : "accent"}>{r.status}</StatusChip></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/custom-requests/${r.id}`} className="text-xs font-semibold text-accent-text">Review</Link>
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
