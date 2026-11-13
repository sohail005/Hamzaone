import { checkRateLimit, getAuthKV, getUserFromRequestCookie } from "@/lib/server/auth";
import { getD1 } from "@/lib/server/d1";
import { getWorkerEnv, isRecord } from "@/lib/server/kv";
import { createRequest, type CreateRequestInput } from "@/lib/server/custom-creations-store";
import { CUSTOM_CREATION_CATEGORIES } from "@/data/customCreations";
import { notifyAdminNewRequest, sendRequestReceivedEmail } from "@/lib/server/email-templates/custom-creations";

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const CATEGORY_SLUGS = new Set(CUSTOM_CREATION_CATEGORIES.map((c) => c.slug));

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function num(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  const env = await getWorkerEnv();
  const db = getD1(env);
  if (!db) {
    return Response.json({ error: "Custom Creations storage is not configured." }, { status: 503 });
  }

  const authKv = await getAuthKV();
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  if (authKv) {
    const allowed = await checkRateLimit(authKv, `custom-creations-create:${ip}`, 10);
    if (!allowed) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body)) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const customerName = str(body.customerName);
  const email = str(body.email);
  const phone = str(body.phone);
  const deliveryCity = str(body.deliveryCity);
  const deliveryState = str(body.deliveryState);
  const deliveryPincode = str(body.deliveryPincode);
  const projectName = str(body.projectName) || "Your Custom Creation";
  const category = str(body.category);
  const description = str(body.description);
  const quantity = num(body.quantity) ?? 1;
  const consent = body.consent === true;

  if (!customerName || !email || !phone || !deliveryCity || !deliveryState || !deliveryPincode) {
    return Response.json({ error: "Please complete all required customer information fields." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (!category || !description) {
    return Response.json({ error: "Please complete all required project information fields." }, { status: 400 });
  }
  if (!CATEGORY_SLUGS.has(category)) {
    return Response.json({ error: "Unknown category." }, { status: 400 });
  }
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 1000) {
    return Response.json({ error: "Quantity must be between 1 and 1000." }, { status: 400 });
  }
  if (!consent) {
    return Response.json({ error: "Please confirm the consent checkbox before submitting." }, { status: 400 });
  }

  const imagesInput = Array.isArray(body.images) ? body.images : [];
  if (imagesInput.length > MAX_IMAGES) {
    return Response.json({ error: `A maximum of ${MAX_IMAGES} images is allowed.` }, { status: 400 });
  }

  const images: CreateRequestInput["images"] = [];
  for (const raw of imagesInput) {
    if (!isRecord(raw)) continue;
    const storageKey = str(raw.storageKey);
    const originalFilename = str(raw.originalFilename);
    const mimeType = str(raw.mimeType);
    const fileSize = num(raw.fileSize) ?? 0;
    if (!storageKey.startsWith("custom-creations/pending/")) {
      return Response.json({ error: "Invalid image reference." }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return Response.json({ error: "Only JPG, PNG and WEBP images are allowed." }, { status: 400 });
    }
    if (fileSize <= 0 || fileSize > MAX_IMAGE_SIZE) {
      return Response.json({ error: "Images must be 5 MB or smaller." }, { status: 400 });
    }
    images.push({ storageKey, originalFilename, mimeType, fileSize });
  }

  const dimensionsNotSure = body.dimensionsNotSure === true;
  const whatsappNumber = str(body.whatsappNumber) || null;
  const preferredMaterial = str(body.preferredMaterial) || null;
  const preferredColor = str(body.preferredColor) || null;
  const customColorDescription = str(body.customColorDescription) || null;
  const finishingRequirement = str(body.finishingRequirement) || null;
  const intendedPurpose = str(body.intendedPurpose) || null;
  const additionalInstructions = str(body.additionalInstructions) || null;
  const requiredByDate = str(body.requiredByDate) || null;
  const expectedBudget = num(body.expectedBudget);

  const sessionUser = authKv ? await getUserFromRequestCookie(authKv, request) : null;

  let created;
  try {
    created = await createRequest(db, {
      customerId: sessionUser?.id ?? null,
      customerName,
      email,
      phone,
      whatsappNumber,
      deliveryCity,
      deliveryState,
      deliveryPincode,
      projectName,
      category,
      description,
      lengthMm: dimensionsNotSure ? null : num(body.lengthMm),
      widthMm: dimensionsNotSure ? null : num(body.widthMm),
      heightMm: dimensionsNotSure ? null : num(body.heightMm),
      dimensionsNotSure,
      quantity,
      preferredMaterial,
      preferredColor,
      customColorDescription,
      finishingRequirement,
      intendedPurpose,
      expectedBudget,
      requiredByDate,
      additionalInstructions,
      images,
    });
  } catch (error) {
    console.error("Could not create custom creation request.", error);
    return Response.json({ error: "Could not save your request. Please try again." }, { status: 503 });
  }

  try {
    await Promise.all([
      sendRequestReceivedEmail(env, { email: created.email, customerName: created.customerName, requestNumber: created.requestNumber, projectName: created.projectName }),
      notifyAdminNewRequest(env, { requestNumber: created.requestNumber, customerName: created.customerName, projectName: created.projectName, requestId: created.id }),
    ]);
  } catch (error) {
    console.error("Custom creation request saved, but notification emails failed.", error);
  }

  return Response.json({ requestNumber: created.requestNumber, trackingToken: created.trackingToken }, { status: 201 });
}
