"use client";

import Link from "next/link";
import { ShoppingCart, Heart, MapPin, ArrowRight } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { cx } from "@/lib/format";

const TILES = [
  { key: "orders", label: "Active Orders", href: "/account/orders", icon: ShoppingCart, iconBg: "bg-mto-chip-bg", iconText: "text-accent-text", arrowText: "text-accent-text" },
  { key: "wishlist", label: "Wishlist", href: "/wishlist", icon: Heart, iconBg: "bg-error-tint", iconText: "text-error-text", arrowText: "text-error-text" },
  { key: "addresses", label: "Saved Addresses", href: "/account/addresses", icon: MapPin, iconBg: "bg-success-tint", iconText: "text-success-text", arrowText: "text-success-text" },
] as const;

export function AccountStats({ ordersCount, addressesCount }: { ordersCount: number; addressesCount: number }) {
  const wishlistCount = useWishlist((s) => s.slugs.length);
  const counts: Record<(typeof TILES)[number]["key"], number> = {
    orders: ordersCount,
    wishlist: wishlistCount,
    addresses: addressesCount,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {TILES.map((tile) => {
        const Icon = tile.icon;
        return (
          <Link key={tile.key} href={tile.href} className="flex items-center gap-3 rounded-card bg-surface p-4 shadow-sm hover:shadow-md">
            <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", tile.iconBg, tile.iconText)}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-text-muted">{tile.label}</p>
              <p className="text-xl font-bold">{counts[tile.key]}</p>
            </div>
            <ArrowRight className={cx("h-4 w-4 shrink-0", tile.arrowText)} />
          </Link>
        );
      })}
    </div>
  );
}

