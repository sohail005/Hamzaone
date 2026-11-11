import { hashPassword, json, parseJsonBody, resetTokens, users } from "./_shared";

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
  const token = typeof record.token === "string" ? record.token : "";
  const password = typeof record.password === "string" ? record.password : "";

  if (!token || !password) {
    return json({ error: "Reset token and new password are required." }, 400);
  }

  if (password.length < 8) {
    return json({ error: "Password must be at least 8 characters." }, 400);
  }

  const reset = resetTokens.get(token);
  if (!reset || reset.expiresAt < Date.now()) {
    resetTokens.delete(token);
    return json({ error: "This reset link is invalid or has expired." }, 400);
  }

  const user = users.get(reset.email);
  if (!user) {
    resetTokens.delete(token);
    return json({ error: "This reset link is invalid or has expired." }, 400);
  }

  user.passwordHash = await hashPassword(password);
  resetTokens.delete(token);

  return json({
    message: "Password reset successful.",
  });
};
