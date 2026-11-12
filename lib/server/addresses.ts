import { isRecord, type KVStore } from "./kv";

export type StoredAddress = {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pin: string;
  type: "Home" | "Work";
  isDefault: boolean;
};

function addressesKey(userId: string) {
  return `addresses:${userId}`;
}

export async function getAddresses(kv: KVStore, userId: string): Promise<StoredAddress[]> {
  const value = await kv.get(addressesKey(userId), { type: "json" });
  return Array.isArray(value) ? (value as StoredAddress[]) : [];
}

export async function saveAddresses(kv: KVStore, userId: string, addresses: StoredAddress[]) {
  await kv.put(addressesKey(userId), JSON.stringify(addresses));
}

export function isValidAddressInput(record: Record<string, unknown>): boolean {
  return Boolean(
    typeof record.name === "string" && record.name.trim() &&
    typeof record.line1 === "string" && record.line1.trim() &&
    typeof record.city === "string" && record.city.trim() &&
    typeof record.state === "string" && record.state.trim() &&
    typeof record.pin === "string" && /^\d{6}$/.test(record.pin),
  );
}

export function isRecordInput(value: unknown): value is Record<string, unknown> {
  return isRecord(value);
}
