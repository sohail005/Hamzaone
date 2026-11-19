import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { getHomeSettings, updateHomeSettings } from "@/lib/server/home-settings-store";

export async function GET() {
  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Settings storage is not configured." }, { status: 503 });
  }
  try {
    const settings = await getHomeSettings(kv);
    return Response.json({ settings });
  } catch (error) {
    console.error("Failed to load home settings", error);
    return Response.json({ error: "Could not load home settings." }, { status: 500 });
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

  const patch = (await request.json().catch(() => null)) as { heroImageKeys?: string[] } | null;
  if (!patch || !Array.isArray(patch.heroImageKeys)) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const settings = await updateHomeSettings(kv, {
      heroImageKeys: patch.heroImageKeys.filter((key): key is string => typeof key === "string" && key.length > 0),
    });
    return Response.json({ settings });
  } catch (error) {
    console.error("Failed to update home settings", error);
    return Response.json({ error: "Could not save home settings." }, { status: 500 });
  }
}
