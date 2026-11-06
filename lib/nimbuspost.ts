const BASE_URL = "https://api.nimbuspost.com/v1/";
const AUTH_URL = `${BASE_URL}users/login`;
const SERVICEABILITY_URL = `${BASE_URL}courier/serviceability`;

export class NimbusPostNotConfiguredError extends Error {
  constructor() {
    super("NimbusPost credentials are not configured.");
    this.name = "NimbusPostNotConfiguredError";
  }
}

export class NimbusPostApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NimbusPostApiError";
  }
}

export type ServiceabilityResult = {
  serviceable: boolean;
  minDays?: number;
  maxDays?: number;
  cod: boolean;
};

type CachedToken = { token: string; expiresAt: number };
let cachedToken: CachedToken | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new NimbusPostNotConfiguredError();
  return value;
}

function jwtExpiryMs(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

async function login(): Promise<string> {
  const email = requireEnv("NIMBUSPOST_EMAIL");
  const password = requireEnv("NIMBUSPOST_PASSWORD");

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new NimbusPostApiError(`NimbusPost login failed (${res.status}).`);
  }
  const data = (await res.json()) as { data?: string | { token?: string }; token?: string };
  const token = typeof data.data === "string" ? data.data : (data.data?.token ?? data.token);
  if (!token) {
    throw new NimbusPostApiError("NimbusPost login response did not include a token.");
  }
  // NimbusPost JWTs are short-lived (observed ~3h); read the real exp claim
  // rather than assuming, with a short fallback and a safety margin.
  const expMs = jwtExpiryMs(token);
  const expiresAt = expMs ? expMs - 5 * 60 * 1000 : Date.now() + 60 * 60 * 1000;
  cachedToken = { token, expiresAt };
  return token;
}

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  return login();
}

type Courier = {
  name?: string;
  edd?: string; // "DD-MM-YYYY"
  total_charges?: number;
  cod_charges?: number;
};

function parseEddDays(edd: string): number | null {
  const match = edd.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const eddDate = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(eddDate.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = eddDate.getTime() - today.getTime();
  return Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)));
}

function courierDays(courier: Courier): number | null {
  return courier.edd ? parseEddDays(courier.edd) : null;
}

async function callServiceability(pickupPincode: string, deliveryPincode: string, weightKg: number, token: string) {
  return fetch(SERVICEABILITY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      origin: pickupPincode,
      destination: deliveryPincode,
      payment_type: "prepaid",
      weight: weightKg,
      order_amount: 0,
    }),
  });
}

export async function checkServiceability(deliveryPincode: string, weightKg = 0.5): Promise<ServiceabilityResult> {
  const pickupPincode = requireEnv("NIMBUSPOST_PICKUP_PINCODE");

  let token = await getToken();
  let res = await callServiceability(pickupPincode, deliveryPincode, weightKg, token);

  if (res.status === 401) {
    cachedToken = null;
    token = await login();
    res = await callServiceability(pickupPincode, deliveryPincode, weightKg, token);
  }

  if (!res.ok) {
    throw new NimbusPostApiError(`NimbusPost serviceability check failed (${res.status}).`);
  }

  const data = (await res.json()) as { data?: Courier[]; status?: boolean };
  const couriers = data.data ?? [];

  if (couriers.length === 0) {
    return { serviceable: false, cod: false };
  }

  const days = couriers.map(courierDays).filter((d): d is number => d !== null);
  const cod = couriers.some((c) => (c.cod_charges ?? 0) > 0);

  return {
    serviceable: true,
    minDays: days.length ? Math.min(...days) : undefined,
    maxDays: days.length ? Math.max(...days) : undefined,
    cod,
  };
}
