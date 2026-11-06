"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { findOrder } from "@/data/orders";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";
import { Timeline } from "@/components/Timeline";
import { cx } from "@/lib/format";

const STATUSES = ["Printing", "Post Processing", "Quality Check", "Packed", "Shipped", "Delivered", "Canceled"];

function TrackContent() {
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");
  const [contact, setContact] = useState("");
  const [stage, setStage] = useState<"find" | "notfound" | "verify" | "tracking">("find");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);

  function findOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    const order = findOrder(orderNumber.trim());
    if (order) setStage("verify");
    else setStage("notfound");
  }

  function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp === "123456") {
      setStage("tracking");
      setOtpError(null);
    } else {
      setOtpError("Incorrect code. For this demo, use 123456.");
    }
  }

  const order = findOrder(orderNumber.trim());

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg rounded-card bg-surface p-6 shadow-sm">
        <h1 className="text-xl font-bold">Track your order</h1>

        {stage === "find" && (
          <form onSubmit={findOrderSubmit} className="mt-4 flex flex-col gap-4">
            <Field id="order" label="Order number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="HO-2026-10482" required />
            <Field id="contact" label="Email or phone used at checkout" value={contact} onChange={(e) => setContact(e.target.value)} required />
            <Button type="submit">Find my order</Button>
          </form>
        )}

        {stage === "notfound" && (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm text-error-text">We couldn't find an order with that number. Please check and try again.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStage("find")}>Try again</Button>
              <Link href="/contact"><Button>Contact support</Button></Link>
            </div>
          </div>
        )}

        {stage === "verify" && order && (
          <form onSubmit={verifyOtp} className="mt-4 flex flex-col gap-4">
            <p className="text-sm text-text-muted">We've sent a 6-digit code to verify it's you. (Demo code: 123456)</p>
            <Field id="otp" label="Verification code" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} error={otpError ?? undefined} />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStage("find")}>Change order number</Button>
              <Button type="submit">Verify</Button>
            </div>
          </form>
        )}

        {stage === "tracking" && order && (
          <div className="mt-4 flex flex-col gap-5">
            <div>
              <p className="text-sm font-semibold">{order.id}</p>
              <p className="text-xs text-text-muted">Placed on {order.placedAt}</p>
            </div>
            <Timeline steps={STATUSES.slice(0, 6)} current={statusIndex === 6 ? 5 : statusIndex} />
            {statusIndex === 6 && <p className="text-sm font-semibold text-error-text">This order was canceled.</p>}

            <div>
              <p className="mb-2 text-xs font-semibold text-text-muted">Prototype: switch status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setStatusIndex(i)}
                    className={cx("rounded-chip border px-3 py-1.5 text-xs font-medium", statusIndex === i ? "border-accent text-accent-text" : "border-border text-text-muted")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-accent-text"
              onClick={(e) => e.preventDefault()}
            >
              Open courier tracking (Prototype)
            </a>
            <div className="flex gap-3">
              <Link href="/contact"><Button variant="outline">Contact support</Button></Link>
              <Link href="/account/orders"><Button>See all orders in your account</Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackContent />
    </Suspense>
  );
}
