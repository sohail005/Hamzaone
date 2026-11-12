import { Suspense } from "react";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { ShopView } from "@/components/ShopView";

export const metadata: Metadata = {
  title: "Shop",
  description: "Ready-made 3D printed home decor, desk accessories, personalised gifts and figurines.",
};

export default async function ShopPage() {
  const [{ products }, { categories }] = await Promise.all([api.products.list(), api.categories.list()]);
  return (
    <Suspense>
      <ShopView initialProducts={products} initialCategories={categories} />
    </Suspense>
  );
}
