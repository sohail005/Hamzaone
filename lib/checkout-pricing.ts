export type ShippingMethod = "standard" | "express";

// Flat-rate fallback, used only when a real NimbusPost quote isn't available
// yet (no delivery address/pincode entered, or NimbusPost is unreachable) —
// see lib/nimbuspost.ts#checkServiceability for the real per-route cost.
const FALLBACK_SHIPPING: Record<ShippingMethod, number> = { standard: 79, express: 149 };
const FREE_STANDARD_SHIPPING_THRESHOLD = 1499;

// Coupon validity (does it exist, is it enabled, has it expired, is the minimum
// order met) is resolved against admin-managed coupons in KV — see
// lib/server/admin-store.ts#findValidCoupon and POST /api/coupons/validate.
// Shipping cost is resolved by the caller too — a real NimbusPost quote for
// the order's chargeable weight/route (lib/shipping.ts +
// lib/nimbuspost.ts#checkServiceability) when known, else the flat fallback.
// This function only does the arithmetic once both are known.
export function calculateCheckoutPricing(
  subtotal: number,
  shippingMethod: ShippingMethod,
  discount = 0,
  couponCode: string | null = null,
  realShippingCost?: number,
) {
  const safeDiscount = Math.max(0, Math.min(discount, subtotal));
  const discountedSubtotal = Math.max(0, subtotal - safeDiscount);

  const freeStandardShipping = shippingMethod === "standard" && discountedSubtotal >= FREE_STANDARD_SHIPPING_THRESHOLD;
  const shipping = freeStandardShipping
    ? 0
    : realShippingCost !== undefined
      ? Math.max(0, Math.round(realShippingCost))
      : FALLBACK_SHIPPING[shippingMethod];

  return {
    subtotal,
    discount: safeDiscount,
    couponCode: safeDiscount > 0 ? couponCode : null,
    shipping,
    total: discountedSubtotal + shipping,
  };
}
