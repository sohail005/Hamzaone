export const GOOGLE_STATE_COOKIE = "hamzaone_google_state";

export function siteOrigin() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/$/, "");
}

export function googleRedirectUri() {
  return `${siteOrigin()}/api/auth/google/callback`;
}

export type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  error?: string;
};

export type GoogleProfile = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export async function exchangeGoogleCode(code: string, clientId: string, clientSecret: string): Promise<GoogleTokenResponse> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  return response.json();
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile | null> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  return response.json();
}
