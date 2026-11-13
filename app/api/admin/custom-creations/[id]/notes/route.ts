import { requireAdmin } from "@/lib/server/require-admin";
import { getD1 } from "@/lib/server/d1";
import { getWorkerEnv, isRecord } from "@/lib/server/kv";
import { setAdminNotes } from "@/lib/server/custom-creations-store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const env = await getWorkerEnv();
  const db = getD1(env);
  if (!db) {
    return Response.json({ error: "Custom Creations storage is not configured." }, { status: 503 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body) || typeof body.notes !== "string") {
    return Response.json({ error: "Invalid notes." }, { status: 400 });
  }

  await setAdminNotes(db, id, body.notes);
  return Response.json({ ok: true });
}
