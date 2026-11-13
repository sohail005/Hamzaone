import { type KVStore } from "./kv";

const SETTINGS_KEY = "settings:home";

export type HomeSettings = {
  heroImageKey?: string;
};

export async function getHomeSettings(kv: KVStore): Promise<HomeSettings> {
  const value = await kv.get(SETTINGS_KEY, { type: "json" });
  return value && typeof value === "object" ? (value as HomeSettings) : {};
}

export async function updateHomeSettings(kv: KVStore, patch: Partial<HomeSettings>): Promise<HomeSettings> {
  const existing = await getHomeSettings(kv);
  const updated: HomeSettings = { ...existing, ...patch };
  await kv.put(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}
