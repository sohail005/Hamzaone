import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { updateProductionStage } from "@/lib/server/admin-store";

export async function PATCH(request: Request) {
  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) return Response.json({ error: "Production storage is not configured." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { id?: string; stage?: string } | null;
  if (!body || typeof body.id !== "string" || typeof body.stage !== "string") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const production = await updateProductionStage(kv, body.id, body.stage);
    return Response.json({ production });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Could not update production stage." }, { status: 400 });
  }
}
