import { cookies } from "next/headers";
import { type CloudflareEnv, getKV, getWorkerEnv, isRecord, type KVStore } from "./kv";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  passwordHash: string;
  role: "customer" | "admin";
  createdAt: string;
  provider: "password" | "google";
};

export type AuthSession = {
  userId: string;
  expiresAt: number;
};

export type ResetToken = {
  email: string;
  expiresAt: number;
};

export const SESSION_COOKIE = "hamzaone_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const RESET_TTL_SECONDS = 60 * 15;
const RATE_LIMIT_WINDOW_SECONDS = 60;

function userKey(email: string) {
  return `user:${email}`;
}
function userIdIndexKey(id: string) {
  return `user-id:${id}`;
}
function sessionKey(token: string) {
  return `session:${token}`;
}
function resetKey(token: string) {
  return `reset:${token}`;
}

export async function getAuthKV(): Promise<KVStore | null> {
  const env = await getWorkerEnv();
  return getKV(env, "AUTH_KV");
}

export function isAdminEmail(env: CloudflareEnv, email: string) {
  const configured = typeof env.ADMIN_EMAILS === "string" ? env.ADMIN_EMAILS : "";
  const allowlist = configured.split(",").map((e) => normalizeEmail(e)).filter(Boolean);
  return allowlist.includes(normalizeEmail(email));
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function derivePbkdf2(password: string, salt: Uint8Array, iterations = 100_000) {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.slice().buffer, iterations, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePbkdf2(password, salt);
  return `${toHex(salt)}:${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = fromHex(hashHex);
  const actual = await derivePbkdf2(password, fromHex(saltHex));
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

export async function getUserByEmail(kv: KVStore, email: string): Promise<AuthUser | null> {
  const value = await kv.get(userKey(email), { type: "json" });
  return isRecord(value) ? (value as AuthUser) : null;
}

export async function getUserById(kv: KVStore, id: string): Promise<AuthUser | null> {
  const email = await kv.get(userIdIndexKey(id), { type: "json" });
  if (typeof email !== "string") return null;
  return getUserByEmail(kv, email);
}

export async function putUser(kv: KVStore, user: AuthUser) {
  await kv.put(userKey(user.email), JSON.stringify(user));
  await kv.put(userIdIndexKey(user.id), JSON.stringify(user.email));
}

export async function createSessionForUser(kv: KVStore, userId: string) {
  const token = crypto.randomUUID();
  const session: AuthSession = { userId, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 };
  await kv.put(sessionKey(token), JSON.stringify(session), { expirationTtl: SESSION_TTL_SECONDS });
  return token;
}

async function getUserForSessionToken(kv: KVStore, token: string): Promise<AuthUser | null> {
  const sessionValue = await kv.get(sessionKey(token), { type: "json" });
  if (!isRecord(sessionValue)) return null;
  const session = sessionValue as AuthSession;
  if (session.expiresAt < Date.now()) {
    await kv.delete(sessionKey(token));
    return null;
  }
  return getUserById(kv, session.userId);
}

// Server Components can only read cookies, not set them — this is the read path
// used for ownership checks on pages like /account/orders/[id].
export async function getCurrentUser(): Promise<AuthUser | null> {
  const kv = await getAuthKV();
  if (!kv) return null;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getUserForSessionToken(kv, token);
}

// Route Handlers read the Cookie header directly off the Request.
export async function getUserFromRequestCookie(kv: KVStore, request: Request): Promise<AuthUser | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.split(";").map((p) => p.trim()).find((p) => p.startsWith(`${SESSION_COOKIE}=`));
  const token = match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : "";
  if (!token) return null;
  return getUserForSessionToken(kv, token);
}

export function sessionCookieHeader(token: string) {
  const maxAge = SESSION_TTL_SECONDS;
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function createResetToken(kv: KVStore, email: string) {
  const token = crypto.randomUUID();
  const reset: ResetToken = { email, expiresAt: Date.now() + RESET_TTL_SECONDS * 1000 };
  await kv.put(resetKey(token), JSON.stringify(reset), { expirationTtl: RESET_TTL_SECONDS });
  return token;
}

export async function getResetToken(kv: KVStore, token: string): Promise<ResetToken | null> {
  const value = await kv.get(resetKey(token), { type: "json" });
  return isRecord(value) ? (value as ResetToken) : null;
}

export async function deleteResetToken(kv: KVStore, token: string) {
  await kv.delete(resetKey(token));
}

export async function checkRateLimit(kv: KVStore, bucket: string, max: number) {
  const key = `ratelimit:${bucket}`;
  const value = await kv.get(key, { type: "json" });
  const count = isRecord(value) && typeof value.count === "number" ? value.count : 0;
  if (count >= max) return false;
  await kv.put(key, JSON.stringify({ count: count + 1 }), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  return true;
}

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:8788"];

export function resolveAllowedOrigin(request: Request, env: { ALLOWED_ORIGINS?: unknown }): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  const configured = typeof env.ALLOWED_ORIGINS === "string" ? env.ALLOWED_ORIGINS : "";
  const allowlist = [...DEFAULT_ALLOWED_ORIGINS, ...configured.split(",").map((s) => s.trim()).filter(Boolean)];
  return allowlist.includes(origin) ? origin : null;
}

export function corsHeaders(origin: string | null, methods: string) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Vary"] = "Origin";
  }
  return headers;
}
