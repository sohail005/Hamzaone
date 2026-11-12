"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { formatINR } from "@/lib/format";
import { Button } from "./Button";

type CheckoutLine = {
  productSlug: string;
  qty: number;
  color: string;
  size: string;
  engraving?: string;
};

type ShippingAddress = {
  name: string;
  pin: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  type: "Home" | "Work";
};

type PaymentResult = {
  orderId: string;
  paymentId: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal: { ondismiss: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", callback: () => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

let checkoutScript: Promise<void> | null = null;

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!checkoutScript) {
    checkoutScript = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => (window.Razorpay ? resolve() : reject(new Error("Razorpay checkout did not load.")));
      script.onerror = () => reject(new Error("Could not load Razorpay checkout."));
      document.body.appendChild(script);
    }).catch((error: unknown) => {
      checkoutScript = null;
      throw error;
    });
  }
  return checkoutScript;
}

export function RazorpayModal({
  amount,
  items,
  shippingMethod,
  couponCode,
  customer,
  address,
  onResult,
  onClose,
}: {
  amount: number;
  items: CheckoutLine[];
  shippingMethod: "standard" | "express";
  couponCode: string | null;
  customer: { name: string; email: string; phone: string };
  address: ShippingAddress;
  onResult: (result: "success" | "pending", payment?: PaymentResult) => void;
  onClose: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function startPayment() {
    setProcessing(true);
    setError(null);
    try {
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, shippingMethod, couponCode, customer, address }),
      });
      const orderPayload: unknown = await orderResponse.json().catch(() => null);
      const order = isRecord(orderPayload) ? orderPayload : {};
      if (!orderResponse.ok) {
        throw new Error(typeof order.error === "string" ? order.error : "Could not create a Razorpay order.");
      }
      if (
        typeof order.keyId !== "string" ||
        typeof order.amount !== "number" ||
        typeof order.currency !== "string" ||
        typeof order.orderId !== "string" ||
        typeof order.internalOrderId !== "string"
      ) {
        throw new Error("Razorpay returned an invalid payment order.");
      }

      await loadRazorpayCheckout();
      if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable.");

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "HamzaOne",
        description: "Test-mode checkout",
        order_id: order.orderId,
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        theme: { color: "#F97316" },
        handler: async (payment) => {
          try {
            const verificationResponse = await fetch("/api/payments/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payment),
            });
            const verificationPayload: unknown = await verificationResponse.json().catch(() => null);
            const verification = isRecord(verificationPayload) ? verificationPayload : {};
            if (typeof verification.orderId !== "string") {
              throw new Error("The verified order reference was missing.");
            }
            if (verificationResponse.status === 202 && verification.status === "pending") {
              onResult("pending", { orderId: verification.orderId, paymentId: payment.razorpay_payment_id });
              return;
            }
            if (!verificationResponse.ok || verification.status !== "success") {
              throw new Error(
                typeof verification.error === "string"
                  ? verification.error
                  : "Razorpay could not verify this payment.",
              );
            }
            onResult("success", { orderId: verification.orderId, paymentId: payment.razorpay_payment_id });
          } catch (verificationError) {
            setError(verificationError instanceof Error ? verificationError.message : "Could not verify the payment.");
            setProcessing(false);
          }
        },
        modal: { ondismiss: onClose },
      });
      checkout.on("payment.failed", () => {
        setError("Payment failed. No successful payment was confirmed. You can try again.");
        setProcessing(false);
      });
      checkout.open();
      setProcessing(false);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Could not start Razorpay checkout.");
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Razorpay test payment"
        className="relative w-full max-w-sm rounded-panel border border-border bg-surface p-6 shadow-lg"
      >
        <button ref={closeRef} onClick={onClose} aria-label="Close payment window" className="absolute right-4 top-4">
          <X className="h-5 w-5" />
        </button>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Razorpay test mode
        </p>
        <h2 className="text-lg font-bold">Pay {formatINR(amount)}</h2>
        <p className="mt-1 text-sm text-text-muted">
          This opens Razorpay&apos;s secure checkout using test credentials. Test payments do not charge real money.
        </p>
        {error && <p role="alert" className="mt-4 rounded-input bg-error-tint p-3 text-sm text-error-tint-text">{error}</p>}
        <div className="mt-6 flex flex-col gap-2">
          <Button loading={processing} disabled={processing} onClick={startPayment}>
            {processing ? "Connecting to Razorpay…" : "Continue to Razorpay"}
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
