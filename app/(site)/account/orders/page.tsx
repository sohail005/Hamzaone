import Link from "next/link";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";
import { assetUrl } from "@/lib/assets";
import { ORDER_STATUS_LABELS } from "@/lib/orderStatus";

export default async function AccountOrdersPage() {
  const { orders } = await api.orders.list();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">My orders</h1>
      <ul className="flex flex-col gap-3">
        {orders.map((o: { id: string; placedAt: string; items: Array<{ name: string }>; imageKey?: string; total: number; status: string; paymentStatus: string }) => (
          <li key={o.id}>
            <Link href={`/account/orders/${o.id}`} className="flex items-center justify-between rounded-card bg-surface p-4 shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3">
                {o.imageKey ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={assetUrl(o.imageKey)} alt="" className="h-12 w-12 shrink-0 rounded-chip object-cover" />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-chip bg-art-tile" />
                )}
                <div>
                  <p className="text-sm font-semibold">{o.id}</p>
                  <p className="text-xs text-text-muted">{o.placedAt} · {o.items.length} item(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{formatINR(o.total)}</span>
                <StatusChip tone={o.status === "delivered" ? "success" : o.paymentStatus === "pending" ? "warning" : "accent"}>
                  {ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] ?? o.status}
                </StatusChip>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
