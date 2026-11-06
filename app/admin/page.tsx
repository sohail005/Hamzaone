import Link from "next/link";
import { orders } from "@/data/orders";
import { products } from "@/data/products";
import { customRequests, productionCards, inventory } from "@/data/admin";
import { formatINR } from "@/lib/format";

const SALES = [40, 55, 38, 62, 70, 58, 80, 66, 90, 72, 85, 95, 60, 77];

const TILES = [
  { label: "Revenue (30d)", value: formatINR(184320), href: "/admin/analytics" },
  { label: "Orders (30d)", value: "142", href: "/admin/orders" },
  { label: "Pending orders", value: "6", href: "/admin/orders?status=pending" },
  { label: "Active prints", value: String(productionCards.filter((p) => p.stage !== "completed").length), href: "/admin/production" },
  { label: "Products", value: String(products.length), href: "/admin/products" },
  { label: "Low stock", value: String(inventory.filter((i) => i.low).length), href: "/admin/inventory?tab=low" },
  { label: "Custom requests", value: String(customRequests.length), href: "/admin/custom-requests" },
  { label: "Avg. order value", value: formatINR(1298), href: "/admin/analytics" },
];

export default function AdminOverviewPage() {
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
        <div className="flex h-32 items-end gap-2">
          {SALES.map((v, i) => (
            <div key={i} className="flex-1 rounded-t bg-accent" style={{ height: `${v}%` }} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-card bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-accent-text">View all orders</Link>
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {orders.map((o) => (
              <li key={o.id} className="flex justify-between text-sm">
                <Link href={`/admin/orders/${o.id}`} className="text-accent-text">{o.id}</Link>
                <span className="text-text-muted">{formatINR(o.total)} · {o.status}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Printer workload</h2>
            <Link href="/admin/production" className="text-xs font-semibold text-accent-text">Queue</Link>
          </div>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {productionCards.slice(0, 4).map((p) => (
              <li key={p.id} className="flex justify-between">
                <span className="text-text-muted">{p.label}</span>
                <span className="font-medium capitalize">{p.stage.replace("-", " ")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-card bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Inventory alerts</h2>
            <Link href="/admin/inventory" className="text-xs font-semibold text-accent-text">Inventory</Link>
          </div>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {inventory.filter((i) => i.low).map((i) => (
              <li key={`${i.slug}-${i.variant}`} className="flex justify-between">
                <span className="text-text-muted">{i.variant}</span>
                <span className="font-medium text-warning-text">{i.stock} left</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Custom requests</h2>
            <Link href="/admin/custom-requests" className="text-xs font-semibold text-accent-text">Review custom requests</Link>
          </div>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {customRequests.map((r) => (
              <li key={r.id} className="flex justify-between">
                <span className="text-text-muted">{r.id}</span>
                <span className="font-medium capitalize">{r.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
