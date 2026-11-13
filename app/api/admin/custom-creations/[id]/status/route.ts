import { requireAdmin } from "@/lib/server/require-admin";
import { getD1 } from "@/lib/server/d1";
import { getWorkerEnv, isRecord } from "@/lib/server/kv";
import { updateStatus } from "@/lib/server/custom-creations-store";
import { isValidStatus } from "@/lib/server/custom-creations-status";
import { sendStatusUpdateEmail } from "@/lib/server/email-templates/custom-creations";

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
  if (!isRecord(body) || typeof body.status !== "string" || !isValidStatus(body.status)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }
  const note = typeof body.note === "string" ? body.note : undefined;

  try {
    const updated = await updateStatus(db, id, body.status, admin.email, note);
    await sendStatusUpdateEmail(env, { email: updated.email, customerName: updated.customerName, requestNumber: updated.requestNumber, status: updated.status });
    return Response.json({ request: updated });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Could not update status." }, { status: 400 });
  }
}
