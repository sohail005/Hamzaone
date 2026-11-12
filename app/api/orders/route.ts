import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { listStoredOrders, readStoredOrder, toTrackableOrder } from "@/lib/server/orders-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const email = searchParams.get("email")?.trim().toLowerCase();
  const status = searchParams.get("status") ?? undefined;
  const paymentStatus = searchParams.get("paymentStatus") ?? undefined;

  const env = await getWorkerEnv();
  const ordersKv = getKV(env, "ORDERS_KV");

  if (id) {
    const paymentId = searchParams.get("paymentId");
    if (paymentId) {
      if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
        return Response.json({ error: "Invalid payment reference." }, { status: 400 });
      }
      if (!ordersKv) {
        return Response.json({ error: "Order verification is not configured." }, { status: 503 });
      }
      try {
        const order = await readStoredOrder(ordersKv, id);
        if (!order || order.paymentStatus !== "paid" || order.razorpayPaymentId !== paymentId) {
          return Response.json({ error: "This payment is not confirmed for the order." }, { status: 404 });
        }
        return Response.json({ verified: true, orderId: order.id }, { headers: { "Cache-Control": "no-store" } });
      } catch (error) {
        console.error("Could not verify an order confirmation.", error);
        return Response.json({ error: "Could not verify the order. Please try again." }, { status: 503 });
      }
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ error: "Enter the email address used at checkout." }, { status: 400 });
    }
    if (!ordersKv) {
      return Response.json({ error: "Order tracking is not configured." }, { status: 503 });
    }
    try {
      const order = await readStoredOrder(ordersKv, id);
      if (!order || order.customer.email.toLowerCase() !== email) {
        return Response.json({ error: "We couldn't find an order matching those details." }, { status: 404 });
      }
      return Response.json({ order: toTrackableOrder(order) }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      console.error("Could not look up an order.", error);
      return Response.json({ error: "Could not look up the order. Please try again." }, { status: 503 });
    }
  }

  const authKv = await getAuthKV();
  const requester = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  if (!requester || requester.role !== "admin") {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!ordersKv) {
    return Response.json({ error: "Order storage is not configured." }, { status: 503 });
  }

  const orders = await listStoredOrders(ordersKv, { status, paymentStatus });
  return Response.json({ orders, count: orders.length }, { headers: { "Cache-Control": "no-store" } });
}
