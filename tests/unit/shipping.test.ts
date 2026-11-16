import { describe, expect, it } from "vitest";
import { cartChargeableWeightKg, lineChargeableWeightKg, volumetricWeightKg } from "@/lib/shipping";

describe("volumetricWeightKg", () => {
  it("computes L x B x H / 5000", () => {
    expect(volumetricWeightKg(20, 20, 10)).toBeCloseTo(0.8);
  });

  it("is zero when any dimension is missing", () => {
    expect(volumetricWeightKg(undefined, 20, 10)).toBe(0);
    expect(volumetricWeightKg(20, undefined, 10)).toBe(0);
    expect(volumetricWeightKg(20, 20, undefined)).toBe(0);
  });
});

describe("lineChargeableWeightKg", () => {
  it("uses actual weight when it exceeds volumetric weight", () => {
    // A small, dense keychain: 10x3x0.5cm (~0.003kg volumetric) but 0.02kg actual.
    const result = lineChargeableWeightKg({ qty: 1, weightKg: 0.02, lengthCm: 10, breadthCm: 3, heightCm: 0.5 });
    expect(result).toBeCloseTo(0.02);
  });

  it("uses volumetric weight when it exceeds actual weight", () => {
    // A large, light lampshade: light actual weight but bulky dimensions.
    const result = lineChargeableWeightKg({ qty: 1, weightKg: 0.3, lengthCm: 30, breadthCm: 30, heightCm: 30 });
    expect(result).toBeCloseTo(5.4); // 27000/5000
  });

  it("falls back to the default weight when a product has no recorded weight", () => {
    expect(lineChargeableWeightKg({ qty: 1 })).toBe(0.5);
  });

  it("scales with quantity", () => {
    const result = lineChargeableWeightKg({ qty: 3, weightKg: 0.1 });
    expect(result).toBeCloseTo(0.3);
  });
});

describe("cartChargeableWeightKg", () => {
  it("sums chargeable weight across all lines", () => {
    const result = cartChargeableWeightKg([
      { qty: 1, weightKg: 0.02, lengthCm: 10, breadthCm: 3, heightCm: 0.5 },
      { qty: 2, weightKg: 0.1 },
    ]);
    expect(result).toBeCloseTo(0.02 + 0.2);
  });

  it("returns 0 for an empty cart", () => {
    expect(cartChargeableWeightKg([])).toBe(0);
  });
});
