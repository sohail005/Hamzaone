import Link from "next/link";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/Button";
import { Timeline } from "@/components/Timeline";
import { getCurrentUser } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { readStoredOrder, type StoredOrder } from "@/lib/server/orders-store";

export const dynamic = "force-dynamic";

const STATUS_STEPS: StoredOrder["status"][] = [
  "awaiting_payment",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const env = await getWorkerEnv();
  const ordersKv = getKV(env, "ORDERS_KV");
  const order: StoredOrder | null = ordersKv ? await readStoredOrder(ordersKv, id) : null;
  if (!order) notFound();

  const owns = order.customer.email.toLowerCase() === user.email.toLowerCase();
  if (!owns && user.role !== "admin") notFound();

  const current = order.status === "canceled" ? -1 : STATUS_STEPS.indexOf(order.status);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/account/orders" className="text-sm font-semibold text-accent-text">← All orders</Link>
      <h1 className="text-2xl font-bold">{order.id}</h1>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <Timeline steps={["Awaiting Payment", "Confirmed", "Processing", "Shipped", "Delivered"]} current={current} />
      </div>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Items</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((item) => (
            <li key={`${item.productSlug}-${item.color}-${item.size}`} className="flex justify-between">
              <span className="text-text-muted">{item.name} · {item.color} · {item.size} × {item.qty}</span>
              <span>{formatINR(item.unitPrice * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-success-text"><span>Discount ({order.couponCode})</span><span>−{formatINR(order.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-text-muted">Shipping</span><span>{formatINR(order.shipping)}</span></div>
          <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatINR(order.total)}</span></div>
        </div>
      </div>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold">Shipping address</h2>
        <p className="text-sm text-text-muted">{order.address.name}, {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state} {order.address.pin}</p>
      </div>

      <div className="flex gap-3">
        <Link href={`/track-order?order=${order.id}`}><Button>Track this order</Button></Link>
        <Link href="/contact"><Button variant="outline">Need help?</Button></Link>
      </div>
    </div>
  );
}
