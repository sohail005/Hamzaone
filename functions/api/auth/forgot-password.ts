import { createResetToken, json, normalizeEmail, parseJsonBody, resetTokens, users } from "./_shared";

export const onRequestOptions: PagesFunction = () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};

export const onRequestPost: PagesFunction = async ({ request }) => {
  const body = await parseJsonBody(request);
  if (!body || typeof body !== "object") {
    return json({ error: "Invalid request body." }, 400);
  }

  const record = body as Record<string, unknown>;
  const email = typeof record.email === "string" ? normalizeEmail(record.email) : "";

  if (!email) {
    return json({ error: "Email is required." }, 400);
  }

  const user = users.get(email);
  const token = user ? createResetToken(email) : null;

  if (token) {
    resetTokens.set(token, {
      email,
      expiresAt: Date.now() + 1000 * 60 * 15,
    });
  }

  return json({
    message: "If an account exists for that email address, a reset link has been sent.",
    resetToken: token ?? undefined,
  });
};
