import { cx } from "@/lib/format";
import type { Availability } from "@/data/products";

const styles: Record<Availability, string> = {
  available: "bg-success-tint text-success-text",
  "made-to-order": "bg-mto-chip-bg text-mto-chip-text",
  "low-stock": "bg-warning-tint text-warning-text",
  "out-of-stock": "bg-neutral-chip-bg text-neutral-chip-text",
};

const labels: Record<Availability, string> = {
  available: "In stock",
  "made-to-order": "Made to order",
  "low-stock": "Low stock",
  "out-of-stock": "Out of stock",
};

export function AvailabilityChip({ status, className }: { status: Availability; className?: string }) {
  return (
    <span className={cx("inline-flex rounded-chip px-2.5 py-1 text-xs font-medium", styles[status], className)}>
      {labels[status]}
    </span>
  );
}

type GenericChipTone = "success" | "warning" | "error" | "neutral" | "accent";
const tones: Record<GenericChipTone, string> = {
  success: "bg-success-tint text-success-text",
  warning: "bg-warning-tint text-warning-text",
  error: "bg-error-tint text-error-tint-text",
  neutral: "bg-neutral-chip-bg text-neutral-chip-text",
  accent: "bg-mto-chip-bg text-mto-chip-text",
};

export function StatusChip({ tone, children }: { tone: GenericChipTone; children: React.ReactNode }) {
  return <span className={cx("inline-flex rounded-chip px-2.5 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}
