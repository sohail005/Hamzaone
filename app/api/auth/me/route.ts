import { clearSessionCookieHeader, corsHeaders, getAuthKV, getUserFromRequestCookie, resolveAllowedOrigin } from "@/lib/server/auth";
import { getWorkerEnv } from "@/lib/server/kv";

export async function OPTIONS(request: Request) {
  const env = await getWorkerEnv();
  const origin = resolveAllowedOrigin(request, env);
  return new Response(null, { status: 204, headers: corsHeaders(origin, "GET, OPTIONS") });
}

export async function GET(request: Request) {
  const env = await getWorkerEnv();
  const origin = resolveAllowedOrigin(request, env);
  const headers = corsHeaders(origin, "GET, OPTIONS");

  const kv = await getAuthKV();
  if (!kv) {
    return Response.json({ error: "Authentication is not configured." }, { status: 503, headers });
  }

  const user = await getUserFromRequestCookie(kv, request);
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401, headers });
  }

  return Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { headers });
}

export async function DELETE(request: Request) {
  const env = await getWorkerEnv();
  const origin = resolveAllowedOrigin(request, env);
  const headers = corsHeaders(origin, "GET, DELETE, OPTIONS");
  headers["Set-Cookie"] = clearSessionCookieHeader();
  return Response.json({ message: "Logged out." }, { headers });
}
