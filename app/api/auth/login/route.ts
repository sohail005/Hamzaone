import {
  checkRateLimit,
  createSessionForUser,
  getAuthKV,
  getUserByEmail,
  normalizeEmail,
  resolveAllowedOrigin,
  corsHeaders,
  sessionCookieHeader,
  verifyPassword,
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
  const email = typeof record.email === "string" ? normalizeEmail(record.email) : "";
  const password = typeof record.password === "string" ? record.password : "";

  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400, headers });
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const allowed = await checkRateLimit(kv, `login:${ip}:${email}`, 10);
  if (!allowed) {
    return Response.json({ error: "Too many login attempts. Try again in a minute." }, { status: 429, headers });
  }

  const user = await getUserByEmail(kv, email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return Response.json({ error: "Invalid email or password." }, { status: 401, headers });
  }

  const token = await createSessionForUser(kv, user.id);
  headers["Set-Cookie"] = sessionCookieHeader(token);

  return Response.json(
    { user: { id: user.id, name: user.name, email: user.email, role: user.role }, message: "Login successful." },
    { headers },
  );
}
