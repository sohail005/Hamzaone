import Link from "next/link";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/Button";
import { quote } from "@/data/customPrint";

export default function QuotePayPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl rounded-card bg-surface p-6 shadow-sm">
        <h1 className="text-xl font-bold">Pay for quote {quote.id}</h1>
        <div className="mt-4 rounded-card border border-border p-4 text-sm">
          <p className="font-semibold">Delivery address</p>
          <p className="text-text-muted">Riya Sharma, HSR Layout, Bengaluru 560102</p>
          <Link href="/checkout?step=address" className="mt-1 inline-block text-xs font-semibold text-accent-text">Change address</Link>
        </div>
        <div className="mt-4 flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{formatINR(quote.total)}</span>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href={`/custom-print/quotes/${quote.id}/tracking`}><Button>Prototype: Pay success</Button></Link>
          <Button variant="outline">Prototype: Pay failure</Button>
        </div>
      </div>
    </div>
  );
}
