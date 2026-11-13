import { requireAdmin } from "@/lib/server/require-admin";
import { getD1 } from "@/lib/server/d1";
import { getWorkerEnv } from "@/lib/server/kv";
import { listImages } from "@/lib/server/custom-creations-store";
import { presignGetUrl } from "@/lib/server/r2-presign";

export async function GET(request: Request, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  const { id, imageId } = await params;
  const env = await getWorkerEnv();
  const db = getD1(env);
  if (!db) {
    return Response.json({ error: "Custom Creations storage is not configured." }, { status: 503 });
  }

  const images = await listImages(db, id);
  const image = images.find((img) => img.id === imageId);
  if (!image) {
    return Response.json({ error: "Image not found." }, { status: 404 });
  }

  try {
    const url = await presignGetUrl(env, image.storageKey);
    return Response.json({ url, originalFilename: image.originalFilename });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Could not generate a signed URL." }, { status: 503 });
  }
}
