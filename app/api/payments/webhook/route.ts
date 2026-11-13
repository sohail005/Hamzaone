import { getKV, getWorkerEnv, isRecord } from "@/lib/server/kv";
import { jsonError } from "@/lib/server/payments";
import { createStoredOrder, readOrderByRazorpayId, updateStoredOrder, type StoredOrder } from "@/lib/server/orders-store";
import { getD1 } from "@/lib/server/d1";
import { getRequestByRazorpayOrderId, linkOrder, listImages, markPaid } from "@/lib/server/custom-creations-store";
import { notifyAdminPaymentReceived, sendPaymentConfirmedEmail } from "@/lib/server/email-templates/custom-creations";

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

async function verifyWebhookSignature(secret: string, body: ArrayBuffer, signature: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify("HMAC", key, hexToBytes(signature), body);
}

export async function POST(request: Request) {
  const env = await getWorkerEnv();
  const secret = typeof env.RAZORPAY_WEBHOOK_SECRET === "string" ? env.RAZORPAY_WEBHOOK_SECRET.trim() : "";
  if (!secret) return jsonError("Razorpay webhook secret is not configured.", 503);

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature || !/^[a-fA-F0-9]{64}$/.test(signature)) {
    return jsonError("Invalid Razorpay webhook signature.", 400);
  }

  const rawBody = await request.arrayBuffer();
  try {
    if (!(await verifyWebhookSignature(secret, rawBody, signature))) {
      return jsonError("Invalid Razorpay webhook signature.", 400);
    }
  } catch (error) {
    console.error("Could not verify the Razorpay webhook signature.", error);
    return jsonError("Could not verify the Razorpay webhook.", 400);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return jsonError("Invalid Razorpay webhook body.", 400);
  }
  if (!isRecord(payload) || typeof payload.event !== "string") {
    return jsonError("Invalid Razorpay webhook event.", 400);
  }
  if (payload.event !== "payment.captured") {
    return Response.json({ received: true });
  }

  const details = isRecord(payload.payload) ? payload.payload : null;
  const paymentEntity =
    details && isRecord(details.payment) && isRecord(details.payment.entity) ? details.payment.entity : null;
  if (
    !paymentEntity ||
    typeof paymentEntity.id !== "string" ||
    typeof paymentEntity.order_id !== "string" ||
    typeof paymentEntity.amount !== "number" ||
    paymentEntity.currency !== "INR" ||
    paymentEntity.status !== "captured"
  ) {
    return jsonError("Invalid Razorpay payment event.", 400);
  }

  const ordersKV = getKV(env, "ORDERS_KV");
  if (!ordersKV) return jsonError("Order storage is not configured. Bind the ORDERS_KV namespace.", 503);

  const db = getD1(env);
  if (db) {
    const customCreationRequest = await getRequestByRazorpayOrderId(db, paymentEntity.order_id);
    if (customCreationRequest) {
      if (customCreationRequest.paymentStatus === "paid" || customCreationRequest.convertedOrderId) {
        return Response.json({ received: true });
      }
      if (customCreationRequest.finalAmount === null || customCreationRequest.finalAmount * 100 !== paymentEntity.amount) {
        return jsonError("The payment does not match the quoted amount.", 404);
      }

      const paid = await markPaid(db, customCreationRequest.id);
      const images = await listImages(db, customCreationRequest.id);
      const now = new Date().toISOString();
      const orderId = `HO-${new Date().getUTCFullYear()}-${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`;
      const order: StoredOrder = {
        id: orderId,
        razorpayOrderId: paymentEntity.order_id,
        razorpayPaymentId: paymentEntity.id,
        customer: { name: paid.customerName, email: paid.email, phone: paid.phone },
        address: {
          name: paid.customerName,
          pin: paid.deliveryPincode,
          line1: paid.deliveryCity,
          city: paid.deliveryCity,
          state: paid.deliveryState,
          type: "Home",
        },
        items: [
          {
            productSlug: `custom-creation-${paid.requestNumber.toLowerCase()}`,
            name: `Custom Creation — ${paid.projectName}`,
            color: paid.preferredColor ?? "As agreed",
            size: `${images.length} reference image(s)`,
            qty: paid.quantity,
            unitPrice: (paid.finalAmount ?? 0) / Math.max(1, paid.quantity),
          },
        ],
        subtotal: paid.finalAmount ?? 0,
        discount: 0,
        shipping: paid.deliveryCharges ?? 0,
        total: paid.finalAmount ?? 0,
        currency: "INR",
        paymentStatus: "paid",
        status: "confirmed",
        createdAt: now,
        updatedAt: now,
        paidAt: now,
      };
      await createStoredOrder(ordersKV, order);
      await linkOrder(db, paid.id, orderId);
      await Promise.all([
        sendPaymentConfirmedEmail(env, { email: paid.email, customerName: paid.customerName, requestNumber: paid.requestNumber, orderId }),
        notifyAdminPaymentReceived(env, { requestNumber: paid.requestNumber, requestId: paid.id }),
      ]);

      return Response.json({ received: true });
    }
  }

  try {
    const order = await readOrderByRazorpayId(ordersKV, paymentEntity.order_id);
    if (!order || order.total * 100 !== paymentEntity.amount || order.currency !== "INR") {
      return jsonError("The payment does not match a saved store order.", 404);
    }
    if (order.paymentStatus === "paid") {
      return Response.json({ received: true });
    }

    const now = new Date().toISOString();
    await updateStoredOrder(ordersKV, {
      ...order,
      razorpayPaymentId: paymentEntity.id,
      paymentStatus: "paid",
      status: "confirmed",
      paidAt: now,
      updatedAt: now,
    });
    return Response.json({ received: true });
  } catch (error) {
    console.error("Could not persist the Razorpay webhook event.", error);
    return jsonError("Could not process the Razorpay webhook.", 503);
  }
}
