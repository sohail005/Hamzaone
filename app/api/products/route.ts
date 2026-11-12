import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { createProduct, listProducts } from "@/lib/server/products-store";
import type { Product } from "@/data/products";

export async function GET(request: Request) {
  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Catalog storage is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const featured = searchParams.get("featured") === "true";

  const products = await listProducts(kv, { category, featured });
  return Response.json(
    { products, count: products.length },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
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

  const body = await request.json().catch(() => null) as Partial<Product> | null;
  if (!body || typeof body.name !== "string" || !body.name.trim() || typeof body.price !== "number" || body.price <= 0) {
    return Response.json({ error: "Name and a positive price are required." }, { status: 400 });
  }

  const product = await createProduct(kv, {
    name: body.name.trim(),
    category: typeof body.category === "string" ? body.category : "home-decor",
    price: body.price,
    availability: body.availability ?? "available",
    material: typeof body.material === "string" ? body.material : "PLA",
    colors: Array.isArray(body.colors) ? body.colors : [],
    description: typeof body.description === "string" ? body.description : "",
    shape: body.shape ?? "vase",
    isNew: body.isNew,
    largePrice: body.largePrice,
    unavailableCombo: body.unavailableCombo,
  });

  return Response.json({ product }, { status: 201 });
}
