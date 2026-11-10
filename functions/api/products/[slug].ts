import { getProduct } from "../../../data/products";

export const onRequestGet: PagesFunction = async (context) => {
  const slug = context.params.slug as string;
  const product = getProduct(slug);
  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }
  return Response.json({ product });
};
