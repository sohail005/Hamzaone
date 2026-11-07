"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart, cartTotals } from "@/store/cart";
import { getProduct } from "@/data/products";
import { formatINR, cx } from "@/lib/format";
import { Button } from "./Button";
import { Field, PhoneField } from "./Input";
import { Stepper } from "./Stepper";
import { RazorpayModal } from "./RazorpayModal";
import { Loader2 } from "lucide-react";
import { useDeliveryEstimate } from "@/lib/useDeliveryEstimate";

const STEPS = [
  { key: "contact", label: "Contact" },
  { key: "address", label: "Address" },
  { key: "shipping", label: "Shipping" },
  { key: "review", label: "Review" },
];

export function CheckoutFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const step = params.get("step") ?? "contact";
  const buyNowSlug = params.get("buyNow");
  const canceled = params.get("canceled") === "1";

  const { lines } = useCart();
  const buyNowProduct = buyNowSlug ? getProduct(buyNowSlug) : null;

  const effectiveLines = useMemo(() => {
    if (buyNowProduct) {
      return [{
        id: "buynow",
        slug: buyNowProduct.slug,
        name: buyNowProduct.name,
        color: buyNowProduct.colors[0].name,
        size: "Small",
        price: buyNowProduct.price,
        qty: 1,
        availability: buyNowProduct.availability,
      }];
    }
    return lines;
  }, [buyNowProduct, lines]);

  const { subtotal } = cartTotals(effectiveLines);

  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({ name: "", pin: "", line1: "", line2: "", landmark: "", city: "", state: "", type: "Home" });
  const delivery = useDeliveryEstimate();
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const shipping = shippingMethod === "express" ? 149 : subtotal >= 1499 ? 0 : 79;
  const total = subtotal + shipping;

  useEffect(() => {
    if (!/^\d{6}$/.test(address.pin)) return;
    const timeout = setTimeout(() => delivery.check(address.pin), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.pin]);

  function goto(key: string) {
    const sp = new URLSearchParams(params.toString());
    sp.set("step", key);
    sp.delete("canceled");
    router.push(`/checkout?${sp.toString()}`);
  }

  function validateContact() {
    const e: Record<string, string> = {};
    if (!contact.name) e.name = "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) e.email = "Enter a valid email address.";
    if (!/^\d{10}$/.test(contact.phone)) e.phone = "Enter a valid 10-digit phone number.";
    setErrors(e);
    if (Object.keys(e).length === 0) goto("address");
  }

  function validateAddress() {
    const e: Record<string, string> = {};
    if (!address.name) e.name = "Name is required.";
    if (!/^\d{6}$/.test(address.pin)) e.pin = "Enter a valid 6-digit PIN code.";
    if (!address.line1) e.line1 = "Address line 1 is required.";
    if (!address.city) e.city = "City is required.";
    if (!address.state) e.state = "State is required.";
    setErrors(e);
    if (Object.keys(e).length === 0) goto("shipping");
  }

  function handleResult(result: "success" | "failure" | "pending") {
    setModalOpen(false);
    if (result === "success") {
      setProcessing(true);
      setTimeout(() => {
        router.push("/order/success?order=HO-2026-10482");
      }, 1800);
    } else if (result === "failure") {
      router.push("/order/failed?order=HO-2026-10482");
    } else {
      goto("pending");
    }
  }

  if (processing) {
    return (
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-center gap-4 px-4 py-32 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="text-lg font-semibold">Processing your payment…</p>
      </div>
    );
  }

  if (step === "pending") {
    return (
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Payment pending</h1>
        <p className="max-w-md text-sm text-text-muted">
          We&apos;re waiting for confirmation from your bank. Please don&apos;t pay again — we&apos;ll update your order automatically.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => router.push("/order/success?order=HO-2026-10482")}>Check status now</Button>
          <Link href="/track-order"><Button variant="outline">Go to order tracking</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold">Checkout</h1>
        <Link href="/cart" className="text-sm font-semibold text-accent-text">Back to cart</Link>
      </div>

      <div className="mt-6">
        <Stepper steps={STEPS} current={step} onStepClick={goto} />
      </div>

      {canceled && (
        <div className="mt-4 rounded-card bg-warning-tint px-4 py-3 text-sm text-warning-text">
          Payment window closed. You have not been charged — try again when ready.
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1fr_340px]">
        <div className="rounded-card bg-surface p-6 shadow-sm">
          {step === "contact" && (
            <div className="flex flex-col gap-4">
              <Field id="name" label="Full name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} error={errors.name} />
              <Field id="email" label="Email" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} error={errors.email} />
              <PhoneField id="phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} error={errors.phone} />
              <Button onClick={validateContact} className="self-start">Continue</Button>
            </div>
          )}

          {step === "address" && (
            <div className="flex flex-col gap-4">
              {Object.keys(errors).length > 0 && (
                <div className="rounded-card bg-error-tint px-4 py-3 text-sm text-error-tint-text">Please fix the errors below.</div>
              )}
              <Field id="addr-name" label="Full name" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} error={errors.name} />
              <div>
                <Field id="pin" label="PIN code" value={address.pin} maxLength={6} onChange={(e) => setAddress({ ...address, pin: e.target.value })} error={errors.pin} />
                {delivery.status === "loading" && <p className="mt-1 text-sm text-text-muted">Checking delivery…</p>}
                {delivery.status === "success" && delivery.result && (
                  <p className={cx("mt-1 text-sm", delivery.result.serviceable ? "text-success-text" : "text-error-text")}>
                    {delivery.result.message}
                  </p>
                )}
                {delivery.status === "error" && delivery.error && (
                  <p className="mt-1 text-sm text-text-muted">{delivery.error}</p>
                )}
              </div>
              <Field id="line1" label="Address line 1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} error={errors.line1} />
              <Field id="line2" label="Address line 2 (optional)" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
              <Field id="landmark" label="Landmark (optional)" value={address.landmark} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Field id="city" label="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} error={errors.city} />
                <Field id="state" label="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} error={errors.state} />
              </div>
              <div className="flex gap-2">
                {["Home", "Work"].map((t) => (
                  <button key={t} onClick={() => setAddress({ ...address, type: t })} className={`rounded-full px-4 py-2 text-sm font-semibold ${address.type === t ? "bg-mto-chip-bg text-accent-text" : "border border-border-input"}`}>{t}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => goto("contact")}>Back</Button>
                <Button onClick={validateAddress}>Continue</Button>
              </div>
            </div>
          )}

          {step === "shipping" && (
            <div className="flex flex-col gap-4">
              {[
                { key: "standard", label: "Standard shipping", price: subtotal >= 1499 ? 0 : 79, eta: "3–6 business days after dispatch (estimate)" },
                { key: "express", label: "Express shipping", price: 149, eta: "1–3 business days after dispatch (estimate)" },
              ].map((opt) => (
                <label key={opt.key} className={`flex items-center justify-between rounded-card border p-4 ${shippingMethod === opt.key ? "border-accent" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shippingMethod === opt.key} onChange={() => setShippingMethod(opt.key as "standard" | "express")} />
                    <div>
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-text-muted">{opt.eta}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{opt.price === 0 ? "Free" : formatINR(opt.price)}</span>
                </label>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => goto("address")}>Back</Button>
                <Button onClick={() => goto("review")}>Continue</Button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Contact</h3>
                  <button onClick={() => goto("contact")} className="text-xs font-semibold text-accent-text">Edit</button>
                </div>
                <p className="text-sm text-text-muted">{contact.name || "Guest"} · {contact.email} · {contact.phone}</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Shipping address</h3>
                  <button onClick={() => goto("address")} className="text-xs font-semibold text-accent-text">Edit</button>
                </div>
                <p className="text-sm text-text-muted">{address.name}, {address.line1}, {address.city}, {address.state} {address.pin}</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Shipping method</h3>
                  <button onClick={() => goto("shipping")} className="text-xs font-semibold text-accent-text">Edit</button>
                </div>
                <p className="text-sm text-text-muted">{shippingMethod === "express" ? "Express" : "Standard"} — {shipping === 0 ? "Free" : formatINR(shipping)}</p>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5" />
                I agree to the <Link href="/terms" className="underline">terms and conditions</Link>.
              </label>
              <Button disabled={!terms} size="lg" onClick={() => setModalOpen(true)}>
                Pay {formatINR(total)} securely
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-card bg-surface p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">Order summary</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {effectiveLines.map((l) => (
              <li key={l.id} className="flex justify-between">
                <span className="text-text-muted">{l.name} × {l.qty}</span>
                <span>{formatINR(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatINR(total)}</span></div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <RazorpayModal
          amount={total}
          onResult={handleResult}
          onClose={() => {
            setModalOpen(false);
            goto("review");
            router.push("/checkout?step=review&canceled=1");
          }}
        />
      )}
    </div>
  );
}
