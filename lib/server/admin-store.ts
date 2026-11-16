import type { KVStore } from "./kv";

const ADMIN_RESOURCES = ["customers", "coupons", "payments", "production", "inventory"] as const;

export type AdminResource = (typeof ADMIN_RESOURCES)[number];

function resourceKey(resource: AdminResource) {
  return `admin:${resource}`;
}

async function readResource<T>(kv: KVStore, resource: AdminResource): Promise<T> {
  const existing = await kv.get(resourceKey(resource), { type: "json" });
  return (existing ?? []) as T;
}

export async function getAdminResource(kv: KVStore, resource: AdminResource) {
  return readResource(kv, resource);
}

export function isAdminResource(value: string): value is AdminResource {
  return (ADMIN_RESOURCES as readonly string[]).includes(value);
}

export async function getAllAdminResources(kv: KVStore) {
  const entries = await Promise.all(ADMIN_RESOURCES.map(async (key) => [key, await readResource(kv, key)] as const));
  return Object.fromEntries(entries) as { [K in AdminResource]: unknown[] };
}

export type StoredCoupon = {
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrder: number;
  enabled: boolean;
  expires?: string;
};

function isStoredCoupon(value: unknown): value is StoredCoupon {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.code === "string" &&
    (c.type === "flat" || c.type === "percent") &&
    typeof c.value === "number" &&
    typeof c.minOrder === "number" &&
    typeof c.enabled === "boolean" &&
    (c.expires === undefined || typeof c.expires === "string")
  );
}

export async function listCoupons(kv: KVStore): Promise<StoredCoupon[]> {
  const value = await readResource<unknown[]>(kv, "coupons");
  return Array.isArray(value) ? value.filter(isStoredCoupon) : [];
}

export async function createCoupon(
  kv: KVStore,
  input: { code: string; type: "flat" | "percent"; value: number; minOrder: number; expires?: string },
): Promise<StoredCoupon[]> {
  const coupons = await listCoupons(kv);
  const code = input.code.trim().toUpperCase();
  if (!code) throw new Error("A coupon code is required.");
  if (coupons.some((c) => c.code === code)) throw new Error("A coupon with this code already exists.");
  const next: StoredCoupon[] = [...coupons, { ...input, code, enabled: true }];
  await kv.put(resourceKey("coupons"), JSON.stringify(next));
  return next;
}

export async function updateCoupon(
  kv: KVStore,
  code: string,
  patch: Partial<Omit<StoredCoupon, "code">>,
): Promise<StoredCoupon[]> {
  const coupons = await listCoupons(kv);
  const normalizedCode = code.trim().toUpperCase();
  if (!coupons.some((c) => c.code === normalizedCode)) throw new Error("Coupon not found.");
  const next = coupons.map((c) => (c.code === normalizedCode ? { ...c, ...patch } : c));
  await kv.put(resourceKey("coupons"), JSON.stringify(next));
  return next;
}

export async function findValidCoupon(
  kv: KVStore,
  codeInput: string,
  subtotal: number,
): Promise<{ coupon: StoredCoupon | null; error: string | null }> {
  const code = codeInput.trim().toUpperCase();
  if (!code) return { coupon: null, error: null };

  const coupons = await listCoupons(kv);
  const coupon = coupons.find((c) => c.code === code);
  if (!coupon || !coupon.enabled) return { coupon: null, error: "Invalid coupon code." };
  if (coupon.expires && new Date(coupon.expires) < new Date()) {
    return { coupon: null, error: "This coupon has expired." };
  }
  if (subtotal < coupon.minOrder) {
    return { coupon: null, error: `${coupon.code} requires a minimum order of ₹${coupon.minOrder}.` };
  }
  return { coupon, error: null };
}

export type StoredInventoryItem = { slug: string; variant: string; stock: number; reserved: number; low: boolean };

function isStoredInventoryItem(value: unknown): value is StoredInventoryItem {
  if (typeof value !== "object" || value === null) return false;
  const i = value as Record<string, unknown>;
  return (
    typeof i.slug === "string" &&
    typeof i.variant === "string" &&
    typeof i.stock === "number" &&
    typeof i.reserved === "number" &&
    typeof i.low === "boolean"
  );
}

export async function listInventory(kv: KVStore): Promise<StoredInventoryItem[]> {
  const value = await readResource<unknown[]>(kv, "inventory");
  return Array.isArray(value) ? value.filter(isStoredInventoryItem) : [];
}

export async function adjustInventoryStock(
  kv: KVStore,
  slug: string,
  variant: string,
  stock: number,
): Promise<StoredInventoryItem[]> {
  const items = await listInventory(kv);
  const item = items.find((i) => i.slug === slug && i.variant === variant);
  if (!item) throw new Error("Inventory item not found.");
  if (stock < item.reserved) throw new Error(`Stock cannot go below ${item.reserved} reserved units.`);
  const next = items.map((i) => (i === item ? { ...i, stock, low: stock < 10 } : i));
  await kv.put(resourceKey("inventory"), JSON.stringify(next));
  return next;
}

export type StoredProductionCard = { id: string; label: string; stage: string; priority: string };

function isStoredProductionCard(value: unknown): value is StoredProductionCard {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.label === "string" &&
    typeof c.stage === "string" &&
    typeof c.priority === "string"
  );
}

export async function listProduction(kv: KVStore): Promise<StoredProductionCard[]> {
  const value = await readResource<unknown[]>(kv, "production");
  return Array.isArray(value) ? value.filter(isStoredProductionCard) : [];
}

export async function updateProductionStage(kv: KVStore, id: string, stage: string): Promise<StoredProductionCard[]> {
  const cards = await listProduction(kv);
  if (!cards.some((c) => c.id === id)) throw new Error("Production card not found.");
  const next = cards.map((c) => (c.id === id ? { ...c, stage } : c));
  await kv.put(resourceKey("production"), JSON.stringify(next));
  return next;
}
