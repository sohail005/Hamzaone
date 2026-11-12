import { createSessionForUser, getAuthKV, getUserByEmail, isAdminEmail, normalizeEmail, putUser, sessionCookieHeader } from "@/lib/server/auth";
import { getWorkerEnv } from "@/lib/server/kv";
import { exchangeGoogleCode, fetchGoogleProfile, GOOGLE_STATE_COOKIE } from "@/lib/server/google-auth";

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.split(";").map((p) => p.trim()).find((p) => p.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

export async function GET(request: Request) {
  const env = await getWorkerEnv();
  const clientId = typeof env.GOOGLE_CLIENT_ID === "string" ? env.GOOGLE_CLIENT_ID : "";
  const clientSecret = typeof env.GOOGLE_CLIENT_SECRET === "string" ? env.GOOGLE_CLIENT_SECRET : "";
  if (!clientId || !clientSecret) {
    return Response.json({ error: "Google sign-in is not configured." }, { status: 503 });
  }

  const kv = await getAuthKV();
  if (!kv) {
    return Response.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") ?? "";
  const [statePart, next] = state.split(":");
  const expectedState = readCookie(request, GOOGLE_STATE_COOKIE);

  const clearStateCookie = `${GOOGLE_STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;

  if (!code || !statePart || !expectedState || statePart !== expectedState) {
    return Response.json({ error: "Google sign-in failed. Please try again." }, { status: 400, headers: { "Set-Cookie": clearStateCookie } });
  }

  const tokenResponse = await exchangeGoogleCode(code, clientId, clientSecret);
  if (!tokenResponse.access_token) {
    return Response.json({ error: "Google sign-in failed. Please try again." }, { status: 400, headers: { "Set-Cookie": clearStateCookie } });
  }

  const profile = await fetchGoogleProfile(tokenResponse.access_token);
  if (!profile?.email) {
    return Response.json({ error: "Could not read your Google account's email address." }, { status: 400, headers: { "Set-Cookie": clearStateCookie } });
  }

  const email = normalizeEmail(profile.email);
  let user = await getUserByEmail(kv, email);
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      name: profile.name?.trim() || email,
      email,
      avatarUrl: profile.picture,
      passwordHash: "",
      role: isAdminEmail(env, email) ? "admin" : "customer",
      createdAt: new Date().toISOString(),
      provider: "google",
    };
    await putUser(kv, user);
  } else {
    let dirty = false;
    if (user.provider === "google" && profile.picture && user.avatarUrl !== profile.picture) {
      // Google's photo URL can change over time — keep it fresh on each sign-in.
      user.avatarUrl = profile.picture;
      dirty = true;
    }
    if (user.role !== "admin" && isAdminEmail(env, user.email)) {
      user.role = "admin";
      dirty = true;
    }
    if (dirty) await putUser(kv, user);
  }

  const token = await createSessionForUser(kv, user.id);
  const destination = next && next.startsWith("/") ? next : "/account";

  return new Response(null, {
    status: 302,
    headers: [
      ["Location", destination],
      ["Set-Cookie", sessionCookieHeader(token)],
      ["Set-Cookie", clearStateCookie],
    ],
  });
}
