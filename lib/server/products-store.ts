import { products as seedProducts, type Product } from "@/data/products";
import { type KVStore, slugify } from "./kv";

const INDEX_KEY = "products:index";

function productKey(slug: string) {
  return `product:${slug}`;
}

async function readIndex(kv: KVStore): Promise<string[]> {
  const value = await kv.get(INDEX_KEY, { type: "json" });
  return Array.isArray(value) ? (value as string[]) : [];
}

async function ensureSeeded(kv: KVStore) {
  const existing = await kv.get(INDEX_KEY, { type: "json" });
  if (Array.isArray(existing)) return;
  await Promise.all(seedProducts.map((product) => kv.put(productKey(product.slug), JSON.stringify(product))));
  await kv.put(INDEX_KEY, JSON.stringify(seedProducts.map((p) => p.slug)));
}

export async function listProducts(kv: KVStore, filter?: { category?: string; featured?: boolean }): Promise<Product[]> {
  await ensureSeeded(kv);
  const slugs = await readIndex(kv);
  const values = await Promise.all(slugs.map((slug) => kv.get(productKey(slug), { type: "json" })));
  let result = values.filter((v): v is Product => !!v);
  if (filter?.category) result = result.filter((p) => p.category === filter.category);
  if (filter?.featured) result = result.filter((p) => p.isNew === true || p.availability === "low-stock");
  return result;
}

export async function getProductBySlug(kv: KVStore, slug: string): Promise<Product | null> {
  await ensureSeeded(kv);
  const value = await kv.get(productKey(slug), { type: "json" });
  return value ? (value as Product) : null;
}

export async function createProduct(kv: KVStore, input: Omit<Product, "slug">): Promise<Product> {
  await ensureSeeded(kv);
  let slug = slugify(input.name);
  const slugs = await readIndex(kv);
  if (slugs.includes(slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;

  const product: Product = { ...input, slug };
  await kv.put(productKey(slug), JSON.stringify(product));
  await kv.put(INDEX_KEY, JSON.stringify([...slugs, slug]));
  return product;
}

export async function updateProduct(kv: KVStore, slug: string, patch: Partial<Omit<Product, "slug">>): Promise<Product | null> {
  const existing = await getProductBySlug(kv, slug);
  if (!existing) return null;
  const updated: Product = { ...existing, ...patch, slug };
  await kv.put(productKey(slug), JSON.stringify(updated));
  return updated;
}

export async function deleteProduct(kv: KVStore, slug: string): Promise<boolean> {
  const slugs = await readIndex(kv);
  if (!slugs.includes(slug)) return false;
  await kv.delete(productKey(slug));
  await kv.put(INDEX_KEY, JSON.stringify(slugs.filter((s) => s !== slug)));
  return true;
}
