import { checkRateLimit, getAuthKV } from "@/lib/server/auth";
import { getKV, getWorkerEnv, isRecord } from "@/lib/server/kv";
import { readStoredOrder } from "@/lib/server/orders-store";
import { createReview, hasReviewForOrderItem, listApprovedReviews } from "@/lib/server/reviews-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productSlug = searchParams.get("productSlug") ?? undefined;

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) {
    return Response.json({ error: "Review storage is not configured." }, { status: 503 });
  }

  try {
    const reviews = await listApprovedReviews(kv, productSlug);
    return Response.json({ reviews }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("GET /api/reviews", error);
    return Response.json({ error: "Could not load reviews. Please try again." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authKv = await getAuthKV();
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  if (authKv) {
    const allowed = await checkRateLimit(authKv, `reviews-create:${ip}`, 10);
    if (!allowed) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }
  }

  const env = await getWorkerEnv();
  const dataKv = getKV(env, "DATA_KV");
  const ordersKv = getKV(env, "ORDERS_KV");
  if (!dataKv || !ordersKv) {
    return Response.json({ error: "Review storage is not configured." }, { status: 503 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body)) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const productSlug = typeof body.productSlug === "string" ? body.productSlug.trim() : "";
  const rating = typeof body.rating === "number" ? Math.round(body.rating) : 0;
  const quote = typeof body.quote === "string" ? body.quote.trim() : "";

  if (!orderId || !email) {
    return Response.json({ error: "Enter the order ID and checkout email." }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return Response.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }
  if (!quote || quote.length > 1000) {
    return Response.json({ error: "Enter a review up to 1000 characters." }, { status: 400 });
  }

  try {
    const order = await readStoredOrder(ordersKv, orderId);
    if (!order || order.customer.email.toLowerCase() !== email) {
      return Response.json({ error: "We couldn't find an order matching those details." }, { status: 404 });
    }
    if (order.status !== "delivered") {
      return Response.json({ error: "You can review an item once your order is marked delivered." }, { status: 400 });
    }
    const item = order.items.find((i) => i.productSlug === productSlug);
    if (!item) {
      return Response.json({ error: "That item isn't part of this order." }, { status: 400 });
    }
    if (await hasReviewForOrderItem(dataKv, orderId, productSlug)) {
      return Response.json({ error: "You've already reviewed this item." }, { status: 409 });
    }

    const review = await createReview(dataKv, {
      orderId,
      productSlug,
      productName: item.name,
      customerName: order.customer.name,
      rating: rating as 1 | 2 | 3 | 4 | 5,
      quote,
    });

    return Response.json({ review, message: "Thanks! Your review will appear once it's approved." }, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews", error);
    return Response.json({ error: "Could not save your review. Please try again." }, { status: 500 });
  }
}
