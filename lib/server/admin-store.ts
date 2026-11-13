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
