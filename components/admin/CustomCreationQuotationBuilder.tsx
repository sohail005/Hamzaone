"use client";

import { useMemo, useState } from "react";
import { formatINR } from "@/lib/format";
import { Field, Textarea } from "@/components/Input";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";

type Quotation = {
  id: string;
  version: number;
  finalAmount: number;
  status: "draft" | "sent" | "accepted" | "declined";
  validUntil: string;
};

export function CustomCreationQuotationBuilder({
  requestId,
  quotations,
  onSaved,
}: {
  requestId: string;
  quotations: Quotation[];
  onSaved: () => void;
}) {
  const [designCost, setDesignCost] = useState("0");
  const [printingCost, setPrintingCost] = useState("0");
  const [finishingCost, setFinishingCost] = useState("0");
  const [additionalCharges, setAdditionalCharges] = useState("0");
  const [deliveryCharges, setDeliveryCharges] = useState("79");
  const [discount, setDiscount] = useState("0");
  const [productionDays, setProductionDays] = useState("5");
  const [validUntil, setValidUntil] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(() => {
    return (
      Number(designCost || 0) +
      Number(printingCost || 0) +
      Number(finishingCost || 0) +
      Number(additionalCharges || 0) +
      Number(deliveryCharges || 0) -
      Number(discount || 0)
    );
  }, [designCost, printingCost, finishingCost, additionalCharges, deliveryCharges, discount]);

  async function saveDraft() {
    if (!validUntil) {
      setError("Please set a quotation expiry date.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.customCreations.adminCreateQuotation(requestId, {
        designCost: Number(designCost),
        printingCost: Number(printingCost),
        finishingCost: Number(finishingCost),
        additionalCharges: Number(additionalCharges),
        deliveryCharges: Number(deliveryCharges),
        discount: Number(discount),
        productionDays: Number(productionDays),
        validUntil,
        customerMessage: customerMessage || undefined,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the quotation.");
    } finally {
      setSaving(false);
    }
  }

  async function send(quotationId: string) {
    setSaving(true);
    setError(null);
    try {
      await api.customCreations.adminSendQuotation(requestId, quotationId);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the quotation.");
    } finally {
      setSaving(false);
    }
  }

  const latestDraft = quotations.find((q) => q.status === "draft");

  return (
    <div className="flex flex-col gap-4">
      {quotations.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Quotation history</h3>
          {quotations.map((q) => (
            <div key={q.id} className="flex items-center justify-between rounded-input border border-border p-3 text-sm">
              <span>v{q.version} · {formatINR(q.finalAmount)} · valid until {new Date(q.validUntil).toLocaleDateString()}</span>
              <span className="flex items-center gap-2">
                <span className="capitalize text-text-muted">{q.status}</span>
                {q.status === "draft" && (
                  <Button size="sm" onClick={() => send(q.id)} disabled={saving}>Send Quotation</Button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {!latestDraft && (
        <div className="flex flex-col gap-3 rounded-input border border-dashed border-border-input p-4">
          <h3 className="text-sm font-semibold">New quotation</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field id="designCost" label="Design / Modelling Cost (₹)" type="number" value={designCost} onChange={(e) => setDesignCost(e.target.value)} />
            <Field id="printingCost" label="Printing Cost (₹)" type="number" value={printingCost} onChange={(e) => setPrintingCost(e.target.value)} />
            <Field id="finishingCost" label="Finishing Cost (₹)" type="number" value={finishingCost} onChange={(e) => setFinishingCost(e.target.value)} />
            <Field id="additionalCharges" label="Additional Charges (₹)" type="number" value={additionalCharges} onChange={(e) => setAdditionalCharges(e.target.value)} />
            <Field id="deliveryCharges" label="Delivery Charges (₹)" type="number" value={deliveryCharges} onChange={(e) => setDeliveryCharges(e.target.value)} />
            <Field id="discount" label="Discount (₹)" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            <Field id="productionDays" label="Estimated Production Days" type="number" value={productionDays} onChange={(e) => setProductionDays(e.target.value)} />
            <Field id="validUntil" label="Quotation Expiry" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          <Textarea id="customerMessage" label="Customer-Facing Message (optional)" value={customerMessage} onChange={(e) => setCustomerMessage(e.target.value)} />
          <p className="text-sm font-bold">Final amount: {formatINR(total)}</p>
          {error && <p className="text-sm text-error-text">{error}</p>}
          <Button onClick={saveDraft} loading={saving}>Save Draft</Button>
        </div>
      )}
    </div>
  );
}
