import { getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { deleteReview, listAllReviews, setReviewApproved } from "@/lib/server/reviews-store";

async function requireAdmin(request: Request) {
  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  return user?.role === "admin" ? user : null;
}

export async function GET(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) return Response.json({ error: "Review storage is not configured." }, { status: 503 });

  try {
    const reviews = await listAllReviews(kv);
    return Response.json({ reviews }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/admin/reviews", error);
    return Response.json({ error: "Could not load reviews. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) return Response.json({ error: "Review storage is not configured." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { id?: string; approved?: boolean } | null;
  if (!body || typeof body.id !== "string" || typeof body.approved !== "boolean") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const review = await setReviewApproved(kv, body.id, body.approved);
    if (!review) return Response.json({ error: "Review not found." }, { status: 404 });
    return Response.json({ review });
  } catch (error) {
    console.error("PATCH /api/admin/reviews", error);
    return Response.json({ error: "Could not update the review. Please try again." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) return Response.json({ error: "Review storage is not configured." }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing review id." }, { status: 400 });

  try {
    const removed = await deleteReview(kv, id);
    if (!removed) return Response.json({ error: "Review not found." }, { status: 404 });
    return Response.json({ message: "Review deleted." });
  } catch (error) {
    console.error("DELETE /api/admin/reviews", error);
    return Response.json({ error: "Could not delete the review. Please try again." }, { status: 500 });
  }
}
