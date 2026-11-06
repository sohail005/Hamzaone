import { formatINR } from "@/lib/format";
import { cx } from "@/lib/format";

export function PriceDisplay({
  amount,
  compareAt,
  size = "md",
  showGst = false,
  className,
}: {
  amount: number;
  compareAt?: number;
  size?: "sm" | "md" | "lg";
  showGst?: boolean;
  className?: string;
}) {
  const sizes = { sm: "text-sm", md: "text-base font-semibold", lg: "text-2xl font-bold" };
  return (
    <div className={cx("flex flex-col", className)}>
      <div className="flex items-baseline gap-2">
        <span className={sizes[size]}>{formatINR(amount)}</span>
        {compareAt && compareAt > amount && (
          <span className="text-sm text-text-muted line-through">{formatINR(compareAt)}</span>
        )}
      </div>
      {showGst && <span className="text-xs text-text-muted">Inclusive of GST</span>}
    </div>
  );
}
