import { beforeEach, describe, expect, it } from "vitest";
import { useCart, cartTotals, type CartLine } from "@/store/cart";

function baseLine(overrides: Partial<Omit<CartLine, "id">> = {}) {
  return {
    slug: "spiral-decor-vase",
    name: "Spiral Decor Vase",
    color: "Terracotta",
    size: "Small",
    price: 699,
    qty: 1,
    availability: "available" as const,
    ...overrides,
  };
}

describe("cart store", () => {
  beforeEach(() => {
    useCart.setState({ lines: [], couponCode: null, drawerOpen: false });
  });

  it("adds a new line", () => {
    useCart.getState().addLine(baseLine());
    expect(useCart.getState().lines).toHaveLength(1);
    expect(useCart.getState().lines[0].qty).toBe(1);
  });

  it("merges quantity when the same slug/color/size is added again", () => {
    useCart.getState().addLine(baseLine());
    useCart.getState().addLine(baseLine({ qty: 2 }));
    const { lines } = useCart.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].qty).toBe(3);
  });

  it("treats different color/size combinations as separate lines", () => {
    useCart.getState().addLine(baseLine({ color: "Terracotta" }));
    useCart.getState().addLine(baseLine({ color: "Charcoal" }));
    expect(useCart.getState().lines).toHaveLength(2);
  });

  it("clears the coupon code when the last line is removed", () => {
    useCart.getState().addLine(baseLine());
    useCart.setState({ couponCode: "FIRST100" });
    const id = useCart.getState().lines[0].id;
    useCart.getState().removeLine(id);
    expect(useCart.getState().lines).toHaveLength(0);
    expect(useCart.getState().couponCode).toBeNull();
  });
});

describe("cartTotals", () => {
  it("excludes out-of-stock lines from the subtotal", () => {
    const lines = [
      { ...baseLine(), id: "a", availability: "available" as const },
      { ...baseLine(), id: "b", price: 300, availability: "out-of-stock" as const },
    ];
    const { subtotal } = cartTotals(lines);
    expect(subtotal).toBe(699);
  });

  it("adds the engraving surcharge per unit", () => {
    const lines = [{ ...baseLine(), id: "a", qty: 2, engraving: "ABC" }];
    const { subtotal } = cartTotals(lines);
    expect(subtotal).toBe((699 + 99) * 2);
  });
});
