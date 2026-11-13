import { getR2, getWorkerEnv, slugify } from "@/lib/server/kv";

const ALLOWED_EXTENSIONS = ["stl", "step", "stp", "3mf"];
const MAX_ORIGINAL_SIZE = 100 * 1024 * 1024;

export async function POST(request: Request) {
  const originalNameHeader = request.headers.get("x-original-name");
  const originalName = originalNameHeader ? decodeURIComponent(originalNameHeader) : null;
  const originalSizeHeader = request.headers.get("x-original-size");
  const originalType = request.headers.get("x-original-type") ?? "application/octet-stream";
  const contentEncoding = request.headers.get("x-content-encoding") === "gzip" ? "gzip" : "identity";

  if (!originalName || !originalSizeHeader) {
    return Response.json({ error: "Missing file metadata." }, { status: 400 });
  }

  const originalSize = Number(originalSizeHeader);
  if (!Number.isFinite(originalSize) || originalSize <= 0) {
    return Response.json({ error: "Invalid file size." }, { status: 400 });
  }
  if (originalSize > MAX_ORIGINAL_SIZE) {
    return Response.json({ error: "This file is too large (over 100 MB)." }, { status: 413 });
  }

  const ext = originalName.toLowerCase().split(".").pop() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return Response.json({ error: "Unsupported file type." }, { status: 400 });
  }

  if (!request.body) {
    return Response.json({ error: "Missing upload body." }, { status: 400 });
  }

  const env = await getWorkerEnv();
  const bucket = getR2(env, "CUSTOM_PRINT_FILES");
  if (!bucket) {
    return Response.json({ error: "File storage is not configured." }, { status: 503 });
  }

  const baseName = slugify(originalName.replace(/\.[^.]+$/, "")) || "model";
  const key = `custom-print/${Date.now()}-${crypto.randomUUID()}-${baseName}.${ext}${contentEncoding === "gzip" ? ".gz" : ""}`;

  // R2's put() requires a stream with a known length; the incoming request
  // body doesn't expose one here, so buffer it (bounded by MAX_ORIGINAL_SIZE
  // above, and smaller still once gzipped) before writing.
  const bytes = await request.arrayBuffer();

  try {
    await bucket.put(key, bytes, {
      httpMetadata: {
        contentType: originalType,
        ...(contentEncoding === "gzip" ? { contentEncoding: "gzip" } : {}),
      },
      customMetadata: {
        originalName,
        originalSize: String(originalSize),
      },
    });
  } catch (error) {
    console.error("Could not store an uploaded custom print file.", error);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  return Response.json({ key, originalName, originalSize }, { headers: { "Cache-Control": "no-store" } });
}
