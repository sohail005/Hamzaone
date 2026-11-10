"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { cx } from "@/lib/format";

const HISTORY = [
  { date: "2026-11-04", variant: "Spiral Decor Vase — Charcoal / Large", change: "-2", reason: "Order HO-2026-10482" },
  { date: "2026-11-01", variant: "Hex Pen Cup — Sand / Standard", change: "-6", reason: "Sold out" },
  { date: "2026-10-28", variant: "Drawer Pull Set — Charcoal / Standard", change: "+10", reason: "Restock" },
];

type InventoryItem = { slug: string; variant: string; stock: number; reserved: number; low: boolean };

function InventoryContent() {
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab") ?? "stock";
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [adjusting, setAdjusting] = useState<number | null>(null);
  const [newStock, setNewStock] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin.list("inventory").then(({ inventory }: { inventory: InventoryItem[] }) => {
      setItems(inventory);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  const rows = tab === "low" ? items.filter((i) => i.low) : items;

  function openAdjust(idx: number) {
    setAdjusting(idx);
    setNewStock(items[idx].stock);
    setError(null);
  }

  function saveAdjust() {
    if (adjusting === null) return;
    const item = items[adjusting];
    if (newStock < item.reserved) {
      setError(`Stock cannot go below ${item.reserved} reserved units.`);
      return;
    }
    setItems((prev) => prev.map((it, i) => (i === adjusting ? { ...it, stock: newStock, low: newStock < 10 } : it)));
    setAdjusting(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Inventory</h1>
      <div className="flex gap-2">
        {[{ key: "stock", label: "All stock" }, { key: "low", label: "Low stock" }, { key: "history", label: "History" }].map((t) => (
          <button
            key={t.key}
            onClick={() => router.push(`/admin/inventory?tab=${t.key}`)}
            className={cx("rounded-full border px-4 py-1.5 text-sm font-medium", tab === t.key ? "border-accent bg-mto-chip-bg text-accent-text" : "border-border-input text-text-muted")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "history" ? (
        <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="border-b border-border text-left text-text-muted">
              <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Variant</th><th className="px-4 py-3">Change</th><th className="px-4 py-3">Reason</th></tr>
            </thead>
            <tbody>
              {HISTORY.map((h, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text-muted">{h.date}</td>
                  <td className="px-4 py-3">{h.variant}</td>
                  <td className="px-4 py-3">{h.change}</td>
                  <td className="px-4 py-3 text-text-muted">{h.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="border-b border-border text-left text-text-muted">
              <tr><th className="px-4 py-3">Variant</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Reserved</th><th className="px-4 py-3 text-right">Action</th></tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={`${item.slug}-${item.variant}`} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{item.variant}</td>
                  <td className={cx("px-4 py-3", item.low && "font-semibold text-warning-text")}>{item.stock}</td>
                  <td className="px-4 py-3 text-text-muted">{item.reserved}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openAdjust(items.indexOf(item))} className="text-xs font-semibold text-accent-text">Adjust stock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adjusting !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAdjusting(null)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-sm rounded-panel bg-surface p-6 shadow-lg">
            <h3 className="text-lg font-bold">Adjust stock</h3>
            <p className="mt-1 text-sm text-text-muted">{items[adjusting].variant}</p>
            <input
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              className="mt-3 h-12 w-full rounded-input border border-border-input px-4 text-sm"
            />
            {error && <p className="mt-2 text-sm text-error-text">{error}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAdjusting(null)}>Cancel</Button>
              <Button onClick={saveAdjust}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminInventoryPage() {
  return (
    <Suspense>
      <InventoryContent />
    </Suspense>
  );
}
