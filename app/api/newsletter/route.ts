import { checkRateLimit, getAuthKV } from "@/lib/server/auth";
import { isRecord } from "@/lib/server/kv";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const authKv = await getAuthKV();
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  if (authKv) {
    const allowed = await checkRateLimit(authKv, `newsletter-subscribe:${ip}`, 10);
    if (!allowed) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }
  }

  const body: unknown = await request.json().catch(() => null);
  const email = isRecord(body) && typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  return Response.json({ ok: true });
}
