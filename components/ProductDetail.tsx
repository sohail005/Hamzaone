"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronDown, Heart } from "lucide-react";
import type { Product } from "@/data/products";

const Product3DViewer = dynamic(() => import("./Product3DViewer").then((m) => m.Product3DViewer), {
  ssr: false,
  loading: () => <div className="aspect-square animate-pulse rounded-panel bg-art-tile" />,
});
import { AvailabilityChip } from "./StatusChip";
import { PriceDisplay } from "./PriceDisplay";
import { Button } from "./Button";
import { Field } from "./Input";
import { Breadcrumbs } from "./Breadcrumbs";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { formatINR, cx } from "@/lib/format";
import { getCategory } from "@/data/categories";
import { useDeliveryEstimate } from "@/lib/useDeliveryEstimate";

const VIEWS = ["Front", "Side", "Top", "Scale with hand"];

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const params = useSearchParams();
  const { addLine, openDrawer } = useCart();
  const { has, toggle } = useWishlist();
  const [view, setView] = useState(0);
  const [engrave, setEngrave] = useState(false);
  const [engraveText, setEngraveText] = useState("");
  const [qty, setQty] = useState(1);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const delivery = useDeliveryEstimate();
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notified, setNotified] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);

  const color = params.get("color") ?? product.colors[0].name;
  const size = params.get("size") ?? "Small";

  const isOOS = product.availability === "out-of-stock";
  const isUnavailableCombo =
    product.unavailableCombo && product.unavailableCombo.color === color && product.unavailableCombo.size === size;

  const price = size === "Large" && product.largePrice ? product.largePrice : product.price;

  const engravingError = useMemo(() => {
    if (!engrave || !engraveText) return null;
    if (engraveText.length < 1 || engraveText.length > 12) return "Must be 1–12 characters.";
    if (!/^[a-zA-Z0-9 &.\-]+$/.test(engraveText)) return "Only letters, numbers, spaces, & . - are allowed.";
    return null;
  }, [engrave, engraveText]);

  function setVariant(next: { color?: string; size?: string }) {
    const sp = new URLSearchParams(params.toString());
    if (next.color) sp.set("color", next.color);
    if (next.size) sp.set("size", next.size);
    router.replace(`/products/${product.slug}?${sp.toString()}`);
  }

  function addToCart() {
    if (isUnavailableCombo || isOOS) return;
    addLine({
      slug: product.slug,
      name: product.name,
      color,
      size,
      price,
      qty,
      engraving: engrave && engraveText ? engraveText : undefined,
      availability: product.availability,
    });
    openDrawer();
  }

  function buyNow() {
    if (isUnavailableCombo || isOOS) return;
    addToCart();
    router.push(`/checkout?buyNow=${product.slug}`);
  }

  function checkPin(e: React.FormEvent) {
    e.preventDefault();
    if (/^\d{6}$/.test(pin)) {
      setPinError(null);
      delivery.check(pin);
    } else {
      setPinError("Enter a valid 6-digit PIN code.");
    }
  }

  const category = getCategory(product.category);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 pb-28 sm:px-6 md:pb-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(category ? [{ label: category.name, href: `/shop/${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="mt-5 grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div className="md:sticky md:top-24 md:self-start">
          <Product3DViewer shape={product.shape} color={product.colors.find((c) => c.name === color)?.hex} view={view} className="aspect-square rounded-panel" />
          <div className="mt-3 flex gap-2">
            {VIEWS.map((v, i) => (
              <button
                key={v}
                onClick={() => setView(i)}
                className={cx(
                  "rounded-chip border px-3 py-2 text-xs font-medium",
                  view === i ? "border-accent text-accent-text" : "border-border text-text-muted"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <AvailabilityChip status={product.availability} />
            <h1 className="mt-2 text-[28px] font-bold leading-tight">{product.name}</h1>
            <PriceDisplay amount={price} size="lg" showGst className="mt-2" />
          </div>
          <p className="text-sm text-text-muted">{product.description}</p>

          {!isOOS && (
            <>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Colour</h3>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      aria-label={c.name}
                      onClick={() => setVariant({ color: c.name })}
                      className={cx(
                        "h-10 w-10 rounded-full border-2",
                        color === c.name ? "border-accent" : "border-transparent"
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-text-muted">{color}</p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Size</h3>
                <div className="flex gap-2">
                  {["Small", "Large"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setVariant({ size: s })}
                      className={cx(
                        "rounded-full border px-4 py-2 text-sm font-medium",
                        size === s ? "border-accent bg-mto-chip-bg text-accent-text" : "border-border-input"
                      )}
                    >
                      {s} — {formatINR(s === "Large" && product.largePrice ? product.largePrice : product.price)}
                    </button>
                  ))}
                </div>
                {isUnavailableCombo && (
                  <p className="mt-2 text-sm text-error-text">
                    {color} is not available in {size}. Please choose a different colour or size.
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={engrave} onChange={(e) => setEngrave(e.target.checked)} />
                  Add engraving (+₹99)
                </label>
                {engrave && (
                  <div className="mt-2">
                    <Field
                      id="engrave"
                      value={engraveText}
                      onChange={(e) => setEngraveText(e.target.value)}
                      placeholder="e.g. Riya"
                      error={engravingError ?? undefined}
                      hint={!engravingError ? "1–12 characters: letters, numbers, spaces, & . -" : undefined}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold">Quantity</h3>
                <div className="flex items-center rounded-full border border-border-input">
                  <button className="px-3 py-1.5" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span className="w-8 text-center text-sm">{qty}</span>
                  <button className="px-3 py-1.5" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
                </div>
              </div>

              <div className="hidden gap-3 md:flex">
                <Button className="flex-1" disabled={!!isUnavailableCombo || !!engravingError} onClick={addToCart}>
                  Add to cart
                </Button>
                <Button variant="secondary" className="flex-1" disabled={!!isUnavailableCombo || !!engravingError} onClick={buyNow}>
                  Buy now
                </Button>
                <button
                  aria-label={has(product.slug) ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={() => toggle(product.slug)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-border-input"
                >
                  <Heart className={cx("h-5 w-5", has(product.slug) ? "fill-accent text-accent" : "text-text")} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-card border border-border p-4">
                  <h4 className="text-sm font-semibold">Production</h4>
                  <p className="mt-1 text-sm text-text-muted">
                    {product.availability === "made-to-order" ? "Printed to order after purchase." : "Printed and quality-checked before dispatch."}
                  </p>
                </div>
                <div className="rounded-card border border-border p-4">
                  <h4 className="text-sm font-semibold">Shipping</h4>
                  <p className="mt-1 text-sm text-text-muted">3–6 business days after dispatch (Estimated).</p>
                </div>
              </div>

              <form onSubmit={checkPin} className="flex gap-2">
                <Field
                  id="pin"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Check delivery — enter PIN code"
                  maxLength={6}
                  className="flex-1"
                />
                <Button type="submit" variant="outline" disabled={delivery.status === "loading"}>
                  {delivery.status === "loading" ? "Checking…" : "Check"}
                </Button>
              </form>
              {pinError && <p className="text-sm text-error-text">{pinError}</p>}
              {delivery.status === "success" && delivery.result && (
                <p className={cx("text-sm", delivery.result.serviceable ? "text-success-text" : "text-error-text")}>
                  {delivery.result.message}
                </p>
              )}
              {delivery.status === "error" && delivery.error && (
                <p className="text-sm text-text-muted">{delivery.error}</p>
              )}
            </>
          )}

          {isOOS && (
            <div className="rounded-card border border-border p-5">
              <h3 className="text-sm font-semibold">This item is out of stock</h3>
              {notified ? (
                <p className="mt-2 text-sm text-success-text">We&apos;ll email you when it&apos;s back in stock.</p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setNotified(true);
                  }}
                  className="mt-3 flex gap-2"
                >
                  <Field id="notify" type="email" required value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} placeholder="you@example.com" className="flex-1" />
                  <Button type="submit">Notify me</Button>
                </form>
              )}
            </div>
          )}

          <div className="rounded-card border border-border">
            <button onClick={() => setSpecsOpen((s) => !s)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold">
              Specifications <ChevronDown className={cx("h-4 w-4 transition-transform", specsOpen && "rotate-180")} />
            </button>
            {specsOpen && (
              <div className="border-t border-border px-4 py-3 text-sm text-text-muted">
                <p>Material: {product.material}</p>
                <p>Category: {category?.name}</p>
                <p>Finish: Matte</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isOOS && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 border-t border-border bg-surface p-4 shadow-lg md:hidden">
          <div className="flex items-center rounded-full border border-border-input">
            <button className="px-3 py-1.5" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span className="w-8 text-center text-sm">{qty}</span>
            <button className="px-3 py-1.5" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
          </div>
          <Button className="flex-1" disabled={!!isUnavailableCombo || !!engravingError} onClick={addToCart}>
            Add to cart
          </Button>
        </div>
      )}

      <Link href="/shop" className="sr-only">Back to shop</Link>
    </div>
  );
}
