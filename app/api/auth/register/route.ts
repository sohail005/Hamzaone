import {
  checkRateLimit,
  corsHeaders,
  createSessionForUser,
  getAuthKV,
  getUserByEmail,
  hashPassword,
  isAdminEmail,
  normalizeEmail,
  putUser,
  resolveAllowedOrigin,
  sessionCookieHeader,
} from "@/lib/server/auth";
import { getWorkerEnv } from "@/lib/server/kv";

export async function OPTIONS(request: Request) {
  const env = await getWorkerEnv();
  const origin = resolveAllowedOrigin(request, env);
  return new Response(null, { status: 204, headers: corsHeaders(origin, "POST, OPTIONS") });
}

export async function POST(request: Request) {
  const env = await getWorkerEnv();
  const origin = resolveAllowedOrigin(request, env);
  const headers = corsHeaders(origin, "POST, OPTIONS");

  const kv = await getAuthKV();
  if (!kv) {
    return Response.json({ error: "Authentication is not configured." }, { status: 503, headers });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body." }, { status: 400, headers });
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? normalizeEmail(record.email) : "";
  const password = typeof record.password === "string" ? record.password : "";

  if (!name || !email || !password) {
    return Response.json({ error: "Name, email, and password are required." }, { status: 400, headers });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400, headers });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400, headers });
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const allowed = await checkRateLimit(kv, `register:${ip}`, 5);
  if (!allowed) {
    return Response.json({ error: "Too many registration attempts. Try again in a minute." }, { status: 429, headers });
  }

  const existing = await getUserByEmail(kv, email);
  if (existing) {
    return Response.json({ error: "An account with this email already exists." }, { status: 409, headers });
  }

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const role = isAdminEmail(env, email) ? "admin" : "customer";
  await putUser(kv, { id: userId, name, email, passwordHash, role, createdAt: new Date().toISOString(), provider: "password" });

  const token = await createSessionForUser(kv, userId);
  headers["Set-Cookie"] = sessionCookieHeader(token);

  return Response.json(
    { user: { id: userId, name, email, role }, message: "Registration successful." },
    { status: 201, headers },
  );
}
