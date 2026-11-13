import { getR2, getWorkerEnv } from "@/lib/server/kv";

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const storageKey = key.join("/");
  if (!storageKey.startsWith("site-assets/")) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const env = await getWorkerEnv();
  const bucket = getR2(env, "CUSTOM_CREATIONS_FILES");
  if (!bucket) {
    return Response.json({ error: "Storage is not configured." }, { status: 503 });
  }

  const object = await bucket.get(storageKey);
  if (!object) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
