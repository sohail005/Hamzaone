"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { HomeCard } from "@/data/home";
import { ConceptRender } from "./ConceptRender";
import { formatINR, cx } from "@/lib/format";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";

const badgeStyle: Record<HomeCard["badge"], string> = {
  available: "bg-success-tint text-success-text",
  "made-to-order": "bg-mto-chip-bg text-mto-chip-text",
  "low-stock": "bg-warning-tint text-warning-text",
  new: "bg-dark text-white",
};

const badgeLabel: Record<HomeCard["badge"], string> = {
  available: "In stock",
  "made-to-order": "Made to order",
  "low-stock": "Only 3 left",
  new: "New",
};

export function HomeProductCard({ card, variant = "full" }: { card: HomeCard; variant?: "full" | "compact" }) {
  const { has, toggle } = useWishlist();
  const addLine = useCart((s) => s.addLine);
  const push = useToast((s) => s.push);
  const wished = has(card.slug);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    addLine({
      slug: card.slug,
      name: card.name,
      color: "Default",
      size: "Standard",
      price: card.price,
      qty: 1,
      availability: card.availability,
    });
    push(`Added ${card.name} to cart`);
  }

  return (
    <div className="group relative flex flex-col gap-3">
      <Link href={`/products/${card.slug}`} className="relative block">
        <ConceptRender shape={card.shape} color={card.color} className="aspect-square rounded-card" />
        <span className={cx("absolute left-3 top-3 inline-flex rounded-chip px-2.5 py-1 text-xs font-semibold", badgeStyle[card.badge])}>
          {badgeLabel[card.badge]}
        </span>
        {variant === "full" && (
          <button
            type="button"
            aria-label={wished ? `Remove ${card.name} from wishlist` : `Add ${card.name} to wishlist`}
            aria-pressed={wished}
            onClick={(e) => {
              e.preventDefault();
              toggle(card.slug);
            }}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface"
          >
            <Heart className={cx("h-[18px] w-[18px]", wished ? "fill-accent text-accent" : "text-text")} />
          </button>
        )}
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/products/${card.slug}`} className="text-[17px] font-semibold leading-tight text-text hover:text-accent-text">
            {card.name}
          </Link>
          <div className="text-sm text-text-muted">{card.meta}</div>
        </div>
        <strong className="whitespace-nowrap">{formatINR(card.price)}</strong>
      </div>
      {variant === "full" && (
        <button
          type="button"
          onClick={quickAdd}
          className="h-11 rounded-full border border-text text-sm font-semibold text-text transition-colors hover:bg-dark hover:text-white"
        >
          Choose options
        </button>
      )}
    </div>
  );
}
