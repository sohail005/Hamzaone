import { Suspense } from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { ShopView } from "@/components/ShopView";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const { category: cat } = await api.categories.get(category);
  if (!cat) notFound();
  return (
    <Suspense>
      <ShopView categorySlug={category} />
    </Suspense>
  );
}
