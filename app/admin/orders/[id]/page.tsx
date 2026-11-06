"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { findOrder } from "@/data/orders";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/Button";
import { Field } from "@/components/Input";
import { Timeline } from "@/components/Timeline";
import { customers } from "@/data/admin";

const STEPS = ["Printing", "Post Processing", "Quality Check", "Packed", "Shipped", "Delivered"];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const order = findOrder(params.id);

  const [stepIndex, setStepIndex] = useState(0);
  const [statusDialog, setStatusDialog] = useState(false);
  const [refundDialog, setRefundDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [awb, setAwb] = useState("");
  const [shipped, setShipped] = useState(false);
  const [log, setLog] = useState<string[]>(["Order placed and payment captured."]);

  if (!order) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">Order not found.</p>
        <Link href="/admin/orders" className="text-sm font-semibold text-accent-text">← Back to orders</Link>
      </div>
    );
  }

  const customer = customers.find((c) => c.name === order.customer);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/orders" className="text-sm font-semibold text-accent-text">Orders</Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{order.id}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStatusDialog(true)}>Update status</Button>
          <Button variant="outline" onClick={() => setRefundDialog(true)}>Review refund</Button>
          <Button variant="destructive" onClick={() => setCancelDialog(true)}>Cancel order</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Fulfilment</h2>
            <Timeline steps={STEPS} current={stepIndex} />
          </div>

          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Items</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {order.items.map((item) => (
                <li key={item.name} className="flex justify-between">
                  <span className="text-text-muted">{item.name} · {item.color} · {item.size} × {item.qty}</span>
                  <span>{formatINR(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold">
              <span>Total</span><span>{formatINR(order.total)}</span>
            </div>
          </div>

          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Shipping</h2>
            {shipped ? (
              <p className="text-sm text-success-text">Marked as shipped — AWB {awb}</p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (awb) { setShipped(true); setStepIndex(4); setLog((l) => [...l, `Shipped with AWB ${awb}.`]); }
                }}
                className="flex gap-2"
              >
                <Field id="awb" value={awb} onChange={(e) => setAwb(e.target.value)} placeholder="AWB number" className="flex-1" />
                <Button type="submit">Mark shipped</Button>
              </form>
            )}
          </div>

          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Activity log</h2>
            <ul className="flex flex-col gap-2 text-sm text-text-muted">
              {log.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold">Customer</h2>
            {customer ? (
              <Link href={`/admin/customers/${customer.id}`} className="text-sm font-semibold text-accent-text">{customer.name}</Link>
            ) : (
              <p className="text-sm">{order.customer}</p>
            )}
            <p className="text-sm text-text-muted">{order.address.line1}, {order.address.city}, {order.address.state} {order.address.pin}</p>
          </div>
        </div>
      </div>

      {statusDialog && (
        <Dialog title="Update fulfilment status" onClose={() => setStatusDialog(false)}>
          <div className="flex flex-col gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => { setStepIndex(i); setLog((l) => [...l, `Status updated to ${s}.`]); setStatusDialog(false); }}
                className="rounded-chip border border-border px-3 py-2.5 text-left text-sm hover:bg-bg"
              >
                {s}
              </button>
            ))}
          </div>
        </Dialog>
      )}

      {refundDialog && (
        <Dialog title="Review refund" onClose={() => setRefundDialog(false)}>
          <p className="text-sm text-text-muted">Refund {formatINR(order.total)} to the original payment method?</p>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setRefundDialog(false)}>Dismiss</Button>
            <Button onClick={() => { setLog((l) => [...l, "Refund approved."]); setRefundDialog(false); }}>Approve refund</Button>
          </div>
        </Dialog>
      )}

      {cancelDialog && (
        <Dialog title="Cancel this order?" onClose={() => setCancelDialog(false)}>
          <p className="text-sm text-text-muted">This cannot be undone. The customer will be notified.</p>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCancelDialog(false)}>Keep order</Button>
            <Button
              variant="destructive"
              onClick={() => {
                setLog((l) => [...l, "Order canceled."]);
                setCancelDialog(false);
                router.push("/admin/orders");
              }}
            >
              Cancel order
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-sm rounded-panel bg-surface p-6 shadow-lg">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
