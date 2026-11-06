import { Check } from "lucide-react";
import { cx } from "@/lib/format";

export function Timeline({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((s, i) => (
        <div key={s} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cx(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                i < current ? "bg-success text-white" : i === current ? "bg-accent text-text" : "bg-neutral-chip-bg text-neutral-chip-text"
              )}
            >
              {i < current ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={cx("w-px flex-1", i < current ? "bg-success" : "bg-border")} style={{ minHeight: 28 }} />}
          </div>
          <div className="pb-7">
            <p className={cx("text-sm font-semibold", i <= current ? "text-text" : "text-text-muted")}>{s}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
