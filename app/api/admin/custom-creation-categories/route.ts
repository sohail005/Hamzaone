import { revalidatePath } from "next/cache";
import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { getCustomCreationCategoryOverrides, updateCustomCreationCategoryOverride } from "@/lib/server/custom-creation-categories-store";
import { CUSTOM_CREATION_CATEGORIES } from "@/data/customCreations";

export async function GET() {
  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Settings storage is not configured." }, { status: 503 });
  }
  try {
    const overrides = await getCustomCreationCategoryOverrides(kv);
    return Response.json({ overrides });
  } catch (error) {
    console.error("Failed to load custom creation category overrides", error);
    return Response.json({ error: "Could not load custom creation categories." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Settings storage is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { slug?: string; imageKey?: string | null; enabled?: boolean } | null;
  if (!body || typeof body.slug !== "string" || !CUSTOM_CREATION_CATEGORIES.some((c) => c.slug === body.slug)) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const overrides = await updateCustomCreationCategoryOverride(kv, body.slug, {
      imageKey: body.imageKey,
      enabled: body.enabled,
    });
    revalidatePath("/custom-creations");
    return Response.json({ overrides });
  } catch (error) {
    console.error("Failed to update custom creation category override", error);
    return Response.json({ error: "Could not save custom creation category." }, { status: 500 });
  }
}
