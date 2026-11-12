import { isRecord } from "./kv";

type RazorpayEnvironment = {
  RAZORPAY_KEY_ID?: unknown;
  RAZORPAY_KEY_SECRET?: unknown;
};

type RazorpayCredentialsResult =
  | { ok: true; keyId: string; keySecret: string; authorization: string }
  | { ok: false; error: string };

export function getRazorpayCredentials(env: RazorpayEnvironment): RazorpayCredentialsResult {
  const keyId = typeof env.RAZORPAY_KEY_ID === "string" ? env.RAZORPAY_KEY_ID.trim() : "";
  const keySecret = typeof env.RAZORPAY_KEY_SECRET === "string" ? env.RAZORPAY_KEY_SECRET.trim() : "";

  if (!keyId || !keySecret) {
    return { ok: false, error: "Razorpay test credentials are not configured." };
  }
  if (!keyId.startsWith("rzp_test_")) {
    return { ok: false, error: "Only Razorpay test-mode keys are accepted." };
  }

  return { ok: true, keyId, keySecret, authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}` };
}

export { isRecord };

export function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function readJson(response: Response): Promise<Record<string, unknown> | null> {
  const value: unknown = await response.json().catch(() => null);
  return isRecord(value) ? value : null;
}
