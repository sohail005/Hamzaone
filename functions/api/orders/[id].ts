import { findOrder } from "../../../data/orders";

export const onRequestGet: PagesFunction = async (context) => {
  const id = context.params.id as string;
  const order = findOrder(id);
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
  }
  return Response.json({ order }, { headers: { "Access-Control-Allow-Origin": "*" } });
};
