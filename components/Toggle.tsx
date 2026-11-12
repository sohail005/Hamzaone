"use client";

import { cx } from "@/lib/format";

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      aria-label={label}
      className={cx(
        "relative h-6 w-11 shrink-0 rounded-full p-0 transition-colors",
        checked ? "bg-success" : "bg-border-input",
      )}
    >
      <span
        className={cx(
          "absolute left-0.5 top-0.5 block h-5 w-5 rounded-full bg-white transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
