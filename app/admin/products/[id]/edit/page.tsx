import { notFound } from "next/navigation";
import { getProduct } from "@/data/products";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Edit {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}
