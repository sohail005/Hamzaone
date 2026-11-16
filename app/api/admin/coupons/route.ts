import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { createCoupon, updateCoupon } from "@/lib/server/admin-store";

async function requireAdmin(request: Request) {
  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  return user?.role === "admin" ? user : null;
}

export async function POST(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) return Response.json({ error: "Coupon storage is not configured." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as {
    code?: string;
    type?: string;
    value?: number;
    minOrder?: number;
    expires?: string;
    maxUses?: number;
  } | null;

  if (
    !body ||
    typeof body.code !== "string" ||
    (body.type !== "flat" && body.type !== "percent") ||
    typeof body.value !== "number" ||
    typeof body.minOrder !== "number" ||
    (body.maxUses !== undefined && (typeof body.maxUses !== "number" || body.maxUses < 1))
  ) {
    return Response.json({ error: "Invalid coupon." }, { status: 400 });
  }

  try {
    const coupons = await createCoupon(kv, {
      code: body.code,
      type: body.type,
      value: body.value,
      minOrder: body.minOrder,
      expires: body.expires,
      maxUses: body.maxUses,
    });
    return Response.json({ coupons });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Could not create coupon." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) return Response.json({ error: "Coupon storage is not configured." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as {
    code?: string;
    type?: "flat" | "percent";
    value?: number;
    minOrder?: number;
    expires?: string;
    enabled?: boolean;
    maxUses?: number;
  } | null;

  if (!body || typeof body.code !== "string") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { code, ...patch } = body;
  try {
    const coupons = await updateCoupon(kv, code, patch);
    return Response.json({ coupons });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Could not update coupon." }, { status: 400 });
  }
}
