import Link from "next/link";
import { formatINR } from "@/lib/format";
import { computeOrderStats, type OrderStatsInput } from "@/lib/server/order-stats";
import { getD1 } from "@/lib/server/d1";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { listInventory, listProduction } from "@/lib/server/admin-store";
import { listRequests } from "@/lib/server/custom-creations-store";
import { listStoredOrders, type StoredOrder } from "@/lib/server/orders-store";
import { listProducts } from "@/lib/server/products-store";

type OrderRow = OrderStatsInput & { id: string };

// This page is rendered on the server, which runs inside the same Worker
// that serves our own API — fetching our own /api/* routes over HTTP here
// would round-trip through Cloudflare's edge and occasionally 522 (see the
// comment in lib/api.ts). Reading the KV/D1 stores directly avoids that hop.
export default async function AdminOverviewPage() {
  const env = await getWorkerEnv();
  const ordersKv = getKV(env, "ORDERS_KV");
  const dataKv = getKV(env, "DATA_KV");
  const db = getD1(env);

  const [orders, products, productionCards, inventory, customCreationsResult] = await Promise.all([
    ordersKv ? listStoredOrders(ordersKv) : Promise.resolve([] as StoredOrder[]),
    dataKv ? listProducts(dataKv, { includeUnpublished: true }) : Promise.resolve([]),
    dataKv ? listProduction(dataKv) : Promise.resolve([]),
    dataKv ? listInventory(dataKv) : Promise.resolve([]),
    db ? listRequests(db, { page: 1 }) : Promise.resolve({ requests: [], total: 0 }),
  ]);
  const customCreations = customCreationsResult.requests as unknown as Array<{ id: string; status: string }>;

  const stats = computeOrderStats(orders as OrderRow[]);

  const TILES = [
    { label: "Revenue (30d)", value: formatINR(stats.revenue30d), href: "/admin/analytics" },
    { label: "Orders (30d)", value: String(stats.orders30d), href: "/admin/orders" },
    { label: "Pending orders", value: String(stats.pendingOrders), href: "/admin/orders?status=pending" },
    { label: "Active prints", value: String((productionCards as Array<{ stage: string }>).filter((p) => p.stage !== "completed").length), href: "/admin/production" },
    { label: "Products", value: String(products.length), href: "/admin/products" },
    { label: "Low stock", value: String((inventory as Array<{ low: boolean }>).filter((i) => i.low).length), href: "/admin/inventory?tab=low" },
    { label: "Custom Creations", value: String(customCreations.length), href: "/admin/custom-creations" },
    { label: "Avg. order value", value: formatINR(stats.avgOrderValue), href: "/admin/analytics" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
        <Link href="/admin/products/new" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover">
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
            <h2 className="text-sm font-semibold">Custom Creations</h2>
            <Link href="/admin/custom-creations" className="text-xs font-semibold text-accent-text">Review requests</Link>
          </div>
          {customCreations.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {customCreations.map((r: { id: string; status: string }) => (
                <li key={r.id} className="flex justify-between">
                  <span className="text-text-muted">{r.id}</span>
                  <span className="font-medium capitalize">{r.status.replace(/_/g, " ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-text-muted">No custom creation requests yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
