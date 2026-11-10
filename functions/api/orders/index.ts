import { orders, findOrder } from "@/data/orders";

export const onRequestGet: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const paymentStatus = searchParams.get("paymentStatus");

  let result = orders;

  if (id) {
    const order = findOrder(id);
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    return Response.json({ order });
  }

  if (status) result = result.filter((o) => o.status === status);
  if (paymentStatus) result = result.filter((o) => o.paymentStatus === paymentStatus);

  return Response.json({ orders: result, count: result.length });
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = await context.request.json();
    if (!body.id || !body.customer || !body.items) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    return Response.json({ message: "Order received", order: body }, { status: 201 });
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
};
