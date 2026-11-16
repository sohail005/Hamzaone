import { checkRateLimit, getAuthKV } from "@/lib/server/auth";
import { getWorkerEnv, isRecord } from "@/lib/server/kv";
import { sendEmail } from "@/lib/server/email";
import { SUPPORT_EMAIL } from "@/data/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const authKv = await getAuthKV();
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  if (authKv) {
    const allowed = await checkRateLimit(authKv, `contact-form:${ip}`, 5);
    if (!allowed) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body)) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || name.length > 100) {
    return Response.json({ error: "Enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!message || message.length > 2000) {
    return Response.json({ error: "Enter a message up to 2000 characters." }, { status: 400 });
  }

  const env = await getWorkerEnv();
  const escapedMessage = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1A1C1F;">
      <p>New contact form message from <strong>${name}</strong> (${email}):</p>
      <p style="white-space:pre-wrap;border-left:3px solid #F97316;padding-left:12px;">${escapedMessage}</p>
    </div>
  `;
  const text = `New contact form message from ${name} (${email}):\n\n${message}`;

  const { sent } = await sendEmail(env, {
    to: SUPPORT_EMAIL,
    subject: `Contact form: ${name}`,
    html,
    text,
    replyTo: email,
  });

  if (!sent) {
    return Response.json({ error: "Could not send your message right now. Please try again or email us directly." }, { status: 503 });
  }

  return Response.json({ ok: true });
}
