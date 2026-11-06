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
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <CheckCircle2 className="h-14 w-14 text-success" />
      <h1 className="text-2xl font-bold">Order confirmed</h1>
      <p className="text-sm text-text-muted">Your order <span className="font-semibold text-text">{order}</span> has been placed.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link href={`/account/orders/${order}`}><Button>View order details</Button></Link>
        <Link href={`/track-order?order=${order}`}><Button variant="outline">Track order</Button></Link>
        <Link href="/shop"><Button variant="ghost">Continue shopping</Button></Link>
      </div>
      <Link href="/register" className="mt-2 text-sm font-semibold text-accent-text">Create an account</Link>
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
