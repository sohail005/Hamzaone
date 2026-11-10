import { getRazorpayCredentials, isRecord, jsonError, readJson } from "./_shared";

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
  return crypto.subtle.verify(
    "HMAC",
    key,
    hexToBytes(signature),
    new TextEncoder().encode(`${orderId}|${paymentId}`),
  );
}

export const onRequestPost: PagesFunction = async (context) => {
  const credentials = getRazorpayCredentials(context.env);
  if (!credentials.ok) return jsonError(credentials.error, 503);

  let body: unknown;
  try {
    body = await context.request.json();
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

  try {
    if (!(await verifySignature(credentials.keySecret, orderId, paymentId, signature))) {
      return jsonError("Razorpay payment signature is invalid.", 400);
    }

    const headers = { Authorization: credentials.authorization };
    const [paymentResponse, orderResponse] = await Promise.all([
      fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers }),
      fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, { headers }),
    ]);
    const [payment, order] = await Promise.all([
      readJson(paymentResponse),
      readJson(orderResponse),
    ]);
    if (
      !paymentResponse.ok ||
      !orderResponse.ok ||
      !payment ||
      !order ||
      payment.order_id !== orderId ||
      order.id !== orderId ||
      payment.currency !== "INR" ||
      order.currency !== "INR" ||
      payment.amount !== order.amount
    ) {
      console.error("Razorpay payment details did not match the order.", paymentResponse.status, orderResponse.status);
      return jsonError("Razorpay could not confirm this payment.", 502);
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
      if (capturedPayment?.status === "captured") {
        return Response.json({ status: "success" });
      }
      if (capturedPayment?.status !== "authorized") {
        console.error("Razorpay payment capture did not complete.", captureResponse.status);
        return jsonError("Razorpay could not capture this payment. Contact the store before retrying.", 502);
      }
      return Response.json({ status: "pending" }, { status: 202 });
    }

    if (payment.status === "captured") {
      return Response.json({ status: "success" });
    }
    return jsonError("Razorpay has not captured this payment.", 402);
  } catch (error) {
    console.error("Razorpay payment verification failed.", error);
    return jsonError("Could not verify the Razorpay payment. Please contact the store.", 502);
  }
};
