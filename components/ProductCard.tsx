"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/data/products";
import { ConceptRender } from "./ConceptRender";
import { AvailabilityChip } from "./StatusChip";
import { PriceDisplay } from "./PriceDisplay";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { cx } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const addLine = useCart((s) => s.addLine);
  const push = useToast((s) => s.push);
  const wished = has(product.slug);
  const isOOS = product.availability === "out-of-stock";

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (isOOS) return;
    addLine({
      slug: product.slug,
      name: product.name,
      color: product.colors[0].name,
      size: "Standard",
      price: product.price,
      qty: 1,
      availability: product.availability,
    });
    push(`Added ${product.name} to cart`);
  }

  return (
    <div className="group relative flex flex-col gap-3">
      <Link href={`/products/${product.slug}`} className="relative block">
        <ConceptRender shape={product.shape} color={product.colors[0].hex} className="aspect-square rounded-card" />
        <AvailabilityChip status={product.availability} className="absolute left-3 top-3" />
        <button
          type="button"
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wished}
          onClick={(e) => {
            e.preventDefault();
            toggle(product.slug);
          }}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface"
        >
          <Heart className={cx("h-[18px] w-[18px]", wished ? "fill-accent text-accent" : "text-text")} />
        </button>
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/products/${product.slug}`} className="text-[17px] font-semibold leading-tight text-text hover:text-accent-text">
            {product.name}
          </Link>
          <div className="text-sm text-text-muted">{product.material} · {product.colors.length} colours</div>
        </div>
        <PriceDisplay amount={product.price} />
      </div>
      <button
        type="button"
        onClick={quickAdd}
        disabled={isOOS}
        className="h-11 rounded-full border border-text text-sm font-semibold text-text transition-colors hover:bg-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isOOS ? "Notify me when back" : "Choose options"}
      </button>
    </div>
  );
}
