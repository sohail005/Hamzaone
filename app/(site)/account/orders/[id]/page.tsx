import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/Button";
import { Timeline } from "@/components/Timeline";
import { orders } from "@/data/orders";

const STATUS_STEPS = ["printing", "post-processing", "quality-check", "packed", "shipped", "delivered"];

export async function generateStaticParams() {
  return orders.map((o) => ({ id: o.id }));
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { order } = await api.orders.get(id);
  if (!order) notFound();

  const current = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/account/orders" className="text-sm font-semibold text-accent-text">← All orders</Link>
      <h1 className="text-2xl font-bold">{order.id}</h1>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <Timeline steps={["Printing", "Post Processing", "Quality Check", "Packed", "Shipped", "Delivered"]} current={current} />
      </div>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Items</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((item: { name: string; color: string; size: string; qty: number; price: number }) => (
            <li key={item.name} className="flex justify-between">
              <span className="text-text-muted">{item.name} · {item.color} · {item.size} × {item.qty}</span>
              <span>{formatINR(item.price * item.qty)}</span>
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
        <p className="text-sm text-text-muted">{order.customer}, {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state} {order.address.pin}</p>
      </div>

      <div className="flex gap-3">
        <Link href={`/track-order?order=${order.id}`}><Button>Track this order</Button></Link>
        <Link href="/contact"><Button variant="outline">Need help?</Button></Link>
      </div>
    </div>
  );
}
