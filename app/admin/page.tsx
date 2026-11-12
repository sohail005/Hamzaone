import Link from "next/link";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { computeOrderStats, type OrderStatsInput } from "@/lib/server/order-stats";

type OrderRow = OrderStatsInput & { id: string };

export default async function AdminOverviewPage() {
  const { orders } = (await api.orders.list()) as { orders: OrderRow[] };
  const { products } = await api.products.list();
  const { production: productionCards } = await api.admin.list("production");
  const { inventory } = await api.admin.list("inventory");
  const { "custom-requests": customRequests } = await api.admin.list("custom-requests");

  const stats = computeOrderStats(orders);

  const TILES = [
    { label: "Revenue (30d)", value: formatINR(stats.revenue30d), href: "/admin/analytics" },
    { label: "Orders (30d)", value: String(stats.orders30d), href: "/admin/orders" },
    { label: "Pending orders", value: String(stats.pendingOrders), href: "/admin/orders?status=pending" },
    { label: "Active prints", value: String((productionCards as Array<{ stage: string }>).filter((p) => p.stage !== "completed").length), href: "/admin/production" },
    { label: "Products", value: String(products.length), href: "/admin/products" },
    { label: "Low stock", value: String((inventory as Array<{ low: boolean }>).filter((i) => i.low).length), href: "/admin/inventory?tab=low" },
    { label: "Custom requests", value: String(customRequests.length), href: "/admin/custom-requests" },
    { label: "Avg. order value", value: formatINR(stats.avgOrderValue), href: "/admin/analytics" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
        <Link href="/admin/products/new" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-text hover:bg-accent-hover">
          Add product
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {TILES.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-card bg-surface p-4 shadow-sm hover:shadow-md">
            <p className="text-xs text-text-muted">{t.label}</p>
            <p className="mt-1 text-xl font-bold">{t.value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Sales — last 14 days</h2>
        {stats.revenue30d > 0 ? (
          <div className="flex h-32 items-end gap-2">
            {stats.salesBarHeights.map((v, i) => (
              <div key={i} className="flex-1 rounded-t bg-accent" style={{ height: `${Math.max(v, 2)}%` }} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No paid orders yet — sales will appear here once orders come in.</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-card bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-accent-text">View all orders</Link>
          </div>
          {orders.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2">
              {orders.slice(0, 4).map((o) => (
                <li key={o.id} className="flex justify-between text-sm">
                  <Link href={`/admin/orders/${o.id}`} className="text-accent-text">{o.id}</Link>
                  <span className="text-text-muted">{formatINR(o.total)} · {o.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-text-muted">No orders yet.</p>
          )}
        </div>

        <div className="rounded-card bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Printer workload</h2>
            <Link href="/admin/production" className="text-xs font-semibold text-accent-text">Queue</Link>
          </div>
          {(productionCards as Array<{ id: string; label: string; stage: string }>).length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {(productionCards as Array<{ id: string; label: string; stage: string }>).slice(0, 4).map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span className="text-text-muted">{p.label}</span>
                  <span className="font-medium capitalize">{p.stage.replace("-", " ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-text-muted">Nothing in production.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-card bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Inventory alerts</h2>
            <Link href="/admin/inventory" className="text-xs font-semibold text-accent-text">Inventory</Link>
          </div>
          {(inventory as Array<{ slug: string; variant: string; stock: number; low: boolean }>).filter((i) => i.low).length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {(inventory as Array<{ slug: string; variant: string; stock: number; low: boolean }>).filter((i) => i.low).map((i) => (
                <li key={`${i.slug}-${i.variant}`} className="flex justify-between">
                  <span className="text-text-muted">{i.variant}</span>
                  <span className="font-medium text-warning-text">{i.stock} left</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-text-muted">No low-stock items.</p>
          )}
        </div>

        <div className="rounded-card bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Custom requests</h2>
            <Link href="/admin/custom-requests" className="text-xs font-semibold text-accent-text">Review custom requests</Link>
          </div>
          {customRequests.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {customRequests.map((r: { id: string; status: string }) => (
                <li key={r.id} className="flex justify-between">
                  <span className="text-text-muted">{r.id}</span>
                  <span className="font-medium capitalize">{r.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-text-muted">No custom requests yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
