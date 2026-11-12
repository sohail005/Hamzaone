import {
  checkRateLimit,
  corsHeaders,
  createResetToken,
  getAuthKV,
  getUserByEmail,
  normalizeEmail,
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
  const email = typeof record.email === "string" ? normalizeEmail(record.email) : "";
  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400, headers });
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const allowed = await checkRateLimit(kv, `forgot-password:${ip}:${email}`, 5);
  const generic = { message: "If an account exists for that email address, a reset link has been sent." };
  if (!allowed) {
    return Response.json(generic, { headers });
  }

  const user = await getUserByEmail(kv, email);
  if (user) {
    const token = await createResetToken(kv, email);
    // No email provider is wired up yet; log server-side only so the token
    // never reaches the HTTP response. Replace with a real transactional
    // email send (Resend/SendGrid/Cloudflare Email Workers) before launch.
    console.log(`Password reset requested for ${email}. Reset token: ${token}`);
  }

  return Response.json(generic, { headers });
}
