import { requireAdmin } from "@/lib/server/require-admin";
import { getD1 } from "@/lib/server/d1";
import { getWorkerEnv, isRecord } from "@/lib/server/kv";
import { createQuotation, getQuotationById, getRequestById, sendQuotation, updateStatus } from "@/lib/server/custom-creations-store";
import { sendQuotationEmail } from "@/lib/server/email-templates/custom-creations";

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const env = await getWorkerEnv();
  const db = getD1(env);
  if (!db) {
    return Response.json({ error: "Custom Creations storage is not configured." }, { status: 503 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body) || typeof body.validUntil !== "string" || !body.validUntil) {
    return Response.json({ error: "A quotation expiry date is required." }, { status: 400 });
  }

  try {
    await updateStatus(db, id, "UNDER_REVIEW", admin.email, "Preparing quotation.");
  } catch {
    // Already under review or further along; quotation creation does not require a transition in that case.
  }

  const quotation = await createQuotation(
    db,
    id,
    {
      designCost: num(body.designCost),
      printingCost: num(body.printingCost),
      finishingCost: num(body.finishingCost),
      additionalCharges: num(body.additionalCharges),
      deliveryCharges: num(body.deliveryCharges),
      discount: num(body.discount),
      productionDays: num(body.productionDays),
      validUntil: body.validUntil,
      customerMessage: typeof body.customerMessage === "string" ? body.customerMessage : null,
    },
    admin.email,
  );

  return Response.json({ quotation }, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  const env = await getWorkerEnv();
  const db = getD1(env);
  if (!db) {
    return Response.json({ error: "Custom Creations storage is not configured." }, { status: 503 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body) || typeof body.quotationId !== "string" || body.action !== "send") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  await sendQuotation(db, body.quotationId);

  const quotation = await getQuotationById(db, body.quotationId);
  if (quotation) {
    const requestRecord = await getRequestById(db, quotation.requestId);
    if (requestRecord) {
      await sendQuotationEmail(env, {
        email: requestRecord.email,
        customerName: requestRecord.customerName,
        requestNumber: requestRecord.requestNumber,
        secureToken: quotation.secureToken,
        finalAmount: quotation.finalAmount,
      });
    }
  }

  return Response.json({ ok: true });
}
