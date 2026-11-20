import Link from "next/link";
import { formatINR } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";
import { assetUrl } from "@/lib/assets";
import { ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import { getCurrentUser } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { listStoredOrders } from "@/lib/server/orders-store";
import { getProductBySlug } from "@/lib/server/products-store";

type OrderRow = { id: string; placedAt: string; items: Array<{ name: string }>; imageKey?: string; total: number; status: string; paymentStatus: string };

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  const env = await getWorkerEnv();
  const ordersKv = getKV(env, "ORDERS_KV");
  const dataKv = getKV(env, "DATA_KV");

  let orders: OrderRow[] = [];
  if (user && ordersKv) {
    const allOrders = await listStoredOrders(ordersKv);
    const own = user.role === "admin" ? allOrders : allOrders.filter((o) => o.customer.email.toLowerCase() === user.email.toLowerCase());

    const firstItemSlugs = Array.from(new Set(own.map((o) => o.items[0]?.productSlug).filter((s): s is string => !!s)));
    const imagesBySlug = new Map<string, string | undefined>();
    if (dataKv) {
      await Promise.all(
        firstItemSlugs.map(async (slug) => {
          const product = await getProductBySlug(dataKv, slug);
          imagesBySlug.set(slug, product?.imageKeys?.[0]);
        }),
      );
    }

    orders = own.map((o) => ({
      id: o.id,
      placedAt: o.createdAt,
      items: o.items.map((item) => ({ name: item.name })),
      imageKey: o.items[0] ? imagesBySlug.get(o.items[0].productSlug) : undefined,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
    }));
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">My orders</h1>
      <ul className="flex flex-col gap-3">
        {orders.map((o) => (
          <li key={o.id}>
            <Link href={`/account/orders/${o.id}`} className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-sm hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {o.imageKey ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={assetUrl(o.imageKey)} alt="" className="h-12 w-12 shrink-0 rounded-chip object-cover" />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-chip bg-art-tile" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{o.id}</p>
                  <p className="text-xs text-text-muted">{o.placedAt} · {o.items.length} item(s)</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
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
