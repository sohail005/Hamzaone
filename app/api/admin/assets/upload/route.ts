import { checkRateLimit, getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getR2, getWorkerEnv, slugify } from "@/lib/server/kv";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const ALLOWED_VIDEO_EXTENSIONS = new Set(["mp4", "webm"]);
const ALLOWED_FOLDERS = new Set(["categories", "hero", "custom-creation-categories", "products"]);

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
  // MP4/MOV family: an "ftyp" box starting at byte offset 4.
  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70
  ) {
    return "video/mp4";
  }
  // WebM/Matroska: EBML header.
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return "video/webm";
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

  // Short product videos are only accepted for the "products" folder — other
  // folders (category tiles, hero banners) are image-only.
  const isVideo = folder === "products" && ALLOWED_VIDEO_EXTENSIONS.has(ext);
  if (!isVideo && !ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return Response.json({ error: "Only JPG, JPEG, PNG, WEBP images or MP4/WEBM videos are allowed." }, { status: 400 });
  }
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  const sizeErrorMessage = isVideo ? "Videos must be 50 MB or smaller." : "Images must be 5 MB or smaller.";
  if (!originalSize || originalSize > maxSize) {
    return Response.json({ error: sizeErrorMessage }, { status: 400 });
  }

  const buffer = await request.arrayBuffer();
  if (buffer.byteLength > maxSize) {
    return Response.json({ error: sizeErrorMessage }, { status: 400 });
  }

  const bytes = new Uint8Array(buffer);
  const mimeType = detectMimeType(bytes);
  if (!mimeType) {
    return Response.json({ error: "File content does not match an allowed image or video format." }, { status: 400 });
  }
  if (isVideo !== mimeType.startsWith("video/")) {
    return Response.json({ error: "File content does not match its extension." }, { status: 400 });
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
