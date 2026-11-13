import { getD1 } from "@/lib/server/d1";
import { getWorkerEnv } from "@/lib/server/kv";
import { getRequestByNumber, listHistory, listQuotations } from "@/lib/server/custom-creations-store";

export async function GET(request: Request, { params }: { params: Promise<{ requestNumber: string }> }) {
  const { requestNumber } = await params;
  const env = await getWorkerEnv();
  const db = getD1(env);
  if (!db) {
    return Response.json({ error: "Custom Creations storage is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();
  const token = searchParams.get("token");

  const found = await getRequestByNumber(db, requestNumber);
  if (!found) {
    return Response.json({ error: "Request not found." }, { status: 404 });
  }

  const authorized = (!!token && token === found.trackingToken) || (!!email && email === found.email.toLowerCase());
  if (!authorized) {
    return Response.json({ error: "Request not found." }, { status: 404 });
  }

  const [history, quotations] = await Promise.all([listHistory(db, found.id), listQuotations(db, found.id)]);

  return Response.json({
    requestNumber: found.requestNumber,
    projectName: found.projectName,
    category: found.category,
    status: found.status,
    quotedPrice: found.quotedPrice,
    finalAmount: found.finalAmount,
    productionDays: found.productionDays,
    paymentStatus: found.paymentStatus,
    convertedOrderId: found.convertedOrderId,
    createdAt: found.createdAt,
    updatedAt: found.updatedAt,
    history: history.map((h) => ({ previousStatus: h.previousStatus, newStatus: h.newStatus, createdAt: h.createdAt })),
    latestQuotation: quotations[0]
      ? { secureToken: quotations[0].secureToken, status: quotations[0].status, finalAmount: quotations[0].finalAmount, validUntil: quotations[0].validUntil }
      : null,
  });
}
