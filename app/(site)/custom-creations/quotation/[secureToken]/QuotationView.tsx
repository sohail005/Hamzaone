"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";

type Quotation = {
  designCost: number;
  printingCost: number;
  finishingCost: number;
  additionalCharges: number;
  deliveryCharges: number;
  discount: number;
  finalAmount: number;
  productionDays: number;
  validUntil: string;
  customerMessage: string | null;
  status: string;
};

type QuotationData = { requestNumber: string; projectName: string; status: string; quotation: Quotation; imageCount: number };

type RazorpayWindow = Window & {
  Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
};

function loadRazorpayCheckout(): Promise<void> {
  const win = window as RazorpayWindow;
  if (win.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => (win.Razorpay ? resolve() : reject(new Error("Razorpay checkout did not load.")));
    script.onerror = () => reject(new Error("Could not load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

export function QuotationView({ secureToken }: { secureToken: string }) {
  const [data, setData] = useState<QuotationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    api.customCreations.quotation
      .get(secureToken)
      .then((d: QuotationData) => setData(d))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Quotation not found."));
  }, [secureToken]);

  async function accept() {
    setActing(true);
    try {
      await api.customCreations.quotation.accept(secureToken);
      setData((d) => (d ? { ...d, quotation: { ...d.quotation, status: "accepted" } } : d));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not accept the quotation.");
    } finally {
      setActing(false);
    }
  }

  async function decline() {
    setActing(true);
    try {
      await api.customCreations.quotation.decline(secureToken);
      setData((d) => (d ? { ...d, quotation: { ...d.quotation, status: "declined" } } : d));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not decline the quotation.");
    } finally {
      setActing(false);
    }
  }

  async function pay() {
    setActing(true);
    setError(null);
    try {
      const order = (await api.customCreations.quotation.pay(secureToken)) as { keyId: string; orderId: string; amount: number; currency: string };
      await loadRazorpayCheckout();
      const win = window as RazorpayWindow;
      if (!win.Razorpay) throw new Error("Razorpay checkout is unavailable.");
      const checkout = new win.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "HamzaOne",
        description: `Custom Creation — ${data?.requestNumber}`,
        order_id: order.orderId,
        theme: { color: "#F97316" },
        handler: () => setPaid(true),
      });
      checkout.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start payment.");
    } finally {
      setActing(false);
    }
  }

  if (error) return <div className="mx-auto max-w-[640px] px-4 py-16 text-center sm:px-6"><p className="text-error-text">{error}</p></div>;
  if (!data) return <div className="mx-auto max-w-[640px] px-4 py-16 text-center sm:px-6"><p className="text-text-muted">Loading…</p></div>;

  const q = data.quotation;

  return (
    <div className="mx-auto max-w-[640px] px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold">Quotation for {data.projectName}</h1>
      <p className="text-sm text-text-muted">Request {data.requestNumber} · {data.imageCount} reference image(s)</p>

      <div className="mt-6 flex flex-col gap-2 rounded-card bg-surface p-6 shadow-sm">
        <Row label="Design / modelling" value={q.designCost} />
        <Row label="Printing" value={q.printingCost} />
        <Row label="Finishing" value={q.finishingCost} />
        {q.additionalCharges > 0 && <Row label="Additional charges" value={q.additionalCharges} />}
        <Row label="Delivery" value={q.deliveryCharges} />
        {q.discount > 0 && <Row label="Discount" value={-q.discount} />}
        <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span>{formatINR(q.finalAmount)}</span></div>
        <p className="mt-2 text-sm text-text-muted">Estimated production: {q.productionDays} day(s) · Valid until {new Date(q.validUntil).toLocaleDateString()}</p>
        {q.customerMessage && <p className="mt-2 rounded-input bg-bg p-3 text-sm">{q.customerMessage}</p>}
      </div>

      {paid ? (
        <p className="mt-6 rounded-input bg-success/10 p-4 text-sm text-success-text">
          Payment received — we&apos;ll confirm shortly and begin production.
        </p>
      ) : q.status === "accepted" ? (
        <Button className="mt-6 w-full" size="lg" onClick={pay} loading={acting}>Pay {formatINR(q.finalAmount)}</Button>
      ) : q.status === "sent" ? (
        <div className="mt-6 flex gap-3">
          <Button onClick={accept} loading={acting}>Accept Quotation</Button>
          <Button variant="outline" onClick={decline} disabled={acting}>Decline Quotation</Button>
        </div>
      ) : (
        <p className="mt-6 text-sm text-text-muted">This quotation has already been {q.status}.</p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      <span>{formatINR(value)}</span>
    </div>
  );
}
