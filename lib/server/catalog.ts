import { getKV, getWorkerEnv } from "./kv";
import { listCategories, getCategoryBySlug } from "./categories-store";
import { listProducts, getProductBySlug } from "./products-store";

async function getDataKV() {
  const env = await getWorkerEnv();
  return getKV(env, "DATA_KV");
}

export async function fetchCategories() {
  const kv = await getDataKV();
  return kv ? listCategories(kv) : [];
}

export async function fetchCategory(slug: string) {
  const kv = await getDataKV();
  return kv ? getCategoryBySlug(kv, slug) : null;
}

export async function fetchProducts(filter?: { category?: string; featured?: boolean }) {
  const kv = await getDataKV();
  return kv ? listProducts(kv, filter) : [];
}

export async function fetchProduct(slug: string) {
  const kv = await getDataKV();
  return kv ? getProductBySlug(kv, slug) : null;
}
