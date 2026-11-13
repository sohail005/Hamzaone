"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { Textarea } from "@/components/Input";
import { Button } from "@/components/Button";
import { Timeline } from "@/components/Timeline";
import { CustomCreationImageGallery } from "@/components/admin/CustomCreationImageGallery";
import { CustomCreationQuotationBuilder } from "@/components/admin/CustomCreationQuotationBuilder";
import { CUSTOM_CREATION_STATUSES } from "@/lib/server/custom-creations-status";

type RequestDetail = {
  id: string;
  requestNumber: string;
  customerName: string;
  email: string;
  phone: string;
  whatsappNumber: string | null;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  projectName: string;
  category: string;
  description: string;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  dimensionsNotSure: boolean;
  quantity: number;
  preferredMaterial: string | null;
  preferredColor: string | null;
  finishingRequirement: string | null;
  intendedPurpose: string | null;
  expectedBudget: number | null;
  requiredByDate: string | null;
  additionalInstructions: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

type Image = { id: string; originalFilename: string };
type HistoryEntry = { newStatus: string; changedBy: string; note: string | null; createdAt: string };
type Quotation = { id: string; version: number; finalAmount: number; status: "draft" | "sent" | "accepted" | "declined"; validUntil: string };

export default function AdminCustomCreationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ request: RequestDetail; images: Image[]; history: HistoryEntry[]; quotations: Quotation[] } | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    api.customCreations.adminGet(id).then((d) => {
      setData(d);
      setNotes(d.request.adminNotes ?? "");
    });
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function saveNotes() {
    setSavingNotes(true);
    try {
      await api.customCreations.adminUpdateNotes(id, notes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  async function changeStatus(newStatus: string) {
    setUpdatingStatus(true);
    setError(null);
    try {
      await api.customCreations.adminUpdateStatus(id, newStatus);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (!data) return <p className="text-sm text-text-muted">Loading…</p>;
  const { request, images, history, quotations } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{request.requestNumber}</h1>
          <p className="text-sm text-text-muted">{request.projectName} · submitted {new Date(request.createdAt).toLocaleDateString()}</p>
        </div>
        <Link href="/admin/custom-creations" className="text-sm font-semibold text-accent-text">← Back to list</Link>
      </div>

      {error && <p className="text-sm text-error-text">{error}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Customer details</h2>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-text-muted">Name</dt><dd>{request.customerName}</dd></div>
              <div><dt className="text-text-muted">Email</dt><dd>{request.email}</dd></div>
              <div><dt className="text-text-muted">Phone</dt><dd>{request.phone}</dd></div>
              <div>
                <dt className="text-text-muted">WhatsApp</dt>
                <dd>
                  {request.whatsappNumber ? (
                    <a href={`https://wa.me/91${request.whatsappNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-success-text">
                      <MessageCircle className="h-3.5 w-3.5" /> {request.whatsappNumber}
                    </a>
                  ) : "—"}
                </dd>
              </div>
              <div className="sm:col-span-2"><dt className="text-text-muted">Delivery address</dt><dd>{request.deliveryCity}, {request.deliveryState} {request.deliveryPincode}</dd></div>
            </dl>
          </section>

          <section className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Project details</h2>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-text-muted">Category</dt><dd>{request.category}</dd></div>
              <div><dt className="text-text-muted">Quantity</dt><dd>{request.quantity}</dd></div>
              <div><dt className="text-text-muted">Dimensions</dt><dd>{request.dimensionsNotSure ? "Not sure" : `${request.lengthMm} x ${request.widthMm} x ${request.heightMm} mm`}</dd></div>
              <div><dt className="text-text-muted">Material</dt><dd>{request.preferredMaterial ?? "No preference"}</dd></div>
              <div><dt className="text-text-muted">Color</dt><dd>{request.preferredColor ?? "No preference"}</dd></div>
              <div><dt className="text-text-muted">Finishing</dt><dd>{request.finishingRequirement ?? "—"}</dd></div>
              <div><dt className="text-text-muted">Budget</dt><dd>{request.expectedBudget ? formatINR(request.expectedBudget) : "—"}</dd></div>
              <div><dt className="text-text-muted">Required by</dt><dd>{request.requiredByDate ? new Date(request.requiredByDate).toLocaleDateString() : "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-text-muted">Description</dt><dd>{request.description}</dd></div>
              {request.intendedPurpose && <div className="sm:col-span-2"><dt className="text-text-muted">Intended purpose</dt><dd>{request.intendedPurpose}</dd></div>}
              {request.additionalInstructions && <div className="sm:col-span-2"><dt className="text-text-muted">Additional instructions</dt><dd>{request.additionalInstructions}</dd></div>}
            </dl>
          </section>

          <section className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Reference images</h2>
            <CustomCreationImageGallery requestId={request.id} images={images} />
          </section>

          <section className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Quotation</h2>
            <CustomCreationQuotationBuilder requestId={request.id} quotations={quotations} onSaved={reload} />
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Status</h2>
            <select
              value={request.status}
              onChange={(e) => changeStatus(e.target.value)}
              disabled={updatingStatus}
              className="h-11 w-full rounded-[12px] border border-border-input bg-surface px-3 text-sm"
            >
              {CUSTOM_CREATION_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </section>

          <section className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Internal notes</h2>
            <Textarea id="adminNotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Design feasibility, material recommendations, production considerations…" />
            <Button className="mt-3 w-full" size="sm" onClick={saveNotes} loading={savingNotes}>Save notes</Button>
            <p className="mt-2 text-xs text-text-muted">Never visible to the customer.</p>
          </section>

          <section className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">History</h2>
            <Timeline steps={history.map((h) => h.newStatus.replace(/_/g, " "))} current={history.length - 1} />
          </section>
        </div>
      </div>
    </div>
  );
}
