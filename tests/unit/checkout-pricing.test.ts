import { describe, expect, it } from "vitest";
import { calculateCheckoutPricing } from "@/lib/checkout-pricing";

describe("calculateCheckoutPricing", () => {
  it("charges standard shipping below the free-shipping threshold", () => {
    const result = calculateCheckoutPricing(500, "standard");
    expect(result.shipping).toBe(79);
    expect(result.total).toBe(579);
  });

  it("gives free standard shipping at or above the threshold", () => {
    const result = calculateCheckoutPricing(1499, "standard");
    expect(result.shipping).toBe(0);
    expect(result.total).toBe(1499);
  });

  it("always charges express shipping regardless of subtotal", () => {
    const result = calculateCheckoutPricing(5000, "express");
    expect(result.shipping).toBe(149);
  });

  it("applies a resolved discount and echoes the coupon code", () => {
    const result = calculateCheckoutPricing(1000, "standard", 100, "FIRST100");
    expect(result.discount).toBe(100);
    expect(result.couponCode).toBe("FIRST100");
    expect(result.total).toBe(900 + result.shipping);
  });

  it("drops the coupon code when there is no discount", () => {
    const result = calculateCheckoutPricing(1000, "standard", 0, "FIRST100");
    expect(result.discount).toBe(0);
    expect(result.couponCode).toBeNull();
  });

  it("never lets the discount exceed the subtotal", () => {
    const result = calculateCheckoutPricing(50, "standard", 100, "BIG");
    expect(result.discount).toBe(50);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("ignores a negative discount", () => {
    const result = calculateCheckoutPricing(500, "standard", -50, "BAD");
    expect(result.discount).toBe(0);
    expect(result.couponCode).toBeNull();
  });

  it("uses a real courier-quoted shipping cost when provided", () => {
    const result = calculateCheckoutPricing(500, "standard", 0, null, 62.95);
    expect(result.shipping).toBe(63);
    expect(result.total).toBe(563);
  });

  it("still gives free standard shipping above the threshold even with a real quote", () => {
    const result = calculateCheckoutPricing(2000, "standard", 0, null, 110.86);
    expect(result.shipping).toBe(0);
  });

  it("never lets a real shipping quote go negative", () => {
    const result = calculateCheckoutPricing(500, "standard", 0, null, -5);
    expect(result.shipping).toBe(0);
  });
});
