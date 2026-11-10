import { categories, getCategory } from "../../../data/categories";

export const onRequestGet: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const category = getCategory(slug);
    if (!category) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }
    return Response.json({ category });
  }

  return Response.json({ categories, count: categories.length });
};
