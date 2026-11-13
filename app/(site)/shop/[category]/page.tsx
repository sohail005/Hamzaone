import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchCategory, fetchProducts, fetchCategories } from "@/lib/server/catalog";
import { ShopView } from "@/components/ShopView";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = await fetchCategory(category);
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.description,
    alternates: { canonical: `/shop/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const [cat, products, categories] = await Promise.all([
    fetchCategory(category),
    fetchProducts(),
    fetchCategories(),
  ]);
  if (!cat) notFound();
  return (
    <Suspense>
      <ShopView categorySlug={category} initialProducts={products} initialCategories={categories} />
    </Suspense>
  );
}
