"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cx } from "@/lib/format";

type ProductionCard = { id: string; label: string; stage: string; priority: string };

const STAGES: { key: string; label: string }[] = [
  { key: "queued", label: "Queued" },
  { key: "printing", label: "Printing" },
  { key: "post-processing", label: "Post Processing" },
  { key: "quality-check", label: "Quality Check" },
  { key: "packed", label: "Packed" },
  { key: "completed", label: "Completed" },
];

export default function AdminProductionPage() {
  const [cards, setCards] = useState<ProductionCard[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high">("all");

  useEffect(() => {
    api.admin.list("production").then(({ production }: { production: ProductionCard[] }) => {
      setCards(production);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  function move(id: string, dir: 1 | -1) {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = STAGES.findIndex((s) => s.key === c.stage);
        const nextIdx = Math.min(STAGES.length - 1, Math.max(0, idx + dir));
        return { ...c, stage: STAGES[nextIdx].key };
      })
    );
  }

  const visible = priorityFilter === "all" ? cards : cards.filter((c) => c.priority === "high");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Production queue</h1>
        <div className="flex gap-2">
          {(["all", "high"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setPriorityFilter(f)}
              className={cx("rounded-full border px-4 py-1.5 text-sm font-medium capitalize", priorityFilter === f ? "border-accent bg-mto-chip-bg text-accent-text" : "border-border-input text-text-muted")}
            >
              {f === "all" ? "All priorities" : "High priority"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {STAGES.map((stage, stageIdx) => (
          <div key={stage.key} className="flex flex-col gap-3 rounded-card bg-surface p-3 shadow-sm">
            <h3 className="text-xs font-semibold uppercase text-text-muted">{stage.label}</h3>
            {visible.filter((c) => c.stage === stage.key).map((c) => (
              <div key={c.id} className="rounded-chip border border-border p-3">
                <p className="text-sm font-medium">{c.label}</p>
                {c.priority === "high" && <span className="mt-1 inline-block rounded-chip bg-mto-chip-bg px-2 py-0.5 text-[11px] font-medium text-accent-text">High priority</span>}
                <div className="mt-2 flex justify-between text-xs">
                  <button disabled={stageIdx === 0} onClick={() => move(c.id, -1)} className="font-semibold text-text-muted disabled:opacity-30">← Back</button>
                  <button disabled={stageIdx === STAGES.length - 1} onClick={() => move(c.id, 1)} className="font-semibold text-accent-text disabled:opacity-30">Advance →</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
