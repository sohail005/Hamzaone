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
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? normalizeEmail(record.email) : "";
  const password = typeof record.password === "string" ? record.password : "";

  if (!name || !email || !password) {
    return json({ error: "Name, email, and password are required." }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Enter a valid email address." }, 400);
  }

  if (password.length < 8) {
    return json({ error: "Password must be at least 8 characters." }, 400);
  }

  if (users.has(email)) {
    return json({ error: "An account with this email already exists." }, 409);
  }

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  users.set(email, {
    id: userId,
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  const token = createSessionForUser(userId);
  return json({
    user: { id: userId, name, email },
    token,
    message: "Registration successful.",
  }, 201);
};
