import { getD1 } from "@/lib/server/d1";
import { getWorkerEnv } from "@/lib/server/kv";
import { getQuotationByToken, getRequestById, listImages } from "@/lib/server/custom-creations-store";

export async function GET(_request: Request, { params }: { params: Promise<{ secureToken: string }> }) {
  const { secureToken } = await params;
  const env = await getWorkerEnv();
  const db = getD1(env);
  if (!db) {
    return Response.json({ error: "Custom Creations storage is not configured." }, { status: 503 });
  }

  const quotation = await getQuotationByToken(db, secureToken);
  if (!quotation || quotation.status === "draft") {
    return Response.json({ error: "Quotation not found." }, { status: 404 });
  }

  const request = await getRequestById(db, quotation.requestId);
  if (!request) {
    return Response.json({ error: "Quotation not found." }, { status: 404 });
  }

  const images = await listImages(db, request.id);

  return Response.json({
    requestNumber: request.requestNumber,
    projectName: request.projectName,
    status: request.status,
    quotation: {
      designCost: quotation.designCost,
      printingCost: quotation.printingCost,
      finishingCost: quotation.finishingCost,
      additionalCharges: quotation.additionalCharges,
      deliveryCharges: quotation.deliveryCharges,
      discount: quotation.discount,
      finalAmount: quotation.finalAmount,
      productionDays: quotation.productionDays,
      validUntil: quotation.validUntil,
      customerMessage: quotation.customerMessage,
      status: quotation.status,
    },
    imageCount: images.length,
  });
}
