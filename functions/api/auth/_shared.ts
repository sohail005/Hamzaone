export type AuthUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type AuthSession = {
  userId: string;
  expiresAt: number;
};

export type ResetToken = {
  email: string;
  expiresAt: number;
};

export const users = new Map<string, AuthUser>();
export const sessions = new Map<string, AuthSession>();
export const resetTokens = new Map<string, ResetToken>();

export function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function createSessionForUser(userId: string) {
  const token = crypto.randomUUID();
  sessions.set(token, {
    userId,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });
  return token;
}

export function getUserFromRequest(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  const user = [...users.values()].find((entry) => entry.id === session.userId);
  if (!user) {
    sessions.delete(token);
    return null;
  }

  return user;
}

export function createResetToken(email: string) {
  const token = crypto.randomUUID();
  resetTokens.set(token, {
    email,
    expiresAt: Date.now() + 1000 * 60 * 15,
  });
  return token;
}
