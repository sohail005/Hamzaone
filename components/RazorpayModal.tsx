"use client";

import { X } from "lucide-react";
import { formatINR } from "@/lib/format";
import { Button } from "./Button";

export function RazorpayModal({
  amount,
  onResult,
  onClose,
}: {
  amount: number;
  onResult: (result: "success" | "failure" | "pending") => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Razorpay payment (conceptual)"
        className="relative w-full max-w-sm rounded-panel border-2 border-dashed border-border-input bg-surface p-6"
      >
        <button onClick={onClose} aria-label="Close payment window" className="absolute right-4 top-4">
          <X className="h-5 w-5" />
        </button>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Conceptual · Razorpay-hosted UI, not controlled by HamzaOne
        </p>
        <h2 className="text-lg font-bold">Pay {formatINR(amount)}</h2>
        <p className="mt-1 text-sm text-text-muted">Prototype payment window — choose an outcome below.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => onResult("success")}>Prototype: Success</Button>
          <Button variant="destructive" onClick={() => onResult("failure")}>Prototype: Failure</Button>
          <Button variant="outline" onClick={() => onResult("pending")}>Prototype: Pending</Button>
          <Button variant="ghost" onClick={onClose}>User closes window</Button>
        </div>
      </div>
    </div>
  );
}
