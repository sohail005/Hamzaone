import { checkRateLimit, getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getR2, getWorkerEnv, slugify } from "@/lib/server/kv";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const ALLOWED_FOLDERS = new Set(["categories", "hero"]);

function detectMimeType(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export async function POST(request: Request) {
  const authKv = await getAuthKV();
  const user = authKv ? await getUserFromRequestCookie(authKv, request) : null;
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  if (authKv) {
    const allowed = await checkRateLimit(authKv, `admin-assets-upload:${ip}`, 40);
    if (!allowed) {
      return Response.json({ error: "Too many uploads. Try again in a minute." }, { status: 429 });
    }
  }

  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder") ?? "";
  if (!ALLOWED_FOLDERS.has(folder)) {
    return Response.json({ error: "Invalid upload folder." }, { status: 400 });
  }

  const originalName = decodeURIComponent(request.headers.get("x-original-name") ?? "image");
  const originalSize = Number(request.headers.get("x-original-size") ?? "0");
  const ext = (originalName.split(".").pop() ?? "").toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return Response.json({ error: "Only JPG, JPEG, PNG and WEBP images are allowed." }, { status: 400 });
  }
  if (!originalSize || originalSize > MAX_SIZE) {
    return Response.json({ error: "Images must be 5 MB or smaller." }, { status: 400 });
  }

  const buffer = await request.arrayBuffer();
  if (buffer.byteLength > MAX_SIZE) {
    return Response.json({ error: "Images must be 5 MB or smaller." }, { status: 400 });
  }

  const bytes = new Uint8Array(buffer);
  const mimeType = detectMimeType(bytes);
  if (!mimeType) {
    return Response.json({ error: "File content does not match an allowed image format." }, { status: 400 });
  }

  const env = await getWorkerEnv();
  const bucket = getR2(env, "CUSTOM_CREATIONS_FILES");
  if (!bucket) {
    return Response.json({ error: "Upload storage is not configured." }, { status: 503 });
  }

  const basename = slugify(originalName.replace(/\.[^.]+$/, "")) || "image";
  const storageKey = `site-assets/${folder}/${Date.now()}-${crypto.randomUUID()}-${basename}.${ext}`;

  await bucket.put(storageKey, buffer, {
    httpMetadata: { contentType: mimeType },
    customMetadata: { originalName, originalSize: String(originalSize) },
  });

  return Response.json({ storageKey, mimeType });
}
