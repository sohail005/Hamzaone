import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { getProductBySlug } from "@/lib/server/products-store";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const env = await getWorkerEnv();
  const dataKv = getKV(env, "DATA_KV");
  const product = dataKv ? await getProductBySlug(dataKv, id) : null;
  if (!product) notFound();
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Edit {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}
