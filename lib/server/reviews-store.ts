import { isRecord, type KVStore } from "./kv";

export type StoredReview = {
  id: string;
  orderId: string;
  productSlug: string;
  productName: string;
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  createdAt: string;
  approved: boolean;
};

function reviewKey(id: string) {
  return `review:${id}`;
}

const INDEX_KEY = "reviews:index";

function isStoredReview(value: unknown): value is StoredReview {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.orderId === "string" &&
    typeof value.productSlug === "string" &&
    typeof value.productName === "string" &&
    typeof value.customerName === "string" &&
    typeof value.rating === "number" &&
    value.rating >= 1 &&
    value.rating <= 5 &&
    typeof value.quote === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.approved === "boolean"
  );
}

async function readIndex(kv: KVStore): Promise<string[]> {
  const value = await kv.get(INDEX_KEY, { type: "json" });
  return Array.isArray(value) ? (value as string[]) : [];
}

export async function listAllReviews(kv: KVStore): Promise<StoredReview[]> {
  const ids = await readIndex(kv);
  const values = await Promise.all(ids.map((id) => kv.get(reviewKey(id), { type: "json" })));
  return values.filter(isStoredReview).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listApprovedReviews(kv: KVStore, productSlug?: string): Promise<StoredReview[]> {
  const all = await listAllReviews(kv);
  return all.filter((r) => r.approved && (!productSlug || r.productSlug === productSlug));
}

export async function hasReviewForOrderItem(kv: KVStore, orderId: string, productSlug: string): Promise<boolean> {
  const all = await listAllReviews(kv);
  return all.some((r) => r.orderId === orderId && r.productSlug === productSlug);
}

export async function createReview(
  kv: KVStore,
  input: Omit<StoredReview, "id" | "createdAt" | "approved">,
): Promise<StoredReview> {
  const review: StoredReview = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    approved: false,
  };
  await kv.put(reviewKey(review.id), JSON.stringify(review));
  const ids = await readIndex(kv);
  await kv.put(INDEX_KEY, JSON.stringify([...ids, review.id]));
  return review;
}

export async function setReviewApproved(kv: KVStore, id: string, approved: boolean): Promise<StoredReview | null> {
  const value = await kv.get(reviewKey(id), { type: "json" });
  if (!isStoredReview(value)) return null;
  const updated: StoredReview = { ...value, approved };
  await kv.put(reviewKey(id), JSON.stringify(updated));
  return updated;
}

export async function deleteReview(kv: KVStore, id: string): Promise<boolean> {
  const ids = await readIndex(kv);
  if (!ids.includes(id)) return false;
  await kv.delete(reviewKey(id));
  await kv.put(INDEX_KEY, JSON.stringify(ids.filter((existing) => existing !== id)));
  return true;
}
