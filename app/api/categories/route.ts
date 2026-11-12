import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { createCategory, getCategoryBySlug, listCategories } from "@/lib/server/categories-store";
import type { Category } from "@/data/categories";

export async function GET(request: Request) {
  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Catalog storage is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const headers = { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" };

  if (slug) {
    const category = await getCategoryBySlug(kv, slug);
    if (!category) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }
    return Response.json({ category }, { headers });
  }

  const categories = await listCategories(kv);
  return Response.json({ categories, count: categories.length }, { headers });
}

export async function POST(request: Request) {
  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Catalog storage is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as Partial<Category> | null;
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return Response.json({ error: "Name is required." }, { status: 400 });
  }

  const category = await createCategory(kv, {
    name: body.name.trim(),
    description: typeof body.description === "string" ? body.description : "",
  });
  return Response.json({ category }, { status: 201 });
}
