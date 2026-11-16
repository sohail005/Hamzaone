import { type KVStore } from "./kv";

const SETTINGS_KEY = "settings:custom-creation-categories";

export type CustomCreationCategoryOverride = {
  imageKey?: string;
  enabled?: boolean;
};

export type CustomCreationCategoryOverrides = Record<string, CustomCreationCategoryOverride>;

export async function getCustomCreationCategoryOverrides(kv: KVStore): Promise<CustomCreationCategoryOverrides> {
  const value = await kv.get(SETTINGS_KEY, { type: "json" });
  return value && typeof value === "object" ? (value as CustomCreationCategoryOverrides) : {};
}

export async function updateCustomCreationCategoryOverride(
  kv: KVStore,
  slug: string,
  patch: { imageKey?: string | null; enabled?: boolean },
): Promise<CustomCreationCategoryOverrides> {
  const existing = await getCustomCreationCategoryOverrides(kv);
  const current = existing[slug] ?? {};
  const next: CustomCreationCategoryOverride = { ...current };

  if (patch.imageKey === null) delete next.imageKey;
  else if (patch.imageKey !== undefined) next.imageKey = patch.imageKey;

  if (patch.enabled !== undefined) next.enabled = patch.enabled;

  const updated: CustomCreationCategoryOverrides = { ...existing, [slug]: next };
  await kv.put(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}
