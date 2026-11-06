"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/format";

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface">
      {items.map((item, i) => (
        <div key={item.q}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-text"
          >
            {item.q}
            <ChevronDown className={cx("h-4 w-4 flex-shrink-0 transition-transform duration-150", open === i && "rotate-180")} />
          </button>
          {open === i && <p className="px-5 pb-4 text-sm text-text-muted">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
