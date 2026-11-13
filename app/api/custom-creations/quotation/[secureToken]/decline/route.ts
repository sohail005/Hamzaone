import { getD1 } from "@/lib/server/d1";
import { getWorkerEnv } from "@/lib/server/kv";
import { getQuotationByToken, markQuotationDeclined } from "@/lib/server/custom-creations-store";
import { notifyAdminQuotationResponse } from "@/lib/server/email-templates/custom-creations";

export async function POST(_request: Request, { params }: { params: Promise<{ secureToken: string }> }) {
  const { secureToken } = await params;
  const env = await getWorkerEnv();
  const db = getD1(env);
  if (!db) {
    return Response.json({ error: "Custom Creations storage is not configured." }, { status: 503 });
  }

  const quotation = await getQuotationByToken(db, secureToken);
  if (!quotation || quotation.status !== "sent") {
    return Response.json({ error: "This quotation cannot be declined." }, { status: 400 });
  }

  const request = await markQuotationDeclined(db, quotation.id);
  await notifyAdminQuotationResponse(env, { requestNumber: request.requestNumber, requestId: request.id, accepted: false });
  return Response.json({ status: request.status });
}
