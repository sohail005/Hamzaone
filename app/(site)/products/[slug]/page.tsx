import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct } from "@/data/products";
import { ProductDetail } from "@/components/ProductDetail";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return (
    <Suspense>
      <ProductDetail product={product} />
    </Suspense>
  );
}
