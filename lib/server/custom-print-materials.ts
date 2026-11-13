import type { KVStore } from "./kv";
import { materials as defaultMaterials } from "@/data/customPrint";

const STORE_KEY = "custom-print:materials";

export type MaterialOption = { name: string; enabled: boolean };
export type MaterialConfigEntry = {
  key: string;
  enabled: boolean;
  colors: MaterialOption[];
  finishes: MaterialOption[];
};
export type MaterialsConfig = { materials: MaterialConfigEntry[] };

export function defaultMaterialsConfig(): MaterialsConfig {
  return {
    materials: Object.entries(defaultMaterials).map(([key, value]) => ({
      key,
      enabled: true,
      colors: value.colors.map((name) => ({ name, enabled: true })),
      finishes: value.finishes.map((name) => ({ name, enabled: true })),
    })),
  };
}

function isMaterialOption(value: unknown): value is MaterialOption {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).name === "string" &&
    typeof (value as Record<string, unknown>).enabled === "boolean"
  );
}

function isMaterialsConfig(value: unknown): value is MaterialsConfig {
  if (typeof value !== "object" || value === null) return false;
  const materials = (value as Record<string, unknown>).materials;
  if (!Array.isArray(materials)) return false;
  return materials.every(
    (m) =>
      typeof m === "object" &&
      m !== null &&
      typeof (m as Record<string, unknown>).key === "string" &&
      typeof (m as Record<string, unknown>).enabled === "boolean" &&
      Array.isArray((m as Record<string, unknown>).colors) &&
      (m as { colors: unknown[] }).colors.every(isMaterialOption) &&
      Array.isArray((m as Record<string, unknown>).finishes) &&
      (m as { finishes: unknown[] }).finishes.every(isMaterialOption),
  );
}

export async function getMaterialsConfig(kv: KVStore): Promise<MaterialsConfig> {
  const stored = await kv.get(STORE_KEY, { type: "json" });
  if (isMaterialsConfig(stored)) return stored;
  return defaultMaterialsConfig();
}

export async function saveMaterialsConfig(kv: KVStore, config: MaterialsConfig): Promise<void> {
  await kv.put(STORE_KEY, JSON.stringify(config));
}

export function validateMaterialsConfig(value: unknown): MaterialsConfig | null {
  return isMaterialsConfig(value) ? value : null;
}

export function toPublicMaterials(config: MaterialsConfig): Record<string, { colors: string[]; finishes: string[] }> {
  const result: Record<string, { colors: string[]; finishes: string[] }> = {};
  for (const material of config.materials) {
    if (!material.enabled) continue;
    const colors = material.colors.filter((c) => c.enabled).map((c) => c.name);
    const finishes = material.finishes.filter((f) => f.enabled).map((f) => f.name);
    if (colors.length === 0 || finishes.length === 0) continue;
    result[material.key] = { colors, finishes };
  }
  return result;
}
