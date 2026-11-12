import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { getProductBySlug, updateProduct } from "@/lib/server/products-store";
import type { Product } from "@/data/products";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Catalog storage is not configured." }, { status: 503 });
  }

  const product = await getProductBySlug(kv, slug);
  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }
  return Response.json(
    { product },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  const patch = (await request.json().catch(() => null)) as Partial<Product> | null;
  if (!patch) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const product = await updateProduct(kv, slug, patch);
  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }
  return Response.json({ product });
}
