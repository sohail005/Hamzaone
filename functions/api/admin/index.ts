import {
  customers,
  coupons,
  payments,
  productionCards,
  inventory,
  customRequests,
} from "../../../data/admin";

export const onRequestGet: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const resource = (searchParams.get("resource") ?? "all") as string;

  if (resource === "all") {
    return Response.json({
      customers,
      coupons,
      payments,
      production: productionCards,
      inventory,
      customRequests: customRequests,
    }, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const map: Record<string, unknown> = {
    customers,
    coupons,
    payments,
    production: productionCards,
    inventory,
    "custom-requests": customRequests,
  };

  const key = Object.keys(map).find((k) => k.toLowerCase() === resource.toLowerCase());
  if (!key) {
    return Response.json({ error: "Unknown resource" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  return Response.json({ [key]: map[key] }, { headers: { "Access-Control-Allow-Origin": "*" } });
};
