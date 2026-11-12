import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getAddresses, isValidAddressInput, saveAddresses, type StoredAddress } from "@/lib/server/addresses";

export async function GET(request: Request) {
  const kv = await getAuthKV();
  if (!kv) {
    return Response.json({ error: "Address storage is not configured." }, { status: 503 });
  }
  const user = await getUserFromRequestCookie(kv, request);
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const addresses = await getAddresses(kv, user.id);
  return Response.json({ addresses }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const kv = await getAuthKV();
  if (!kv) {
    return Response.json({ error: "Address storage is not configured." }, { status: 503 });
  }
  const user = await getUserFromRequestCookie(kv, request);
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  if (!isValidAddressInput(record)) {
    return Response.json({ error: "Name, address line 1, city, state, and a valid 6-digit PIN are required." }, { status: 400 });
  }

  const existing = await getAddresses(kv, user.id);
  const type = record.type === "Work" ? "Work" : "Home";
  const newAddress: StoredAddress = {
    id: crypto.randomUUID(),
    name: String(record.name).trim(),
    line1: String(record.line1).trim(),
    line2: typeof record.line2 === "string" ? record.line2.trim() : undefined,
    landmark: typeof record.landmark === "string" ? record.landmark.trim() : undefined,
    city: String(record.city).trim(),
    state: String(record.state).trim(),
    pin: String(record.pin),
    type,
    isDefault: existing.length === 0 || record.isDefault === true,
  };

  const updated = newAddress.isDefault
    ? [...existing.map((a) => ({ ...a, isDefault: false })), newAddress]
    : [...existing, newAddress];
  await saveAddresses(kv, user.id, updated);

  return Response.json({ address: newAddress }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
