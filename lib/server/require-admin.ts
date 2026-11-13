import { getAuthKV, getUserFromRequestCookie, type AuthUser } from "./auth";

export async function requireAdmin(request: Request): Promise<AuthUser | Response> {
  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  return user;
}
