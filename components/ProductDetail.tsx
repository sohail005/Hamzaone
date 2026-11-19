"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronDown, Heart, Play } from "lucide-react";
import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";

const Product3DViewer = dynamic(() => import("./Product3DViewer").then((m) => m.Product3DViewer), {
  ssr: false,
  loading: () => <div className="aspect-square animate-pulse rounded-panel bg-art-tile" />,
});
import { AvailabilityChip } from "./StatusChip";
import { PriceDisplay } from "./PriceDisplay";
import { Button } from "./Button";
import { Field } from "./Input";
import { Breadcrumbs } from "./Breadcrumbs";
import { useShallow } from "zustand/react/shallow";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { cx } from "@/lib/format";
import { assetUrl } from "@/lib/assets";
import { api } from "@/lib/api";
import { useDeliveryEstimate } from "@/lib/useDeliveryEstimate";
import { lineChargeableWeightKg } from "@/lib/shipping";

const VIEWS = ["Front", "Side", "Top", "Scale with hand"];

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const params = useSearchParams();
  const { addLine, openDrawer } = useCart(
    useShallow((state) => ({ addLine: state.addLine, openDrawer: state.openDrawer })),
  );
  const wished = useWishlist((state) => state.slugs.includes(product.slug));
  const toggle = useWishlist((state) => state.toggle);
  const [view, setView] = useState(0);
  const hasImages = (product.imageKeys?.length ?? 0) > 0;
  const hasVideo = !!product.videoKey;
  const [activeMedia, setActiveMedia] = useState<number | "video">(hasImages ? 0 : "video");
  const [qty, setQty] = useState(1);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const delivery = useDeliveryEstimate();
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notified, setNotified] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    api.categories.get(product.category).then(({ category }: { category: Category }) => setCategory(category));
  }, [product.category]);

  const colorParam = params.get("color");
  const color = product.colors.some((c) => c.name === colorParam) ? colorParam! : product.colors[0].name;
  const size = "Small";

  const isOOS = product.availability === "out-of-stock" || (product.stock !== undefined && product.stock <= 0);
  const isUnavailableCombo =
    product.unavailableCombo && product.unavailableCombo.color === color && product.unavailableCombo.size === size;

  const price = product.price;

  function setVariant(next: { color?: string }) {
    const sp = new URLSearchParams(params.toString());
    if (next.color) sp.set("color", next.color);
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
      availability: product.availability,
      weightKg: product.weightKg,
      lengthCm: product.lengthCm,
      breadthCm: product.breadthCm,
      heightCm: product.heightCm,
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
      const weightKg = lineChargeableWeightKg({
        qty,
        weightKg: product.weightKg,
        lengthCm: product.lengthCm,
        breadthCm: product.breadthCm,
        heightCm: product.heightCm,
      });
      delivery.check(pin, weightKg);
    } else {
      setPinError("Enter a valid 6-digit PIN code.");
    }
  }

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
        <div className="md:sticky md:top-24 md:self-start">
          {activeMedia === "video" && hasVideo ? (
            <video
              src={assetUrl(product.videoKey!)}
              controls
              muted
              playsInline
              className="aspect-square w-full rounded-panel bg-black object-contain"
            />
          ) : hasImages ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={assetUrl(product.imageKeys![activeMedia as number])} alt={product.name} className="aspect-square w-full rounded-panel object-cover" />
          ) : (
            <Product3DViewer shape={product.shape} color={product.colors.find((c) => c.name === color)?.hex} view={view} className="aspect-square rounded-panel" />
          )}

          {hasImages || hasVideo ? (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.imageKeys?.map((key, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={assetUrl(key)}
                  alt=""
                  onClick={() => setActiveMedia(i)}
                  className={cx(
                    "h-16 w-16 shrink-0 cursor-pointer rounded-chip object-cover border-2",
                    activeMedia === i ? "border-accent" : "border-transparent"
                  )}
                />
              ))}
              {hasVideo && (
                <button
                  aria-label="Play product video"
                  onClick={() => setActiveMedia("video")}
                  className={cx(
                    "relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-chip border-2 bg-black",
                    activeMedia === "video" ? "border-accent" : "border-transparent"
                  )}
                >
                  <video src={assetUrl(product.videoKey!)} muted playsInline preload="metadata" className="h-full w-full object-cover opacity-70" />
                  <Play className="absolute h-5 w-5 fill-white text-white" />
                </button>
              )}
            </div>
          ) : (
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
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <AvailabilityChip status={isOOS ? "out-of-stock" : product.availability} />
            <h1 className="mt-2 text-[28px] font-bold leading-tight">{product.name}</h1>
            <PriceDisplay amount={price} size="lg" showGst className="mt-2" />
          </div>

          {!isOOS && (
            <>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Colour</h3>
                <div className="flex gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      aria-label={c.name}
                      onClick={() => setVariant({ color: c.name })}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${c.name === color ? "ring-2 ring-accent ring-offset-2" : ""}`}
                      >
                        <span className="h-8 w-8 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                      </span>
                      <span className="text-xs text-text-muted">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {isUnavailableCombo && (
                <p className="text-sm text-error-text">
                  {color} is currently unavailable. Please choose a different colour.
                </p>
              )}

              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold">Quantity</h3>
                <div className="flex items-center rounded-full border border-border-input">
                  <button className="px-3 py-1.5" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span className="w-8 text-center text-sm">{qty}</span>
                  <button className="px-3 py-1.5" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
                </div>
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
                  placeholder="Enter PIN code"
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

              <div className="hidden gap-3 md:flex">
                <Button className="flex-1" disabled={!!isUnavailableCombo} onClick={addToCart}>
                  Add to cart
                </Button>
                <Button variant="secondary" className="flex-1" disabled={!!isUnavailableCombo} onClick={buyNow}>
                  Buy now
                </Button>
                <button
                  aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={() => toggle(product.slug)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-border-input"
                >
                  <Heart className={cx("h-5 w-5", wished ? "fill-accent text-accent" : "text-text")} />
                </button>
              </div>
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

          <p className="text-sm text-text-muted">{product.description}</p>

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
          <Button className="flex-1" disabled={!!isUnavailableCombo} onClick={addToCart}>
            Add to cart
          </Button>
        </div>
      )}

      <Link href="/shop" className="sr-only">Back to shop</Link>
    </div>
  );
}
