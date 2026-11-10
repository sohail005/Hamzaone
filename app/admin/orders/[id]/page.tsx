import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { orders } from "@/data/orders";

const STEPS = ["Printing", "Post Processing", "Quality Check", "Packed", "Shipped", "Delivered"];

export async function generateStaticParams() {
  return orders.map((o) => ({ id: o.id }));
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { order } = await api.orders.get(id);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/orders" className="text-sm font-semibold text-accent-text">Orders</Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{order.id}</h1>
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
      </div>
    </div>
  );
}
