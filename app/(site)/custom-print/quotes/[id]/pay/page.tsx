"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { quote } from "@/data/customPrint";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/Button";
import { AlertCircle } from "lucide-react";

export default function QuotePayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState(false);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl rounded-card bg-surface p-6 shadow-sm">
        <h1 className="text-xl font-bold">Pay for quote {params.id}</h1>
        <div className="mt-4 rounded-card border border-border p-4 text-sm">
          <p className="font-semibold">Delivery address</p>
          <p className="text-text-muted">Riya Sharma, HSR Layout, Bengaluru 560102</p>
          <Link href="/checkout?step=address" className="mt-1 inline-block text-xs font-semibold text-accent-text">Change address</Link>
        </div>
        <div className="mt-4 flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{formatINR(quote.total)}</span>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-card bg-error-tint px-4 py-3 text-sm text-error-tint-text">
            <AlertCircle className="h-4 w-4" /> Payment failed. Please try again.
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button onClick={() => router.push(`/custom-print/quotes/${params.id}/tracking`)}>Prototype: Pay success</Button>
          <Button variant="outline" onClick={() => setError(true)}>Prototype: Pay failure</Button>
        </div>
      </div>
    </div>
  );
}
