import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { computeOrderStats, type OrderStatsInput } from "@/lib/server/order-stats";

type OrderRow = OrderStatsInput & { id: string };

export default async function AdminAnalyticsPage() {
  const { orders } = (await api.orders.list()) as { orders: OrderRow[] };
  const stats = computeOrderStats(orders);

  const TILES = [
    { label: "Revenue (30d)", value: formatINR(stats.revenue30d) },
    { label: "Orders (30d)", value: String(stats.orders30d) },
    { label: "Avg. order value", value: formatINR(stats.avgOrderValue) },
    { label: "Pending orders", value: String(stats.pendingOrders) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {TILES.map((t) => (
          <div key={t.label} className="rounded-card bg-surface p-4 shadow-sm">
            <p className="text-xs text-text-muted">{t.label}</p>
            <p className="mt-1 text-xl font-bold">{t.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Sales — last 14 days</h2>
        {stats.revenue30d > 0 ? (
          <div className="flex h-40 items-end gap-2">
            {stats.salesBarHeights.map((v, i) => (
              <div key={i} className="flex-1 rounded-t bg-accent" style={{ height: `${Math.max(v, 2)}%` }} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No paid orders yet — sales will appear here once orders come in.</p>
        )}
      </div>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Top products</h2>
        {stats.topProducts.length > 0 ? (
          <ul className="flex flex-col gap-2 text-sm">
            {stats.topProducts.map((p) => (
              <li key={p.name} className="flex justify-between">
                <span className="text-text-muted">{p.name}</span>
                <span className="font-medium">{formatINR(p.revenue)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">No paid orders yet.</p>
        )}
      </div>
    </div>
  );
}
