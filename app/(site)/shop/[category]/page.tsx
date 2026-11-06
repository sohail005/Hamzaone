import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategory } from "@/data/categories";
import { ShopView } from "@/components/ShopView";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!getCategory(category)) notFound();
  return (
    <Suspense>
      <ShopView categorySlug={category} />
    </Suspense>
  );
}
