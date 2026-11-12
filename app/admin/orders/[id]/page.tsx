import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import type { StoredOrder } from "@/lib/server/orders-store";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { order } = (await api.orders.get(id)) as { order: StoredOrder };
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
          {order.items.map((item) => (
            <li key={`${item.productSlug}-${item.color}-${item.size}`} className="flex justify-between">
              <span className="text-text-muted">{item.name} · {item.color} · {item.size} × {item.qty}</span>
              <span>{formatINR(item.unitPrice * item.qty)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
