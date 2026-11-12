import { getKV, getWorkerEnv, isRecord } from "@/lib/server/kv";
import { getRazorpayCredentials, jsonError, readJson } from "@/lib/server/payments";
import { readStoredOrder, updateStoredOrder } from "@/lib/server/orders-store";

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

async function verifySignature(secret: string, orderId: string, paymentId: string, signature: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify("HMAC", key, hexToBytes(signature), new TextEncoder().encode(`${orderId}|${paymentId}`));
}

export async function POST(request: Request) {
  const env = await getWorkerEnv();
  const ordersKV = getKV(env, "ORDERS_KV");
  if (!ordersKV) {
    return jsonError("Order storage is not configured. Bind the ORDERS_KV namespace.", 503);
  }
  const kv = ordersKV;

  const credentials = getRazorpayCredentials(env);
  if (!credentials.ok) return jsonError(credentials.error, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }
  if (!isRecord(body)) return jsonError("Invalid payment details.", 400);

  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
  if (
    typeof orderId !== "string" ||
    !/^order_[A-Za-z0-9]+$/.test(orderId) ||
    typeof paymentId !== "string" ||
    !/^pay_[A-Za-z0-9]+$/.test(paymentId) ||
    typeof signature !== "string" ||
    !/^[a-fA-F0-9]{64}$/.test(signature)
  ) {
    return jsonError("Invalid payment verification details.", 400);
  }
  const verifiedPaymentId = paymentId;

  try {
    if (!(await verifySignature(credentials.keySecret, orderId, paymentId, signature))) {
      return jsonError("Razorpay payment signature is invalid.", 400);
    }

    const headers = { Authorization: credentials.authorization };
    const [paymentResponse, orderResponse] = await Promise.all([
      fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers }),
      fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, { headers }),
    ]);
    const [payment, order] = await Promise.all([readJson(paymentResponse), readJson(orderResponse)]);
    if (
      paymentResponse.status === 401 ||
      paymentResponse.status === 403 ||
      orderResponse.status === 401 ||
      orderResponse.status === 403
    ) {
      console.error("Razorpay rejected the configured credentials.", paymentResponse.status, orderResponse.status);
      return jsonError("Razorpay credentials were rejected. Check the server configuration.", 401);
    }
    if (
      !paymentResponse.ok ||
      !orderResponse.ok ||
      !payment ||
      !order ||
      payment.order_id !== orderId ||
      order.id !== orderId ||
      typeof order.receipt !== "string" ||
      payment.currency !== "INR" ||
      order.currency !== "INR" ||
      payment.amount !== order.amount
    ) {
      console.error("Razorpay payment details did not match the order.", paymentResponse.status, orderResponse.status);
      return jsonError("Razorpay could not confirm this payment.", 502);
    }

    const storedOrder = await readStoredOrder(kv, order.receipt);
    if (
      !storedOrder ||
      storedOrder.razorpayOrderId !== orderId ||
      storedOrder.total * 100 !== order.amount ||
      storedOrder.currency !== "INR"
    ) {
      return jsonError("The payment does not match a saved store order.", 404);
    }
    const matchedOrder = storedOrder;

    if (matchedOrder.paymentStatus === "paid") {
      if (matchedOrder.razorpayPaymentId === verifiedPaymentId && payment.status === "captured") {
        return Response.json({ status: "success", orderId: matchedOrder.id });
      }
      return jsonError("This order has already been paid.", 409);
    }

    async function markPaid() {
      const now = new Date().toISOString();
      await updateStoredOrder(kv, {
        ...matchedOrder,
        razorpayPaymentId: verifiedPaymentId,
        paymentStatus: "paid",
        status: "confirmed",
        paidAt: now,
        updatedAt: now,
      });
      return Response.json({ status: "success", orderId: matchedOrder.id });
    }

    if (payment.status === "authorized") {
      const captureResponse = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/capture`,
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ amount: payment.amount, currency: "INR" }),
        },
      );
      const capturedPayment = await readJson(captureResponse);
      if (captureResponse.status === 401 || captureResponse.status === 403) {
        console.error("Razorpay rejected the configured credentials during capture.", captureResponse.status);
        return jsonError("Razorpay credentials were rejected. Check the server configuration.", 401);
      }
      if (
        captureResponse.ok &&
        capturedPayment?.status === "captured" &&
        capturedPayment.id === paymentId &&
        capturedPayment.order_id === orderId &&
        capturedPayment.amount === payment.amount &&
        capturedPayment.currency === "INR"
      ) {
        return markPaid();
      }
      if (capturedPayment?.status !== "authorized") {
        console.error("Razorpay payment capture did not complete.", captureResponse.status);
        return jsonError("Razorpay could not capture this payment. Contact the store before retrying.", 502);
      }
      return Response.json({ status: "pending", orderId: matchedOrder.id }, { status: 202 });
    }

    if (payment.status === "captured") {
      return markPaid();
    }
    if (payment.status === "failed") {
      await updateStoredOrder(kv, {
        ...matchedOrder,
        razorpayPaymentId: verifiedPaymentId,
        paymentStatus: "failed",
        updatedAt: new Date().toISOString(),
      });
      return jsonError("Razorpay has not captured this payment.", 402);
    }
    return jsonError("Razorpay has not captured this payment.", 402);
  } catch (error) {
    console.error("Razorpay payment verification failed.", error);
    return jsonError("Could not verify the Razorpay payment. Please contact the store.", 502);
  }
}
