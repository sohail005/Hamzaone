"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { useCart } from "@/store/cart";
import { useEffect } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const order = params.get("order") ?? "HO-2026-10482";
  const paymentId = params.get("paymentId");
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <CheckCircle2 className="h-14 w-14 text-success" />
      <h1 className="text-2xl font-bold">{paymentId ? "Razorpay test payment verified" : "Order confirmed"}</h1>
      {paymentId ? (
        <>
          <p className="text-sm text-text-muted">
            Payment <span className="font-semibold text-text">{paymentId}</span> was verified successfully.
          </p>
          <p className="max-w-lg text-sm text-text-muted">
            This demo does not save orders to a database. The test payment is not a production order.
          </p>
        </>
      ) : (
        <p className="text-sm text-text-muted">Your order <span className="font-semibold text-text">{order}</span> has been placed.</p>
      )}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {!paymentId && <Link href={`/account/orders/${order}`}><Button>View order details</Button></Link>}
        {!paymentId && <Link href={`/track-order?order=${order}`}><Button variant="outline">Track order</Button></Link>}
        <Link href="/shop"><Button variant="ghost">Continue shopping</Button></Link>
      </div>
      {!paymentId && <Link href="/register" className="mt-2 text-sm font-semibold text-accent-text">Create an account</Link>}
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
