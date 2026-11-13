import { categories as seedCategories, type Category } from "@/data/categories";
import { type KVStore, slugify } from "./kv";

const INDEX_KEY = "categories:index";

function categoryKey(slug: string) {
  return `category:${slug}`;
}

async function readIndex(kv: KVStore): Promise<string[]> {
  const value = await kv.get(INDEX_KEY, { type: "json" });
  return Array.isArray(value) ? (value as string[]) : [];
}

async function ensureSeeded(kv: KVStore) {
  const existing = await kv.get(INDEX_KEY, { type: "json" });
  if (Array.isArray(existing)) return;
  await Promise.all(seedCategories.map((category) => kv.put(categoryKey(category.slug), JSON.stringify(category))));
  await kv.put(INDEX_KEY, JSON.stringify(seedCategories.map((c) => c.slug)));
}

export async function listCategories(kv: KVStore, opts?: { includeDisabled?: boolean }): Promise<Category[]> {
  await ensureSeeded(kv);
  const slugs = await readIndex(kv);
  const values = await Promise.all(slugs.map((slug) => kv.get(categoryKey(slug), { type: "json" })));
  const categories = values.filter((v): v is Category => !!v);
  if (opts?.includeDisabled) return categories;
  return categories.filter((c) => c.enabled !== false);
}

export async function getCategoryBySlug(kv: KVStore, slug: string): Promise<Category | null> {
  await ensureSeeded(kv);
  const value = await kv.get(categoryKey(slug), { type: "json" });
  return value ? (value as Category) : null;
}

export async function createCategory(kv: KVStore, input: Omit<Category, "slug">): Promise<Category> {
  await ensureSeeded(kv);
  let slug = slugify(input.name);
  const slugs = await readIndex(kv);
  if (slugs.includes(slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;

  const category: Category = { enabled: true, ...input, slug };
  await kv.put(categoryKey(slug), JSON.stringify(category));
  await kv.put(INDEX_KEY, JSON.stringify([...slugs, slug]));
  return category;
}

export async function updateCategory(kv: KVStore, slug: string, patch: Partial<Omit<Category, "slug">>): Promise<Category | null> {
  const existing = await getCategoryBySlug(kv, slug);
  if (!existing) return null;
  const updated: Category = { ...existing, ...patch, slug };
  await kv.put(categoryKey(slug), JSON.stringify(updated));
  return updated;
}
