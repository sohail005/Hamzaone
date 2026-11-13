import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { getHomeSettings, updateHomeSettings } from "@/lib/server/home-settings-store";

export async function GET() {
  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Settings storage is not configured." }, { status: 503 });
  }
  const settings = await getHomeSettings(kv);
  return Response.json({ settings });
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

  const patch = (await request.json().catch(() => null)) as { heroImageKey?: string | null } | null;
  if (!patch) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const settings = await updateHomeSettings(kv, {
    heroImageKey: patch.heroImageKey === null ? undefined : patch.heroImageKey,
  });
  return Response.json({ settings });
}
