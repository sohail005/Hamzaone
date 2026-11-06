"use client";

import { useState } from "react";
import { InfoLayout } from "@/components/InfoLayout";
import { FaqAccordion } from "@/components/FaqAccordion";
import { faqs } from "@/data/customPrint";
import { cx } from "@/lib/format";

const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];

export default function FaqPage() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? faqs : faqs.filter((f) => f.category === active);

  return (
    <InfoLayout>
      <h1 className="text-2xl font-bold">Frequently asked questions</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cx("rounded-full border px-4 py-1.5 text-sm font-medium", active === c ? "border-accent bg-mto-chip-bg text-accent-text" : "border-border-input text-text-muted")}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <FaqAccordion items={filtered} />
      </div>
    </InfoLayout>
  );
}
