import { requireAdmin } from "@/lib/server/require-admin";
import { addAdminToIndex, getAuthKV, getUserByEmail, hashPassword, listAdminUsers, normalizeEmail, putUser } from "@/lib/server/auth";

export async function GET(request: Request) {
  const result = await requireAdmin(request);
  if (result instanceof Response) return result;

  try {
    const kv = await getAuthKV();
    if (!kv) return Response.json({ error: "Authentication is not configured." }, { status: 503 });

    const admins = await listAdminUsers(kv);
    return Response.json({ admins });
  } catch (error) {
    console.error("Listing admin users failed.", error);
    return Response.json({ error: "Could not load admin users." }, { status: 500 });
  }
}

// The only way to create an admin account — self-registration and login can
// never grant this role (see app/api/auth/register and /login), since an
// unverified email match used to be enough to claim it. The creating admin
// chooses the password here and shares it with the new admin out of band.
export async function POST(request: Request) {
  const result = await requireAdmin(request);
  if (result instanceof Response) return result;

  const kv = await getAuthKV();
  if (!kv) return Response.json({ error: "Authentication is not configured." }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? normalizeEmail(record.email) : "";
  const password = typeof record.password === "string" ? record.password : "";

  if (!name || !email || !password) {
    return Response.json({ error: "Name, email, and password are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const existing = await getUserByEmail(kv, email);
    if (existing) {
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const passwordHash = await hashPassword(password);
    await putUser(kv, { id, name, email, passwordHash, role: "admin", createdAt, provider: "password" });
    await addAdminToIndex(kv, { id, name, email, createdAt });

    return Response.json({ admin: { id, name, email, createdAt } }, { status: 201 });
  } catch (error) {
    console.error("Creating admin user failed.", error);
    return Response.json({ error: "Could not create the admin account." }, { status: 500 });
  }
}
