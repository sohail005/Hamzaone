import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchProducts, fetchCategories } from "@/lib/server/catalog";
import { ShopView } from "@/components/ShopView";

export const revalidate = 60;

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
