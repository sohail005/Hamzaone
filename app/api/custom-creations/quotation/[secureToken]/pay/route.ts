import { getD1 } from "@/lib/server/d1";
import { getWorkerEnv } from "@/lib/server/kv";
import { getRazorpayCredentials, jsonError, readJson } from "@/lib/server/payments";
import { getQuotationByToken, getRequestById, setRazorpayOrderId, updateStatus } from "@/lib/server/custom-creations-store";

export async function POST(_request: Request, { params }: { params: Promise<{ secureToken: string }> }) {
  const { secureToken } = await params;
  const env = await getWorkerEnv();
  const db = getD1(env);
  if (!db) return jsonError("Custom Creations storage is not configured.", 503);

  const credentials = getRazorpayCredentials(env);
  if (!credentials.ok) return jsonError(credentials.error, 503);

  const quotation = await getQuotationByToken(db, secureToken);
  if (!quotation) return jsonError("Quotation not found.", 404);

  const request = await getRequestById(db, quotation.requestId);
  if (!request || request.status !== "CUSTOMER_APPROVED") {
    return jsonError("This request is not ready for payment.", 400);
  }

  const totalPaise = Math.round(quotation.finalAmount * 100);
  if (!Number.isSafeInteger(totalPaise) || totalPaise < 100) {
    return jsonError("The quotation amount is invalid.", 400);
  }

  let response: Response;
  try {
    response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: credentials.authorization, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: totalPaise,
        currency: "INR",
        receipt: request.requestNumber,
        notes: { customCreationRequestId: request.id, requestNumber: request.requestNumber },
      }),
    });
  } catch (error) {
    console.error("Razorpay order request failed.", error);
    return jsonError("Could not reach Razorpay. Please try again.", 502);
  }

  const result = await readJson(response);
  if (!response.ok || typeof result?.id !== "string" || result.amount !== totalPaise) {
    console.error("Razorpay order creation failed for custom creation.", response.status);
    return jsonError("Razorpay could not create the payment order.", 502);
  }

  await setRazorpayOrderId(db, request.id, result.id);
  await updateStatus(db, request.id, "PAYMENT_PENDING", "system", "Payment order created.");

  return Response.json({ keyId: credentials.keyId, orderId: result.id, amount: totalPaise, currency: "INR" });
}
