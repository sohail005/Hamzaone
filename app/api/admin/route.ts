import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { getAdminResource, getAllAdminResources, isAdminResource } from "@/lib/server/admin-store";

export async function GET(request: Request) {
  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (user.role !== "admin") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Admin storage is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource") ?? "all";

  if (resource === "all") {
    const all = await getAllAdminResources(kv);
    return Response.json({
      customers: all.customers,
      coupons: all.coupons,
      payments: all.payments,
      production: all.production,
      inventory: all.inventory,
      customRequests: all["custom-requests"],
    });
  }

  const key = resource === "custom-requests" ? "custom-requests" : resource;
  if (!isAdminResource(key)) {
    return Response.json({ error: "Unknown resource" }, { status: 400 });
  }

  const value = await getAdminResource(kv, key);
  const responseKey = key === "custom-requests" ? "custom-requests" : key;
  return Response.json({ [responseKey]: value });
}
