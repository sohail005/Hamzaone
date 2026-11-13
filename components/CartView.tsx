"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCart, cartTotals } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useToast } from "@/store/toast";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/Button";
import { Field } from "@/components/Input";
import { ConceptRender } from "@/components/ConceptRender";
import type { Product } from "@/data/products";
import { api } from "@/lib/api";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { calculateCheckoutPricing } from "@/lib/checkout-pricing";

export function CartView() {
  const { lines, couponCode, removeLine, setQty, addLine, setCouponCode } = useCart(
    useShallow((state) => ({
      lines: state.lines,
      couponCode: state.couponCode,
      removeLine: state.removeLine,
      setQty: state.setQty,
      addLine: state.addLine,
      setCouponCode: state.setCouponCode,
    })),
  );
  const toggleWishlist = useWishlist((state) => state.toggle);
  const push = useToast((s) => s.push);
  const { subtotal } = useMemo(() => cartTotals(lines), [lines]);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [productCache, setProductCache] = useState<Record<string, Product>>({});

  const hasOOS = useMemo(() => lines.some((l) => l.availability === "out-of-stock"), [lines]);
  const pricing = useMemo(
    () => calculateCheckoutPricing(subtotal, "standard", couponCode),
    [couponCode, subtotal],
  );

  useEffect(() => {
    const uncached = [...new Set(lines.map((line) => line.slug))].filter((slug) => !productCache[slug]);
    if (uncached.length === 0) return;

    Promise.all(
      uncached.map((slug) =>
        api.products.get(slug).then(({ product }: { product: Product }) => ({ slug, product })),
      ),
    )
      .then((results) => {
        setProductCache((prev) => ({ ...prev, ...Object.fromEntries(results.map((r) => [r.slug, r.product])) }));
      })
      .catch((error: unknown) => {
        console.error("Could not load cart product details.", error);
      });
  }, [lines, productCache]);

  function applyCoupon(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("coupon") ?? "").trim().toUpperCase();
    const result = calculateCheckoutPricing(subtotal, "standard", code);
    setCouponCode(result.couponError ? null : result.couponCode);
    setCouponError(result.couponError);
  }

  const { discount, shipping, total } = pricing;

  function removeWithUndo(id: string) {
    const line = lines.find((l) => l.id === id);
    if (!line) return;
    removeLine(id);
    push(`Removed ${line.name}`, {
      label: "Undo",
      onClick: () => addLine({ slug: line.slug, name: line.name, color: line.color, size: line.size, price: line.price, qty: line.qty, engraving: line.engraving, availability: line.availability }),
    });
  }

  function moveToWishlist(id: string) {
    const line = lines.find((l) => l.id === id);
    if (!line) return;
    toggleWishlist(line.slug);
    removeLine(id);
    push(`Moved ${line.name} to wishlist`);
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-sm text-text-muted">Browse products or start a custom creation to get going.</p>
        <div className="flex gap-3">
          <Link href="/shop"><Button>Shop products</Button></Link>
          <Link href="/custom-creations"><Button variant="outline">Start a custom creation</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1 className="mt-3 text-[28px] font-bold">Your cart</h1>

      {hasOOS && (
        <div className="mt-4 rounded-card bg-warning-tint px-4 py-3 text-sm text-warning-text">
          One or more items in your cart are out of stock and are excluded from your total.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1fr_340px]">
        <ul className="flex flex-col gap-4">
          {lines.map((l) => {
            const product = productCache[l.slug];
            const isOOS = l.availability === "out-of-stock";
            return (
              <li key={l.id} className={`flex gap-4 rounded-card bg-surface p-4 shadow-sm ${isOOS ? "opacity-60" : ""}`}>
                <Link href={`/products/${l.slug}`} className="shrink-0">
                  <ConceptRender shape={product?.shape ?? "vase"} color={product?.colors[0]?.hex} className="h-20 w-20 rounded-chip" />
                </Link>
                <div className="flex flex-1 flex-col gap-1">
                  <Link href={`/products/${l.slug}`} className="text-sm font-semibold hover:text-accent-text">{l.name}</Link>
                  <p className="text-xs text-text-muted">{l.color} · {l.size}{l.engraving ? ` · Engraved: "${l.engraving}"` : ""}</p>
                  {isOOS && <p className="text-xs font-semibold text-error-text">Out of stock — excluded from total</p>}
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-border-input">
                      <button className="px-3 py-1" onClick={() => setQty(l.id, Math.max(1, l.qty - 1))}>−</button>
                      <span className="w-8 text-center text-sm">{l.qty}</span>
                      <button className="px-3 py-1" onClick={() => setQty(l.id, Math.min(10, l.qty + 1))}>+</button>
                    </div>
                    <button onClick={() => removeWithUndo(l.id)} className="text-xs font-semibold text-error-text hover:underline">Remove</button>
                    <button onClick={() => moveToWishlist(l.id)} className="text-xs font-semibold text-accent-text hover:underline">Move to wishlist</button>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatINR((l.price + (l.engraving ? 99 : 0)) * l.qty)}</span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-4">
          <form onSubmit={applyCoupon} className="rounded-card bg-surface p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold">Coupon code</h3>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <Field id="coupon" name="coupon" key={couponCode ?? "none"} defaultValue={couponCode ?? ""} placeholder="FIRST100" error={couponError ?? pricing.couponError ?? undefined} />
              </div>
              <Button type="submit" variant="outline" className="shrink-0">Apply</Button>
            </div>
            {couponCode && discount > 0 && <p className="mt-2 text-sm text-success-text">Coupon {couponCode} applied — {formatINR(discount)} off.</p>}
          </form>

          <div className="rounded-card bg-surface p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Order summary</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span>{formatINR(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-success-text"><span>Discount</span><span>−{formatINR(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-text-muted">Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span>{formatINR(total)}</span></div>
            </div>
            <Link href="/checkout" className="mt-4 block">
              <Button className="w-full" size="lg">Proceed to checkout</Button>
            </Link>
          </div>

          <p className="text-xs text-text-muted">
            By checking out you agree to our <Link href="/terms" className="underline">terms</Link> and <Link href="/return-policy" className="underline">return policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
