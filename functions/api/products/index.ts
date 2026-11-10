import { products } from "../../../data/products";

export const onRequestGet: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  let result = products;
  if (category) result = result.filter((p) => p.category === category);
  if (featured === "true") result = result.filter((p) => p.isNew === true || p.availability === "low-stock");

  return Response.json({ products: result, count: result.length });
};
