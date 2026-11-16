import { type KVStore } from "./kv";

const SETTINGS_KEY = "settings:store";

export type StoreSettings = {
  storeName?: string;
  supportEmail?: string;
  accentColor?: string;
  standardShipping?: number;
  expressShipping?: number;
  freeShippingThreshold?: number;
};

export async function getStoreSettings(kv: KVStore): Promise<StoreSettings> {
  const value = await kv.get(SETTINGS_KEY, { type: "json" });
  return value && typeof value === "object" ? (value as StoreSettings) : {};
}

export async function updateStoreSettings(kv: KVStore, patch: Partial<StoreSettings>): Promise<StoreSettings> {
  const existing = await getStoreSettings(kv);
  const updated: StoreSettings = { ...existing, ...patch };
  await kv.put(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}
