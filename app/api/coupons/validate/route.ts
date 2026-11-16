import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { findValidCoupon } from "@/lib/server/admin-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { code?: string; subtotal?: number } | null;
  if (!body || typeof body.code !== "string" || typeof body.subtotal !== "number") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Coupon lookup is not configured." }, { status: 503 });
  }

  const { coupon, error } = await findValidCoupon(kv, body.code, body.subtotal);
  if (error || !coupon) {
    return Response.json({ valid: false, error: error ?? "Invalid coupon code." }, { status: 400 });
  }

  const discount = coupon.type === "flat" ? coupon.value : Math.round(body.subtotal * (coupon.value / 100));
  return Response.json({ valid: true, couponCode: coupon.code, discount, error: null }, { headers: { "Cache-Control": "no-store" } });
}
