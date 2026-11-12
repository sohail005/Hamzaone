import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { readStoredOrder } from "@/lib/server/orders-store";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const authKv = await getAuthKV();
  const requester = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  if (!requester) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const env = await getWorkerEnv();
  const ordersKv = getKV(env, "ORDERS_KV");
  if (!ordersKv) {
    return Response.json({ error: "Order storage is not configured." }, { status: 503 });
  }

  const order = await readStoredOrder(ordersKv, id);
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  const owns = order.customer.email.toLowerCase() === requester.email.toLowerCase();
  if (!owns && requester.role !== "admin") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  return Response.json({ order }, { headers: { "Cache-Control": "no-store" } });
}
