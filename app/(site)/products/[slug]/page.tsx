import { Suspense } from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { ProductDetail } from "@/components/ProductDetail";
import { products } from "@/data/products";

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { product } = await api.products.get(slug);
  if (!product) notFound();
  return (
    <Suspense>
      <ProductDetail product={product} />
    </Suspense>
  );
}
