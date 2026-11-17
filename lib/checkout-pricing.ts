export type ShippingMethod = "standard" | "express";

// Flat-rate fallback, used only when a real Skyfleet quote isn't available
// yet (no delivery address/pincode entered, or Skyfleet is unreachable) —
// see lib/skyfleet.ts#checkServiceability for the real per-route cost.
export const FALLBACK_SHIPPING: Record<ShippingMethod, number> = { standard: 79, express: 149 };
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 1499;

// Coupon validity (does it exist, is it enabled, has it expired, is the minimum
// order met) is resolved against admin-managed coupons in KV — see
// lib/server/admin-store.ts#findValidCoupon and POST /api/coupons/validate.
// Shipping cost is resolved by the caller too — a real Skyfleet quote for
// the order's chargeable weight/route (lib/shipping.ts +
// lib/skyfleet.ts#checkServiceability) when known, else the flat fallback.
// This function only does the arithmetic once both are known.
export function calculateCheckoutPricing(
  subtotal: number,
  shippingMethod: ShippingMethod,
  discount = 0,
  couponCode: string | null = null,
  realShippingCost?: number,
  fallbackRates: Record<ShippingMethod, number> = FALLBACK_SHIPPING,
  freeShippingThreshold: number = DEFAULT_FREE_SHIPPING_THRESHOLD,
) {
  const safeDiscount = Math.max(0, Math.min(discount, subtotal));
  const discountedSubtotal = Math.max(0, subtotal - safeDiscount);

  const freeStandardShipping = shippingMethod === "standard" && discountedSubtotal >= freeShippingThreshold;
  const shipping = freeStandardShipping
    ? 0
    : realShippingCost !== undefined
      ? Math.max(0, Math.round(realShippingCost))
      : fallbackRates[shippingMethod];

  return {
    subtotal,
    discount: safeDiscount,
    couponCode: safeDiscount > 0 ? couponCode : null,
    shipping,
    total: discountedSubtotal + shipping,
  };
}
