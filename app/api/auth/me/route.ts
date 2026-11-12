import { type AuthUser, clearSessionCookieHeader, corsHeaders, getAuthKV, getUserFromRequestCookie, putUser, resolveAllowedOrigin } from "@/lib/server/auth";
import { getWorkerEnv } from "@/lib/server/kv";

function toPublicUser(user: AuthUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    avatarUrl: user.avatarUrl ?? "",
    role: user.role,
    provider: user.provider,
  };
}

export async function OPTIONS(request: Request) {
  const env = await getWorkerEnv();
  const origin = resolveAllowedOrigin(request, env);
  return new Response(null, { status: 204, headers: corsHeaders(origin, "GET, PATCH, OPTIONS") });
}

export async function GET(request: Request) {
  const env = await getWorkerEnv();
  const origin = resolveAllowedOrigin(request, env);
  const headers = corsHeaders(origin, "GET, PATCH, OPTIONS");

  const kv = await getAuthKV();
  if (!kv) {
    return Response.json({ error: "Authentication is not configured." }, { status: 503, headers });
  }

  const user = await getUserFromRequestCookie(kv, request);
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401, headers });
  }

  return Response.json({ user: toPublicUser(user) }, { headers });
}

export async function PATCH(request: Request) {
  const env = await getWorkerEnv();
  const origin = resolveAllowedOrigin(request, env);
  const headers = corsHeaders(origin, "GET, PATCH, OPTIONS");

  const kv = await getAuthKV();
  if (!kv) {
    return Response.json({ error: "Authentication is not configured." }, { status: 503, headers });
  }

  const user = await getUserFromRequestCookie(kv, request);
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401, headers });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body." }, { status: 400, headers });
  }
  const record = body as Record<string, unknown>;

  if (typeof record.name === "string" && record.name.trim()) {
    user.name = record.name.trim();
  }
  if (typeof record.phone === "string") {
    user.phone = record.phone.trim();
  }
  await putUser(kv, user);

  return Response.json({ user: toPublicUser(user) }, { headers });
}

export async function DELETE(request: Request) {
  const env = await getWorkerEnv();
  const origin = resolveAllowedOrigin(request, env);
  const headers = corsHeaders(origin, "GET, DELETE, OPTIONS");
  headers["Set-Cookie"] = clearSessionCookieHeader();
  return Response.json({ message: "Logged out." }, { headers });
}
