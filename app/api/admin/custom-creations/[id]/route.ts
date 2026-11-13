import { requireAdmin } from "@/lib/server/require-admin";
import { getD1 } from "@/lib/server/d1";
import { getWorkerEnv } from "@/lib/server/kv";
import { getRequestById, listHistory, listImages, listQuotations } from "@/lib/server/custom-creations-store";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const env = await getWorkerEnv();
  const db = getD1(env);
  if (!db) {
    return Response.json({ error: "Custom Creations storage is not configured." }, { status: 503 });
  }

  const found = await getRequestById(db, id);
  if (!found) {
    return Response.json({ error: "Request not found." }, { status: 404 });
  }

  const [images, history, quotations] = await Promise.all([listImages(db, id), listHistory(db, id), listQuotations(db, id)]);

  return Response.json({ request: found, images, history, quotations });
}
