import { formatINR } from "@/lib/format";

const SALES = [40, 55, 38, 62, 70, 58, 80, 66, 90, 72, 85, 95, 60, 77];
const TOP_PRODUCTS = [
  { name: "Spiral Decor Vase", revenue: 20970 },
  { name: "Headphone Stand", revenue: 15980 },
  { name: "Custom Name Plate", revenue: 11970 },
  { name: "Minimal Phone Stand", revenue: 9960 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Revenue (30d)", value: formatINR(184320) },
          { label: "Orders (30d)", value: "142" },
          { label: "Avg. order value", value: formatINR(1298) },
          { label: "Conversion rate", value: "2.8%" },
        ].map((t) => (
          <div key={t.label} className="rounded-card bg-surface p-4 shadow-sm">
            <p className="text-xs text-text-muted">{t.label}</p>
            <p className="mt-1 text-xl font-bold">{t.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Sales — last 14 days</h2>
        <div className="flex h-40 items-end gap-2">
          {SALES.map((v, i) => (
            <div key={i} className="flex-1 rounded-t bg-accent" style={{ height: `${v}%` }} />
          ))}
        </div>
      </div>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Top products</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {TOP_PRODUCTS.map((p) => (
            <li key={p.name} className="flex justify-between">
              <span className="text-text-muted">{p.name}</span>
              <span className="font-medium">{formatINR(p.revenue)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
