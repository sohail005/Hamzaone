import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getAddresses, saveAddresses } from "@/lib/server/addresses";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  const patch = body as Record<string, unknown>;

  const existing = await getAddresses(kv, user.id);
  const target = existing.find((a) => a.id === id);
  if (!target) {
    return Response.json({ error: "Address not found." }, { status: 404 });
  }

  const makeDefault = patch.isDefault === true;
  const updated = existing.map((a) => {
    if (a.id !== id) {
      return makeDefault ? { ...a, isDefault: false } : a;
    }
    return {
      ...a,
      name: typeof patch.name === "string" && patch.name.trim() ? patch.name.trim() : a.name,
      line1: typeof patch.line1 === "string" && patch.line1.trim() ? patch.line1.trim() : a.line1,
      line2: typeof patch.line2 === "string" ? patch.line2.trim() : a.line2,
      landmark: typeof patch.landmark === "string" ? patch.landmark.trim() : a.landmark,
      city: typeof patch.city === "string" && patch.city.trim() ? patch.city.trim() : a.city,
      state: typeof patch.state === "string" && patch.state.trim() ? patch.state.trim() : a.state,
      pin: typeof patch.pin === "string" && /^\d{6}$/.test(patch.pin) ? patch.pin : a.pin,
      type: patch.type === "Work" || patch.type === "Home" ? patch.type : a.type,
      isDefault: makeDefault ? true : a.isDefault,
    };
  });

  await saveAddresses(kv, user.id, updated);
  return Response.json({ address: updated.find((a) => a.id === id) }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kv = await getAuthKV();
  if (!kv) {
    return Response.json({ error: "Address storage is not configured." }, { status: 503 });
  }
  const user = await getUserFromRequestCookie(kv, request);
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const existing = await getAddresses(kv, user.id);
  const target = existing.find((a) => a.id === id);
  if (!target) {
    return Response.json({ error: "Address not found." }, { status: 404 });
  }

  const remaining = existing.filter((a) => a.id !== id);
  if (target.isDefault && remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
    remaining[0] = { ...remaining[0], isDefault: true };
  }

  await saveAddresses(kv, user.id, remaining);
  return Response.json({ message: "Address removed." }, { headers: { "Cache-Control": "no-store" } });
}
