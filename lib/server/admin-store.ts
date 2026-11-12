import {
  customers as seedCustomers,
  coupons as seedCoupons,
  payments as seedPayments,
  productionCards as seedProductionCards,
  inventory as seedInventory,
  customRequests as seedCustomRequests,
} from "@/data/admin";
import type { KVStore } from "./kv";

const RESOURCE_SEEDS = {
  customers: seedCustomers,
  coupons: seedCoupons,
  payments: seedPayments,
  production: seedProductionCards,
  inventory: seedInventory,
  "custom-requests": seedCustomRequests,
} as const;

export type AdminResource = keyof typeof RESOURCE_SEEDS;

function resourceKey(resource: AdminResource) {
  return `admin:${resource}`;
}

async function readResource<T>(kv: KVStore, resource: AdminResource): Promise<T> {
  const existing = await kv.get(resourceKey(resource), { type: "json" });
  if (existing !== null && existing !== undefined) return existing as T;
  const seed = RESOURCE_SEEDS[resource];
  await kv.put(resourceKey(resource), JSON.stringify(seed));
  return seed as T;
}

export async function getAdminResource(kv: KVStore, resource: AdminResource) {
  return readResource(kv, resource);
}

export function isAdminResource(value: string): value is AdminResource {
  return value in RESOURCE_SEEDS;
}

export async function getAllAdminResources(kv: KVStore) {
  const keys = Object.keys(RESOURCE_SEEDS) as AdminResource[];
  const entries = await Promise.all(keys.map(async (key) => [key, await readResource(kv, key)] as const));
  return Object.fromEntries(entries) as { [K in AdminResource]: (typeof RESOURCE_SEEDS)[K] };
}
