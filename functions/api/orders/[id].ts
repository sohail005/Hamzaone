import { findOrder } from "@/data/orders";

export const onRequestGet: PagesFunction = async (context) => {
  const id = context.params.id as string;
  const order = findOrder(id);
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }
  return Response.json({ order });
};
