import { createSessionForUser, hashPassword, json, normalizeEmail, parseJsonBody, users } from "./_shared";

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
  const password = typeof record.password === "string" ? record.password : "";

  if (!email || !password) {
    return json({ error: "Email and password are required." }, 400);
  }

  const user = users.get(email);
  if (!user) {
    return json({ error: "Invalid email or password." }, 401);
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return json({ error: "Invalid email or password." }, 401);
  }

  const token = createSessionForUser(user.id);
  return json({
    user: { id: user.id, name: user.name, email: user.email },
    token,
    message: "Login successful.",
  });
};
