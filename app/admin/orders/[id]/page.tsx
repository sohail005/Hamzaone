import Link from "next/link";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";
import { OrderStatusEditor } from "@/components/admin/OrderStatusEditor";
import { RecheckPaymentButton } from "@/components/admin/RecheckPaymentButton";
import { readStoredOrder } from "@/lib/server/orders-store";
import { getKV, getWorkerEnv } from "@/lib/server/kv";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const env = await getWorkerEnv();
  const ordersKv = getKV(env, "ORDERS_KV");
  const order = ordersKv ? await readStoredOrder(ordersKv, id) : null;
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/orders" className="text-sm font-semibold text-accent-text">← Orders</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{order.id}</h1>
        <div className="flex gap-2">
          <StatusChip tone={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "pending" ? "warning" : "error"}>
            Payment: {order.paymentStatus}
          </StatusChip>
          <StatusChip tone="accent">{order.status.replace(/_/g, " ")}</StatusChip>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Items</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {order.items.map((item) => (
                <li key={`${item.productSlug}-${item.color}-${item.size}`} className="flex justify-between">
                  <span className="text-text-muted">
                    {item.name} · {item.color} · {item.size} × {item.qty}
                    {item.engraving && <> · Engraving: &quot;{item.engraving}&quot;</>}
                  </span>
                  <span>{formatINR(item.unitPrice * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between"><span className="text-text-muted">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span><span>-{formatINR(order.discount)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-text-muted">Shipping</span><span>{formatINR(order.shipping)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>{formatINR(order.total)}</span></div>
            </div>
          </div>

          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Customer &amp; shipping address</h2>
            <p className="text-sm">{order.customer.name}</p>
            <p className="text-sm text-text-muted">{order.customer.email} · {order.customer.phone}</p>
            <p className="mt-3 text-sm">
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}
              {order.address.landmark ? `, ${order.address.landmark}` : ""}
            </p>
            <p className="text-sm text-text-muted">{order.address.city}, {order.address.state} - {order.address.pin}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {order.paymentStatus !== "paid" && <RecheckPaymentButton orderId={order.id} />}
          <OrderStatusEditor
            orderId={order.id}
            initialStatus={order.status}
            initialTrackingNumber={order.trackingNumber}
            initialCarrier={order.carrier}
          />
        </div>
      </div>
    </div>
  );
}
