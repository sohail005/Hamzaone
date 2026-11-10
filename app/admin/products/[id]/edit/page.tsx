import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { ProductForm } from "@/components/admin/ProductForm";
import { products } from "@/data/products";

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.slug }));
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { product } = await api.products.get(id);
  if (!product) notFound();
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Edit {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}
