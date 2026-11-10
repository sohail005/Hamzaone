import { getProduct } from "../../../data/products";

export const onRequestGet: PagesFunction = async (context) => {
  const slug = context.params.slug as string;
  const product = getProduct(slug);
  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
  }
  return Response.json({ product }, { headers: { "Access-Control-Allow-Origin": "*" } });
};
