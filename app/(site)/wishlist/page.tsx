"use client";

import Link from "next/link";
import { useWishlist } from "@/store/wishlist";
import { products } from "@/data/products";
import { ConceptRender } from "@/components/ConceptRender";
import { PriceDisplay } from "@/components/PriceDisplay";
import { Button } from "@/components/Button";

export default function WishlistPage() {
  const { slugs, toggle } = useWishlist();
  const items = products.filter((p) => slugs.includes(p.slug));

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Your wishlist is empty</h1>
        <p className="text-sm text-text-muted">Save products you like to find them again easily.</p>
        <Link href="/shop"><Button>Browse products</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Your wishlist</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((p) => (
          <div key={p.slug} className="flex flex-col gap-2 rounded-card bg-surface p-3 shadow-sm">
            <Link href={`/products/${p.slug}`}>
              <ConceptRender shape={p.shape} color={p.colors[0].hex} className="aspect-square rounded-chip" />
            </Link>
            <Link href={`/products/${p.slug}`} className="text-sm font-semibold hover:text-accent-text">{p.name}</Link>
            <PriceDisplay amount={p.price} />
            <div className="flex gap-2">
              <Link href={`/products/${p.slug}`} className="flex-1">
                <Button size="sm" className="w-full">Choose options</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => toggle(p.slug)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
