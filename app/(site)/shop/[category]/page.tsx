import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { ShopView } from "@/components/ShopView";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const { category: cat } = await api.categories.get(category).catch(() => ({ category: null }));
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.description,
    alternates: { canonical: `/shop/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const [{ category: cat }, { products }, { categories }] = await Promise.all([
    api.categories.get(category),
    api.products.list(),
    api.categories.list(),
  ]);
  if (!cat) notFound();
  return (
    <Suspense>
      <ShopView categorySlug={category} initialProducts={products} initialCategories={categories} />
    </Suspense>
  );
}
