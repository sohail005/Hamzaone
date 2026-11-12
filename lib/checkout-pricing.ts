export type ShippingMethod = "standard" | "express";

const FIRST_ORDER_COUPON = "FIRST100";
const FIRST_ORDER_DISCOUNT = 100;
const FIRST_ORDER_MINIMUM = 999;

export function calculateCheckoutPricing(
  subtotal: number,
  shippingMethod: ShippingMethod,
  couponCode?: string | null,
) {
  const normalizedCoupon = couponCode?.trim().toUpperCase() ?? "";
  let couponError: string | null = null;

  if (normalizedCoupon && normalizedCoupon !== FIRST_ORDER_COUPON) {
    couponError = "Invalid coupon code.";
  } else if (normalizedCoupon && subtotal < FIRST_ORDER_MINIMUM) {
    couponError = `${FIRST_ORDER_COUPON} requires a minimum order of ₹${FIRST_ORDER_MINIMUM}.`;
  }

  const discount = normalizedCoupon && !couponError ? FIRST_ORDER_DISCOUNT : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping = shippingMethod === "express" ? 149 : discountedSubtotal >= 1499 ? 0 : 79;

  return {
    subtotal,
    discount,
    couponCode: discount > 0 ? FIRST_ORDER_COUPON : null,
    couponError,
    shipping,
    total: discountedSubtotal + shipping,
  };
}
