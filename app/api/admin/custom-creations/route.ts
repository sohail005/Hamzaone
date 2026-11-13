import { requireAdmin } from "@/lib/server/require-admin";
import { getD1 } from "@/lib/server/d1";
import { getWorkerEnv } from "@/lib/server/kv";
import { countByStatus, listRequests } from "@/lib/server/custom-creations-store";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  const env = await getWorkerEnv();
  const db = getD1(env);
  if (!db) {
    return Response.json({ error: "Custom Creations storage is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");

  const [{ requests, total }, statusCounts] = await Promise.all([
    listRequests(db, { status, search, page }),
    countByStatus(db),
  ]);

  return Response.json({
    requests: requests.map((r) => ({
      id: r.id,
      requestNumber: r.requestNumber,
      customerName: r.customerName,
      projectName: r.projectName,
      category: r.category,
      createdAt: r.createdAt,
      quantity: r.quantity,
      status: r.status,
      quotedPrice: r.quotedPrice,
    })),
    total,
    statusCounts,
  });
}
