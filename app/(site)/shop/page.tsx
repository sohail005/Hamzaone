import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchProducts, fetchCategories } from "@/lib/server/catalog";
import { ShopView } from "@/components/ShopView";

// ISR (revalidate=60) doesn't reliably refresh on this OpenNext/Cloudflare
// build (see ba849f2: force-dynamic rendering for home and custom-creations
// pages) — this page hit the same bug, serving a days-stale product list.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: "Ready-made 3D printed home decor, desk accessories, personalised gifts and figurines.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);
  return (
    <Suspense>
      <ShopView initialProducts={products} initialCategories={categories} />
    </Suspense>
  );
}
