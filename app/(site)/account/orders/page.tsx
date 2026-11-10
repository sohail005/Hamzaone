import Link from "next/link";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";

export default async function AccountOrdersPage() {
  const { orders } = await api.orders.list();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">My orders</h1>
      <ul className="flex flex-col gap-3">
        {orders.map((o: { id: string; placedAt: string; items: Array<{ name: string }>; total: number; status: string; paymentStatus: string }) => (
          <li key={o.id}>
            <Link href={`/account/orders/${o.id}`} className="flex items-center justify-between rounded-card bg-surface p-4 shadow-sm hover:shadow-md">
              <div>
                <p className="text-sm font-semibold">{o.id}</p>
                <p className="text-xs text-text-muted">{o.placedAt} · {o.items.length} item(s)</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{formatINR(o.total)}</span>
                <StatusChip tone={o.status === "delivered" ? "success" : o.paymentStatus === "pending" ? "warning" : "accent"}>
                  {o.status}
                </StatusChip>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
