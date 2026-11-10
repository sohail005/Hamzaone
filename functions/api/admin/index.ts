import {
  customers,
  coupons,
  payments,
  productionCards,
  inventory,
  customRequests,
} from "../../../data/admin";

const RESOURCES: Record<string, unknown> = {
  customers,
  coupons,
  payments,
  production: productionCards,
  inventory,
  "custom-requests": customRequests,
};

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
    });
  }

  const key = Object.keys(RESOURCES).find((k) => k.toLowerCase() === resource.toLowerCase());
  if (!key) {
    return Response.json(
      { error: `Unknown resource. Available: ${Object.keys(RESOURCES).join(", ")}` },
      { status: 400 },
    );
  }

  return Response.json({ [key]: RESOURCES[key] });
};
