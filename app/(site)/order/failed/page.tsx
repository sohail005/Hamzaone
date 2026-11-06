"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/Button";

function FailedContent() {
  const params = useSearchParams();
  const router = useRouter();
  const order = params.get("order") ?? "HO-2026-10482";

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <XCircle className="h-14 w-14 text-error" />
      <h1 className="text-2xl font-bold">Payment failed</h1>
      <p className="text-sm text-text-muted">We couldn't process payment for order <span className="font-semibold text-text">{order}</span>. You have not been charged.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Button onClick={() => router.push("/checkout?step=review")}>Retry payment</Button>
        <Button variant="outline" onClick={() => router.push("/checkout?step=review")}>Change details</Button>
        <Link href="/contact"><Button variant="ghost">Contact support</Button></Link>
      </div>
    </div>
  );
}

export default function OrderFailedPage() {
  return (
    <Suspense>
      <FailedContent />
    </Suspense>
  );
}
