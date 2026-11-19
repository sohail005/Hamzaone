import { revalidatePath } from "next/cache";
import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { getStoreSettings, updateStoreSettings, type StoreSettings } from "@/lib/server/store-settings-store";

async function requireAdmin(request: Request) {
  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  return user && user.role === "admin" ? user : null;
}

export async function GET() {
  // Public: the storefront (cart/checkout shipping rates, site theming) reads
  // this too, so it can't be admin-gated the way PATCH is.
  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Settings storage is not configured." }, { status: 503 });
  }
  try {
    const settings = await getStoreSettings(kv);
    return Response.json({ settings });
  } catch (error) {
    console.error("Failed to load store settings", error);
    return Response.json({ error: "Could not load store settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await requireAdmin(request);
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Settings storage is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as Partial<StoreSettings> | null;
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const patch: Partial<StoreSettings> = {};
  if (typeof body.storeName === "string") patch.storeName = body.storeName;
  if (typeof body.supportEmail === "string") patch.supportEmail = body.supportEmail;
  if (typeof body.accentColor === "string") patch.accentColor = body.accentColor;
  if (typeof body.standardShipping === "number") patch.standardShipping = body.standardShipping;
  if (typeof body.expressShipping === "number") patch.expressShipping = body.expressShipping;
  if (typeof body.freeShippingThreshold === "number") patch.freeShippingThreshold = body.freeShippingThreshold;

  try {
    const settings = await updateStoreSettings(kv, patch);
    revalidatePath("/", "layout");
    return Response.json({ settings });
  } catch (error) {
    console.error("Failed to update store settings", error);
    return Response.json({ error: "Could not save store settings." }, { status: 500 });
  }
}
