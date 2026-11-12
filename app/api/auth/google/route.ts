import { getWorkerEnv } from "@/lib/server/kv";
import { GOOGLE_STATE_COOKIE, googleRedirectUri, siteOrigin } from "@/lib/server/google-auth";

export async function GET(request: Request) {
  const env = await getWorkerEnv();
  const clientId = typeof env.GOOGLE_CLIENT_ID === "string" ? env.GOOGLE_CLIENT_ID : "";
  if (!clientId || !siteOrigin()) {
    return Response.json({ error: "Google sign-in is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/account";

  const state = crypto.randomUUID();

  const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", googleRedirectUri());
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("state", `${state}:${next}`);
  authorizeUrl.searchParams.set("prompt", "select_account");

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      "Set-Cookie": `${GOOGLE_STATE_COOKIE}=${encodeURIComponent(state)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
}
