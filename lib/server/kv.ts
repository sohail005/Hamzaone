export interface KVStore {
  get(key: string, options: { type: "json" }): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isKVStore(value: unknown): value is KVStore {
  return (
    isRecord(value) &&
    typeof value.get === "function" &&
    typeof value.put === "function" &&
    typeof value.delete === "function"
  );
}

export interface R2Object {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
}

export interface R2Bucket {
  put(key: string, value: ReadableStream | ArrayBuffer | Blob, options?: {
    httpMetadata?: { contentType?: string; contentEncoding?: string };
    customMetadata?: Record<string, string>;
  }): Promise<unknown>;
  get(key: string): Promise<R2Object | null>;
  delete(key: string): Promise<void>;
}

function isR2Bucket(value: unknown): value is R2Bucket {
  return isRecord(value) && typeof value.put === "function" && typeof value.get === "function";
}

export interface CloudflareEnv {
  AUTH_KV?: unknown;
  ORDERS_KV?: unknown;
  DATA_KV?: unknown;
  CUSTOM_CREATIONS_FILES?: unknown;
  CUSTOM_CREATIONS_DB?: unknown;
  ALLOWED_ORIGINS?: unknown;
  RAZORPAY_KEY_ID?: unknown;
  RAZORPAY_KEY_SECRET?: unknown;
  RAZORPAY_WEBHOOK_SECRET?: unknown;
  NIMBUSPOST_EMAIL?: unknown;
  NIMBUSPOST_PASSWORD?: unknown;
  NIMBUSPOST_PICKUP_PINCODE?: unknown;
  GOOGLE_CLIENT_ID?: unknown;
  GOOGLE_CLIENT_SECRET?: unknown;
  ADMIN_EMAILS?: unknown;
  RESEND_API_KEY?: unknown;
  RESEND_FROM_EMAIL?: unknown;
  R2_ACCOUNT_ID?: unknown;
  R2_ACCESS_KEY_ID?: unknown;
  R2_SECRET_ACCESS_KEY?: unknown;
}

export async function getWorkerEnv(): Promise<CloudflareEnv> {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext({ async: true });
  return env as CloudflareEnv;
}

export function getKV(env: CloudflareEnv, binding: "AUTH_KV" | "ORDERS_KV" | "DATA_KV"): KVStore | null {
  const store = env[binding];
  return isKVStore(store) ? store : null;
}

export function getR2(env: CloudflareEnv, binding: "CUSTOM_CREATIONS_FILES"): R2Bucket | null {
  const bucket = env[binding];
  return isR2Bucket(bucket) ? bucket : null;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
