import { describe, expect, it } from "vitest";
import { calculateCheckoutPricing } from "@/lib/checkout-pricing";

describe("calculateCheckoutPricing", () => {
  it("charges standard shipping below the free-shipping threshold", () => {
    const result = calculateCheckoutPricing(500, "standard", null);
    expect(result.shipping).toBe(79);
    expect(result.total).toBe(579);
  });

  it("gives free standard shipping at or above the threshold", () => {
    const result = calculateCheckoutPricing(1499, "standard", null);
    expect(result.shipping).toBe(0);
    expect(result.total).toBe(1499);
  });

  it("always charges express shipping regardless of subtotal", () => {
    const result = calculateCheckoutPricing(5000, "express", null);
    expect(result.shipping).toBe(149);
  });

  it("applies the first-order coupon when the minimum is met", () => {
    const result = calculateCheckoutPricing(1000, "standard", "first100");
    expect(result.discount).toBe(100);
    expect(result.couponCode).toBe("FIRST100");
    expect(result.couponError).toBeNull();
  });

  it("rejects the first-order coupon below the minimum order", () => {
    const result = calculateCheckoutPricing(500, "standard", "FIRST100");
    expect(result.discount).toBe(0);
    expect(result.couponError).toMatch(/minimum order/i);
  });

  it("rejects unknown coupon codes", () => {
    const result = calculateCheckoutPricing(2000, "standard", "NOTREAL");
    expect(result.discount).toBe(0);
    expect(result.couponError).toBe("Invalid coupon code.");
  });

  it("never lets the discounted subtotal go negative", () => {
    const result = calculateCheckoutPricing(50, "standard", null);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });
});
