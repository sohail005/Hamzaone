import {
  corsHeaders,
  deleteResetToken,
  getAuthKV,
  getResetToken,
  getUserByEmail,
  hashPassword,
  putUser,
  resolveAllowedOrigin,
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
  const token = typeof record.token === "string" ? record.token : "";
  const password = typeof record.password === "string" ? record.password : "";

  if (!token || !password) {
    return Response.json({ error: "Reset token and new password are required." }, { status: 400, headers });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400, headers });
  }

  const reset = await getResetToken(kv, token);
  if (!reset || reset.expiresAt < Date.now()) {
    await deleteResetToken(kv, token);
    return Response.json({ error: "This reset link is invalid or has expired." }, { status: 400, headers });
  }

  const user = await getUserByEmail(kv, reset.email);
  if (!user) {
    await deleteResetToken(kv, token);
    return Response.json({ error: "This reset link is invalid or has expired." }, { status: 400, headers });
  }

  user.passwordHash = await hashPassword(password);
  await putUser(kv, user);
  await deleteResetToken(kv, token);

  return Response.json({ message: "Password reset successful." }, { headers });
}
