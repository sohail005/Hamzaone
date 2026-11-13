import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { defaultMaterialsConfig, getMaterialsConfig, saveMaterialsConfig, validateMaterialsConfig } from "@/lib/server/custom-print-materials";

async function requireAdmin(request: Request) {
  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  if (!user) return { error: Response.json({ error: "Unauthorized." }, { status: 401 }) };
  if (user.role !== "admin") return { error: Response.json({ error: "Forbidden." }, { status: 403 }) };
  return { user };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) return Response.json({ error: "Admin storage is not configured." }, { status: 503 });

  const config = await getMaterialsConfig(kv);
  return Response.json({ config }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) return Response.json({ error: "Admin storage is not configured." }, { status: 503 });

  const body = await request.json().catch(() => null);
  const config = validateMaterialsConfig((body as { config?: unknown } | null)?.config);
  if (!config) {
    return Response.json({ error: "Invalid materials configuration." }, { status: 400 });
  }

  await saveMaterialsConfig(kv, config);
  return Response.json({ config }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) return Response.json({ error: "Admin storage is not configured." }, { status: 503 });

  const config = defaultMaterialsConfig();
  await saveMaterialsConfig(kv, config);
  return Response.json({ config }, { headers: { "Cache-Control": "no-store" } });
}
