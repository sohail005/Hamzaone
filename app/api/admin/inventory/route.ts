import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { adjustInventoryStock } from "@/lib/server/admin-store";

export async function PATCH(request: Request) {
  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) return Response.json({ error: "Inventory storage is not configured." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { slug?: string; variant?: string; stock?: number } | null;
  if (!body || typeof body.slug !== "string" || typeof body.variant !== "string" || typeof body.stock !== "number") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const inventory = await adjustInventoryStock(kv, body.slug, body.variant, body.stock);
    return Response.json({ inventory });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Could not adjust stock." }, { status: 400 });
  }
}
