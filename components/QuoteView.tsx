"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { quote } from "@/data/customPrint";
import { formatINR } from "@/lib/format";
import { Button } from "./Button";
import { StatusChip } from "./StatusChip";

type QuoteState = "awaiting" | "received" | "accepted" | "rejected" | "expired";

export function QuoteView({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const state = (params.get("state") as QuoteState) ?? "awaiting";

  function setState(s: QuoteState) {
    router.push(`/custom-print/quotes/${id}?state=${s}`);
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl rounded-card bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Quote {id}</h1>
          {state === "awaiting" && <StatusChip tone="warning"><Clock className="mr-1 inline h-3 w-3" />Awaiting quote</StatusChip>}
          {state === "received" && <StatusChip tone="accent"><FileText className="mr-1 inline h-3 w-3" />Quote received</StatusChip>}
          {state === "accepted" && <StatusChip tone="success"><CheckCircle2 className="mr-1 inline h-3 w-3" />Accepted</StatusChip>}
          {state === "rejected" && <StatusChip tone="error"><XCircle className="mr-1 inline h-3 w-3" />Rejected</StatusChip>}
          {state === "expired" && <StatusChip tone="neutral"><Clock className="mr-1 inline h-3 w-3" />Expired</StatusChip>}
        </div>

        {state === "awaiting" && (
          <p className="mt-4 text-sm text-text-muted">
            Our team is reviewing your model. We'll notify you by email once a quote is ready — usually within 24 hours.
          </p>
        )}

        {(state === "received" || state === "accepted") && (
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">Printing cost</span><span>{formatINR(quote.printingCost)}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Material cost</span><span>{formatINR(quote.materialCost)}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Shipping</span><span>{formatINR(quote.shipping)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span>{formatINR(quote.total)}</span></div>
            <p className="mt-1 text-xs text-text-muted">Valid until {new Date(quote.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        )}

        {state === "rejected" && (
          <p className="mt-4 text-sm text-text-muted">You rejected this quote. You can ask for a revised quote or start a new request.</p>
        )}

        {state === "expired" && (
          <p className="mt-4 text-sm text-text-muted">This quote has expired. Request a new quote to continue.</p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {state === "received" && (
            <>
              <Button onClick={() => setState("accepted")}>Accept</Button>
              <Button variant="outline" onClick={() => setState("rejected")}>Reject</Button>
            </>
          )}
          {state === "accepted" && (
            <Link href={`/custom-print/quotes/${id}/pay`}><Button>Proceed to Payment</Button></Link>
          )}
          {state === "rejected" && (
            <>
              <Link href="/contact"><Button variant="outline">Ask for a revised quote</Button></Link>
              <Link href="/custom-print?step=upload"><Button>Start a new request</Button></Link>
            </>
          )}
          {state === "expired" && (
            <Button onClick={() => setState("awaiting")}>Request a new quote</Button>
          )}
          {state === "awaiting" && (
            <button onClick={() => setState("received")} className="text-xs text-text-muted underline">
              Prototype: simulate quote received
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
