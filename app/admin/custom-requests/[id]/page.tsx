import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminCustomRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { "custom-requests": customRequests } = await api.admin.list("custom-requests");
  const request = customRequests.find((r: { id: string }) => r.id === id);
  if (!request) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/custom-requests" className="text-sm font-semibold text-accent-text">← All custom requests</Link>
      <h1 className="text-2xl font-bold">{request.id}</h1>
      <div className="rounded-card bg-surface p-5 shadow-sm">
        <p className="text-sm text-text-muted">Customer: {request.customer} ({request.email})</p>
        <p className="text-sm text-text-muted">File: {request.fileName} · Material: {request.material}</p>
        <p className="text-sm">Status: {request.status}</p>
      </div>
    </div>
  );
}
