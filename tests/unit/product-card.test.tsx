import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/store/wishlist";
import type { Product } from "@/data/products";

const product: Product = {
  slug: "test-vase",
  name: "Test Vase",
  category: "home-decor",
  price: 699,
  availability: "available",
  material: "PLA",
  colors: [{ name: "Terracotta", hex: "#C2693C" }],
  description: "A test product.",
  shape: "vase",
};

describe("ProductCard", () => {
  beforeEach(() => {
    useWishlist.setState({ slugs: [] });
  });

  it("toggles wishlist state when the heart button is clicked", () => {
    render(<ProductCard product={product} />);
    const button = screen.getByRole("button", { name: /add test vase to wishlist/i });

    fireEvent.click(button);
    expect(useWishlist.getState().slugs).toContain("test-vase");

    fireEvent.click(screen.getByRole("button", { name: /remove test vase from wishlist/i }));
    expect(useWishlist.getState().slugs).not.toContain("test-vase");
  });

  it("shows a disabled notify button for out-of-stock products", () => {
    render(<ProductCard product={{ ...product, availability: "out-of-stock" }} />);
    expect(screen.getByRole("button", { name: /notify me when back/i })).toBeDisabled();
  });
});
