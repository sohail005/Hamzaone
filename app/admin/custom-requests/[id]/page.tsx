"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/Button";
import { Field, Textarea } from "@/components/Input";

const CHECKLIST = [
  "Model is manifold with no open edges",
  "Wall thickness is printable for the chosen material",
  "Dimensions fit the build volume",
  "No unsupported overhangs beyond tolerance",
];

type CustomRequest = { id: string; customer: string; email: string; fileName: string; material: string; status: string };

export default function AdminCustomRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [printingCost, setPrintingCost] = useState(1560);
  const [materialCost, setMaterialCost] = useState(280);
  const [shipping, setShipping] = useState(79);
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST.map(() => false));
  const [preview, setPreview] = useState(false);
  const [sent, setSent] = useState(false);
  const [customerState, setCustomerState] = useState<"waiting" | "accepted" | "paid" | "rejected">("waiting");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);

  useEffect(() => {
    api.admin.list("custom-requests").then(({ "custom-requests": reqs }: { "custom-requests": CustomRequest[] }) => {
      setRequests(reqs);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  const request = requests.find((r) => r.id === params.id);
  if (!request) return <p className="text-sm text-text-muted">Request not found.</p>;

  const total = printingCost + materialCost + shipping;
  const allChecked = checked.every(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/custom-requests" className="text-sm font-semibold text-accent-text">← All custom requests</Link>
      <h1 className="text-2xl font-bold">{request.id}</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Request details</h2>
            <p className="text-sm text-text-muted">Customer: {request.customer} ({request.email})</p>
            <p className="text-sm text-text-muted">File: {request.fileName} · Material: {request.material}</p>
          </div>

          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Printability checklist</h2>
            <div className="flex flex-col gap-2">
              {CHECKLIST.map((item, i) => (
                <label key={item} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked[i]}
                    onChange={(e) => setChecked((c) => c.map((v, idx) => (idx === i ? e.target.checked : v)))}
                  />
                  {item}
                </label>
              ))}
            </div>
            {!allChecked && <p className="mt-2 text-xs text-warning-text">All items must be checked before sending a quote.</p>}
          </div>

          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Quote editor</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field id="printing" label="Printing cost (₹)" type="number" value={printingCost} onChange={(e) => setPrintingCost(Number(e.target.value))} />
              <Field id="material" label="Material cost (₹)" type="number" value={materialCost} onChange={(e) => setMaterialCost(Number(e.target.value))} />
              <Field id="shipping" label="Shipping (₹)" type="number" value={shipping} onChange={(e) => setShipping(Number(e.target.value))} />
            </div>
            <div className="mt-3 flex justify-between text-base font-bold">
              <span>Total</span><span>{formatINR(total)}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setPreview(true)}>Preview</Button>
              <Button disabled={!allChecked} onClick={() => setSent(true)}>Send quote</Button>
            </div>
            {sent && <p className="mt-2 text-sm text-success-text">Quote sent to customer.</p>}
          </div>

          {sent && (
            <div className="rounded-card bg-surface p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">Customer response (prototype)</h2>
              <p className="text-sm text-text-muted">Current state: <span className="font-semibold capitalize text-text">{customerState}</span></p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setCustomerState("accepted")}>Simulate: customer accepts</Button>
                <Button size="sm" variant="outline" onClick={() => setCustomerState("paid")}>Simulate: customer pays</Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)}>Simulate: customer rejects</Button>
              </div>
              {customerState === "paid" && (
                <Link href="/admin/production" className="mt-3 inline-block text-sm font-semibold text-accent-text">Open production queue</Link>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold">Dimensions</h2>
            <p className="text-sm text-text-muted">82 × 46 × 30 mm (estimated)</p>
          </div>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreview(false)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-sm rounded-panel bg-surface p-6 shadow-lg">
            <h3 className="text-lg font-bold">Quote preview</h3>
            <div className="mt-3 flex flex-col gap-1 text-sm">
              <div className="flex justify-between"><span className="text-text-muted">Printing</span><span>{formatINR(printingCost)}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Material</span><span>{formatINR(materialCost)}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Shipping</span><span>{formatINR(shipping)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 font-bold"><span>Total</span><span>{formatINR(total)}</span></div>
            </div>
            <Button className="mt-5 w-full" onClick={() => setPreview(false)}>Close</Button>
          </div>
        </div>
      )}

      {rejectOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRejectOpen(false)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-sm rounded-panel bg-surface p-6 shadow-lg">
            <h3 className="text-lg font-bold">Reject reason</h3>
            <Textarea id="reject-reason" label="Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="mt-3" />
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { setCustomerState("rejected"); setRejectOpen(false); }}>Confirm rejection</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
