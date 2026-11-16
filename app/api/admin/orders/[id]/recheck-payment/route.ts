import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { getRazorpayCredentials, jsonError, readJson } from "@/lib/server/payments";
import { readStoredOrder, updateStoredOrder } from "@/lib/server/orders-store";
import { fulfillPaidOrder } from "@/lib/server/order-fulfillment";

type RazorpayPayment = { id: string; status: string; amount: number; currency: string; order_id: string };

function isRazorpayPayment(value: unknown): value is RazorpayPayment {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.status === "string" &&
    typeof p.amount === "number" &&
    typeof p.currency === "string" &&
    typeof p.order_id === "string"
  );
}

// Lets an admin re-query Razorpay for an order stuck in awaiting_payment/pending —
// e.g. the customer closed the tab before verify-payment ran and the webhook
// secret was never configured, so no automatic confirmation ever arrived.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const env = await getWorkerEnv();
  const ordersKV = getKV(env, "ORDERS_KV");
  if (!ordersKV) return jsonError("Order storage is not configured. Bind the ORDERS_KV namespace.", 503);

  const order = await readStoredOrder(ordersKV, id);
  if (!order) return jsonError("Order not found.", 404);
  if (order.paymentStatus === "paid") {
    return Response.json({ order, synced: "already_paid" });
  }

  const credentials = getRazorpayCredentials(env);
  if (!credentials.ok) return jsonError(credentials.error, 503);

  let response: Response;
  try {
    response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(order.razorpayOrderId)}/payments`, {
      headers: { Authorization: credentials.authorization },
    });
  } catch (error) {
    console.error("Could not reach Razorpay to recheck a payment.", error);
    return jsonError("Could not reach Razorpay. Please try again.", 502);
  }

  const result = await readJson(response);
  if (response.status === 401 || response.status === 403) {
    console.error("Razorpay rejected the configured credentials.", response.status);
    return jsonError("Razorpay credentials were rejected. Check the server configuration.", 401);
  }
  if (!response.ok || !Array.isArray(result?.items)) {
    console.error("Could not fetch Razorpay payments for an order.", response.status);
    return jsonError("Could not fetch payments for this order from Razorpay.", 502);
  }

  const payments = result.items.filter(isRazorpayPayment);
  const expectedAmount = Math.round(order.total * 100);
  const matches = (p: RazorpayPayment) => p.order_id === order.razorpayOrderId && p.amount === expectedAmount && p.currency === "INR";

  const dataKV = getKV(env, "DATA_KV");

  const captured = payments.find((p) => p.status === "captured" && matches(p));
  if (captured) {
    const updated = await fulfillPaidOrder(env, ordersKV, dataKV, order, captured.id);
    return Response.json({ order: updated, synced: "paid" });
  }

  const authorized = payments.find((p) => p.status === "authorized" && matches(p));
  if (authorized) {
    let captureResponse: Response;
    try {
      captureResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(authorized.id)}/capture`, {
        method: "POST",
        headers: { Authorization: credentials.authorization, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: authorized.amount, currency: "INR" }),
      });
    } catch (error) {
      console.error("Could not reach Razorpay to capture a payment.", error);
      return jsonError("Could not reach Razorpay. Please try again.", 502);
    }
    const capturedPayment = await readJson(captureResponse);
    if (captureResponse.ok && capturedPayment?.status === "captured" && capturedPayment.id === authorized.id) {
      const updated = await fulfillPaidOrder(env, ordersKV, dataKV, order, authorized.id);
      return Response.json({ order: updated, synced: "paid" });
    }
    return Response.json({ order, synced: "still_pending" });
  }

  const failed = payments.find((p) => p.status === "failed" && p.order_id === order.razorpayOrderId);
  if (failed && order.paymentStatus === "pending") {
    const updated = { ...order, razorpayPaymentId: failed.id, paymentStatus: "failed" as const, updatedAt: new Date().toISOString() };
    await updateStoredOrder(ordersKV, updated);
    return Response.json({ order: updated, synced: "failed" });
  }

  return Response.json({ order, synced: "no_change" });
}
