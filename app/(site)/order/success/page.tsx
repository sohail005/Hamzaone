"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/Button";
import { useCart } from "@/store/cart";
import { useEffect, useState } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const requestedOrder = params.get("order");
  const order = requestedOrder && /^HO-\d{4}-[A-F0-9]{32}$/i.test(requestedOrder) ? requestedOrder : null;
  const requestedPaymentId = params.get("paymentId");
  const paymentId = requestedPaymentId && /^pay_[A-Z0-9]+$/i.test(requestedPaymentId) ? requestedPaymentId : null;
  const [verification, setVerification] = useState<"checking" | "confirmed" | "failed">("checking");
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    if (!order || !paymentId) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ id: order, paymentId });

    fetch(`/api/orders?${query.toString()}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result: unknown = await response.json().catch(() => null);
        if (
          response.ok &&
          typeof result === "object" &&
          result !== null &&
          "verified" in result &&
          result.verified === true &&
          "orderId" in result &&
          result.orderId === order
        ) {
          setVerification("confirmed");
        } else {
          setVerification("failed");
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setVerification("failed");
      });

    return () => controller.abort();
  }, [order, paymentId]);

  const isChecking = Boolean(order && paymentId && verification === "checking");
  const confirmed = Boolean(order && paymentId && verification === "confirmed");

  useEffect(() => {
    if (confirmed) clear();
  }, [clear, confirmed]);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      {confirmed ? <CheckCircle2 className="h-14 w-14 text-success" /> : isChecking ? null : <XCircle className="h-14 w-14 text-error" />}
      <h1 className="text-2xl font-bold">
        {confirmed ? "Payment verified" : isChecking ? "Verifying payment…" : "Order not confirmed"}
      </h1>
      {confirmed ? (
        <>
          <p className="text-sm text-text-muted">Order <span className="font-semibold text-text">{order}</span> is confirmed.</p>
          <p className="text-sm text-text-muted">Payment <span className="font-semibold text-text">{paymentId}</span> was verified successfully.</p>
          <p className="max-w-lg text-sm text-text-muted">
            This checkout is in test mode. No real payment was taken.
          </p>
        </>
      ) : (
        <p className="max-w-lg text-sm text-text-muted">
          {isChecking
            ? "Checking the saved payment status. This may take a moment."
            : "We don&apos;t have a verified payment reference for this page. Your order has not been confirmed."}
        </p>
      )}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {confirmed && <Link href={`/track-order?order=${encodeURIComponent(order ?? "")}`}><Button>Track order</Button></Link>}
        {!confirmed && !isChecking && <Link href="/checkout?step=review"><Button>Return to checkout</Button></Link>}
        <Link href="/shop"><Button variant="ghost">Continue shopping</Button></Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
