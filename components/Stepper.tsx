import { Check } from "lucide-react";
import { cx } from "@/lib/format";

export function Stepper({
  steps,
  current,
  onStepClick,
}: {
  steps: { key: string; label: string }[];
  current: string;
  onStepClick?: (key: string) => void;
}) {
  const currentIndex = steps.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <button
              onClick={() => done && onStepClick?.(s.key)}
              disabled={!done}
              aria-current={active ? "step" : undefined}
              aria-label={`${s.label}${active ? " (current step)" : done ? " (completed)" : ""}`}
              className={cx(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                active ? "bg-accent text-text" : done ? "bg-success text-white" : "bg-neutral-chip-bg text-neutral-chip-text"
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </button>
            <span className={cx("hidden text-sm font-medium sm:inline", active ? "text-text" : "text-text-muted")}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}
