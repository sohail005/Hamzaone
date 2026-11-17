import { revalidateTag } from "next/cache";
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

  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  const isAdmin = user?.role === "admin";

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const featured = searchParams.get("featured") === "true";

  const products = await listProducts(kv, { category, featured, includeUnpublished: isAdmin });
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
  if (!Array.isArray(body.colors) || body.colors.length === 0) {
    return Response.json({ error: "At least one colour is required." }, { status: 400 });
  }
  if (body.colors.some((c) => /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c.name.trim()))) {
    return Response.json({ error: "Colour names must be descriptive, not a hex code." }, { status: 400 });
  }

  const product = await createProduct(kv, {
    name: body.name.trim(),
    category: typeof body.category === "string" ? body.category : "home-decor",
    price: body.price,
    availability: body.availability ?? "available",
    material: typeof body.material === "string" ? body.material : "PLA",
    colors: body.colors,
    description: typeof body.description === "string" ? body.description : "",
    shape: body.shape ?? "vase",
    imageKeys: Array.isArray(body.imageKeys) ? body.imageKeys.filter((k): k is string => typeof k === "string") : undefined,
    videoKey: typeof body.videoKey === "string" ? body.videoKey : undefined,
    isNew: body.isNew,
    published: body.published,
    largePrice: body.largePrice,
    unavailableCombo: body.unavailableCombo,
    weightKg: typeof body.weightKg === "number" && body.weightKg > 0 ? body.weightKg : undefined,
    lengthCm: typeof body.lengthCm === "number" && body.lengthCm > 0 ? body.lengthCm : undefined,
    breadthCm: typeof body.breadthCm === "number" && body.breadthCm > 0 ? body.breadthCm : undefined,
    heightCm: typeof body.heightCm === "number" && body.heightCm > 0 ? body.heightCm : undefined,
  });

  revalidateTag("products", { expire: 0 });
  return Response.json({ product }, { status: 201 });
}
