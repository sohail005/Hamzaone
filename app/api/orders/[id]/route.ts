import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { ORDER_STATUSES, readStoredOrder, updateStoredOrder } from "@/lib/server/orders-store";

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

  try {
    const order = await readStoredOrder(ordersKv, id);
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const owns = order.customer.email.toLowerCase() === requester.email.toLowerCase();
    if (!owns && requester.role !== "admin") {
      return Response.json({ error: "Forbidden." }, { status: 403 });
    }

    return Response.json({ order }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/orders/[id]", error);
    return Response.json({ error: "Could not load the order. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const authKv = await getAuthKV();
  const requester = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  if (!requester || requester.role !== "admin") {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const env = await getWorkerEnv();
  const ordersKv = getKV(env, "ORDERS_KV");
  if (!ordersKv) {
    return Response.json({ error: "Order storage is not configured." }, { status: 503 });
  }

  try {
    const order = await readStoredOrder(ordersKv, id);
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => null)) as { status?: string; trackingNumber?: string | null; carrier?: string | null } | null;
    if (!body) {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }
    if (body.status !== undefined && !ORDER_STATUSES.includes(body.status as (typeof ORDER_STATUSES)[number])) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }

    const updated = {
      ...order,
      status: (body.status as typeof order.status) ?? order.status,
      trackingNumber: body.trackingNumber === null ? undefined : (body.trackingNumber ?? order.trackingNumber),
      carrier: body.carrier === null ? undefined : (body.carrier ?? order.carrier),
      updatedAt: new Date().toISOString(),
    };

    await updateStoredOrder(ordersKv, updated);
    return Response.json({ order: updated }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("PATCH /api/orders/[id]", error);
    return Response.json({ error: "Could not update the order. Please try again." }, { status: 500 });
  }
}
