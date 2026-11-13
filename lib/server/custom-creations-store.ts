import type { D1Database } from "./d1";
import { canTransition, isValidStatus } from "./custom-creations-status";
import type {
  CustomCreationHistoryEntry,
  CustomCreationImage,
  CustomCreationQuotation,
  CustomCreationRequest,
  CustomCreationStatus,
  QuotationStatus,
} from "./custom-creations-types";

type RequestRow = {
  id: string;
  request_number: string;
  customer_id: string | null;
  customer_name: string;
  email: string;
  phone: string;
  whatsapp_number: string | null;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  project_name: string;
  category: string;
  description: string;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  dimensions_not_sure: number;
  quantity: number;
  preferred_material: string | null;
  preferred_color: string | null;
  custom_color_description: string | null;
  finishing_requirement: string | null;
  intended_purpose: string | null;
  expected_budget: number | null;
  required_by_date: string | null;
  additional_instructions: string | null;
  status: string;
  quoted_price: number | null;
  production_days: number | null;
  delivery_charges: number | null;
  final_amount: number | null;
  admin_notes: string | null;
  quotation_valid_until: string | null;
  payment_status: string;
  converted_order_id: string | null;
  razorpay_order_id: string | null;
  tracking_token: string;
  created_at: string;
  updated_at: string;
};

type ImageRow = {
  id: string;
  request_id: string;
  storage_key: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

type HistoryRow = {
  id: string;
  request_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string;
  note: string | null;
  created_at: string;
};

type QuotationRow = {
  id: string;
  request_id: string;
  version: number;
  design_cost: number;
  printing_cost: number;
  finishing_cost: number;
  additional_charges: number;
  delivery_charges: number;
  discount: number;
  final_amount: number;
  production_days: number;
  valid_until: string;
  customer_message: string | null;
  secure_token: string;
  status: string;
  created_by: string;
  created_at: string;
};

function requestFromRow(row: RequestRow): CustomCreationRequest {
  return {
    id: row.id,
    requestNumber: row.request_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    whatsappNumber: row.whatsapp_number,
    deliveryCity: row.delivery_city,
    deliveryState: row.delivery_state,
    deliveryPincode: row.delivery_pincode,
    projectName: row.project_name,
    category: row.category,
    description: row.description,
    lengthMm: row.length_mm,
    widthMm: row.width_mm,
    heightMm: row.height_mm,
    dimensionsNotSure: !!row.dimensions_not_sure,
    quantity: row.quantity,
    preferredMaterial: row.preferred_material,
    preferredColor: row.preferred_color,
    customColorDescription: row.custom_color_description,
    finishingRequirement: row.finishing_requirement,
    intendedPurpose: row.intended_purpose,
    expectedBudget: row.expected_budget,
    requiredByDate: row.required_by_date,
    additionalInstructions: row.additional_instructions,
    status: row.status as CustomCreationStatus,
    quotedPrice: row.quoted_price,
    productionDays: row.production_days,
    deliveryCharges: row.delivery_charges,
    finalAmount: row.final_amount,
    adminNotes: row.admin_notes,
    quotationValidUntil: row.quotation_valid_until,
    paymentStatus: row.payment_status as "unpaid" | "paid",
    convertedOrderId: row.converted_order_id,
    razorpayOrderId: row.razorpay_order_id,
    trackingToken: row.tracking_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function imageFromRow(row: ImageRow): CustomCreationImage {
  return {
    id: row.id,
    requestId: row.request_id,
    storageKey: row.storage_key,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    createdAt: row.created_at,
  };
}

function historyFromRow(row: HistoryRow): CustomCreationHistoryEntry {
  return {
    id: row.id,
    requestId: row.request_id,
    previousStatus: row.previous_status as CustomCreationStatus | null,
    newStatus: row.new_status as CustomCreationStatus,
    changedBy: row.changed_by,
    note: row.note,
    createdAt: row.created_at,
  };
}

function quotationFromRow(row: QuotationRow): CustomCreationQuotation {
  return {
    id: row.id,
    requestId: row.request_id,
    version: row.version,
    designCost: row.design_cost,
    printingCost: row.printing_cost,
    finishingCost: row.finishing_cost,
    additionalCharges: row.additional_charges,
    deliveryCharges: row.delivery_charges,
    discount: row.discount,
    finalAmount: row.final_amount,
    productionDays: row.production_days,
    validUntil: row.valid_until,
    customerMessage: row.customer_message,
    secureToken: row.secure_token,
    status: row.status as QuotationStatus,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function randomToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateRequestNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `CC-${year}-${suffix}`;
}

export type CreateRequestInput = {
  customerId: string | null;
  customerName: string;
  email: string;
  phone: string;
  whatsappNumber: string | null;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  projectName: string;
  category: string;
  description: string;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  dimensionsNotSure: boolean;
  quantity: number;
  preferredMaterial: string | null;
  preferredColor: string | null;
  customColorDescription: string | null;
  finishingRequirement: string | null;
  intendedPurpose: string | null;
  expectedBudget: number | null;
  requiredByDate: string | null;
  additionalInstructions: string | null;
  images: { storageKey: string; originalFilename: string; mimeType: string; fileSize: number }[];
};

export async function createRequest(db: D1Database, input: CreateRequestInput): Promise<CustomCreationRequest> {
  const id = crypto.randomUUID();
  const requestNumber = generateRequestNumber();
  const trackingToken = randomToken();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO custom_print_requests (
        id, request_number, customer_id, customer_name, email, phone, whatsapp_number,
        delivery_city, delivery_state, delivery_pincode, project_name, category, description,
        length_mm, width_mm, height_mm, dimensions_not_sure, quantity, preferred_material,
        preferred_color, custom_color_description, finishing_requirement, intended_purpose,
        expected_budget, required_by_date, additional_instructions, status, payment_status,
        tracking_token, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id,
      requestNumber,
      input.customerId,
      input.customerName,
      input.email,
      input.phone,
      input.whatsappNumber,
      input.deliveryCity,
      input.deliveryState,
      input.deliveryPincode,
      input.projectName,
      input.category,
      input.description,
      input.lengthMm,
      input.widthMm,
      input.heightMm,
      input.dimensionsNotSure ? 1 : 0,
      input.quantity,
      input.preferredMaterial,
      input.preferredColor,
      input.customColorDescription,
      input.finishingRequirement,
      input.intendedPurpose,
      input.expectedBudget,
      input.requiredByDate,
      input.additionalInstructions,
      "PENDING_REVIEW",
      "unpaid",
      trackingToken,
      now,
      now,
    )
    .run();

  for (const image of input.images) {
    await db
      .prepare(
        `INSERT INTO custom_print_request_images (id, request_id, storage_key, original_filename, mime_type, file_size, created_at)
         VALUES (?,?,?,?,?,?,?)`,
      )
      .bind(crypto.randomUUID(), id, image.storageKey, image.originalFilename, image.mimeType, image.fileSize, now)
      .run();
  }

  await db
    .prepare(
      `INSERT INTO custom_print_request_history (id, request_id, previous_status, new_status, changed_by, note, created_at)
       VALUES (?,?,?,?,?,?,?)`,
    )
    .bind(crypto.randomUUID(), id, null, "PENDING_REVIEW", "system", "Request submitted.", now)
    .run();

  const request = await getRequestById(db, id);
  if (!request) throw new Error("Failed to create request.");
  return request;
}

export async function getRequestById(db: D1Database, id: string): Promise<CustomCreationRequest | null> {
  const row = await db.prepare(`SELECT * FROM custom_print_requests WHERE id = ?`).bind(id).first<RequestRow>();
  return row ? requestFromRow(row) : null;
}

export async function getRequestByNumber(db: D1Database, requestNumber: string): Promise<CustomCreationRequest | null> {
  const row = await db.prepare(`SELECT * FROM custom_print_requests WHERE request_number = ?`).bind(requestNumber).first<RequestRow>();
  return row ? requestFromRow(row) : null;
}

export async function getRequestByTrackingToken(db: D1Database, token: string): Promise<CustomCreationRequest | null> {
  const row = await db.prepare(`SELECT * FROM custom_print_requests WHERE tracking_token = ?`).bind(token).first<RequestRow>();
  return row ? requestFromRow(row) : null;
}

export async function getRequestByRazorpayOrderId(db: D1Database, razorpayOrderId: string): Promise<CustomCreationRequest | null> {
  const row = await db.prepare(`SELECT * FROM custom_print_requests WHERE razorpay_order_id = ?`).bind(razorpayOrderId).first<RequestRow>();
  return row ? requestFromRow(row) : null;
}

export async function setRazorpayOrderId(db: D1Database, requestId: string, razorpayOrderId: string): Promise<void> {
  await db
    .prepare(`UPDATE custom_print_requests SET razorpay_order_id = ?, updated_at = ? WHERE id = ?`)
    .bind(razorpayOrderId, new Date().toISOString(), requestId)
    .run();
}

export type ListRequestsParams = {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function listRequests(db: D1Database, params: ListRequestsParams): Promise<{ requests: CustomCreationRequest[]; total: number }> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const bindings: unknown[] = [];

  if (params.status && isValidStatus(params.status)) {
    conditions.push("status = ?");
    bindings.push(params.status);
  }
  if (params.search) {
    conditions.push("(request_number LIKE ? OR customer_name LIKE ? OR project_name LIKE ? OR email LIKE ?)");
    const like = `%${params.search}%`;
    bindings.push(like, like, like, like);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRow = await db
    .prepare(`SELECT COUNT(*) as count FROM custom_print_requests ${whereClause}`)
    .bind(...bindings)
    .first<{ count: number }>();

  const rows = await db
    .prepare(`SELECT * FROM custom_print_requests ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...bindings, pageSize, offset)
    .all<RequestRow>();

  return {
    requests: rows.results.map(requestFromRow),
    total: countRow?.count ?? 0,
  };
}

export async function countByStatus(db: D1Database): Promise<Record<string, number>> {
  const rows = await db.prepare(`SELECT status, COUNT(*) as count FROM custom_print_requests GROUP BY status`).all<{ status: string; count: number }>();
  const counts: Record<string, number> = {};
  for (const row of rows.results) counts[row.status] = row.count;
  return counts;
}

export async function listImages(db: D1Database, requestId: string): Promise<CustomCreationImage[]> {
  const rows = await db.prepare(`SELECT * FROM custom_print_request_images WHERE request_id = ? ORDER BY created_at ASC`).bind(requestId).all<ImageRow>();
  return rows.results.map(imageFromRow);
}

export async function listHistory(db: D1Database, requestId: string): Promise<CustomCreationHistoryEntry[]> {
  const rows = await db.prepare(`SELECT * FROM custom_print_request_history WHERE request_id = ? ORDER BY created_at ASC`).bind(requestId).all<HistoryRow>();
  return rows.results.map(historyFromRow);
}

export async function updateStatus(
  db: D1Database,
  requestId: string,
  newStatus: CustomCreationStatus,
  changedBy: string,
  note?: string,
): Promise<CustomCreationRequest> {
  const request = await getRequestById(db, requestId);
  if (!request) throw new Error("Request not found.");
  if (!canTransition(request.status, newStatus)) {
    throw new Error(`Cannot transition from ${request.status} to ${newStatus}.`);
  }

  const now = new Date().toISOString();
  await db.prepare(`UPDATE custom_print_requests SET status = ?, updated_at = ? WHERE id = ?`).bind(newStatus, now, requestId).run();
  await db
    .prepare(`INSERT INTO custom_print_request_history (id, request_id, previous_status, new_status, changed_by, note, created_at) VALUES (?,?,?,?,?,?,?)`)
    .bind(crypto.randomUUID(), requestId, request.status, newStatus, changedBy, note ?? null, now)
    .run();

  const updated = await getRequestById(db, requestId);
  if (!updated) throw new Error("Request not found after update.");
  return updated;
}

export async function setAdminNotes(db: D1Database, requestId: string, notes: string): Promise<void> {
  await db.prepare(`UPDATE custom_print_requests SET admin_notes = ?, updated_at = ? WHERE id = ?`).bind(notes, new Date().toISOString(), requestId).run();
}

export type CreateQuotationInput = {
  designCost: number;
  printingCost: number;
  finishingCost: number;
  additionalCharges: number;
  deliveryCharges: number;
  discount: number;
  productionDays: number;
  validUntil: string;
  customerMessage: string | null;
};

export async function createQuotation(db: D1Database, requestId: string, input: CreateQuotationInput, createdBy: string): Promise<CustomCreationQuotation> {
  const existing = await db
    .prepare(`SELECT MAX(version) as maxVersion FROM custom_print_request_quotations WHERE request_id = ?`)
    .bind(requestId)
    .first<{ maxVersion: number | null }>();
  const version = (existing?.maxVersion ?? 0) + 1;
  const finalAmount = input.designCost + input.printingCost + input.finishingCost + input.additionalCharges + input.deliveryCharges - input.discount;

  const id = crypto.randomUUID();
  const secureToken = randomToken();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO custom_print_request_quotations (
        id, request_id, version, design_cost, printing_cost, finishing_cost, additional_charges,
        delivery_charges, discount, final_amount, production_days, valid_until, customer_message,
        secure_token, status, created_by, created_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id,
      requestId,
      version,
      input.designCost,
      input.printingCost,
      input.finishingCost,
      input.additionalCharges,
      input.deliveryCharges,
      input.discount,
      finalAmount,
      input.productionDays,
      input.validUntil,
      input.customerMessage,
      secureToken,
      "draft",
      createdBy,
      now,
    )
    .run();

  const row = await db.prepare(`SELECT * FROM custom_print_request_quotations WHERE id = ?`).bind(id).first<QuotationRow>();
  if (!row) throw new Error("Failed to create quotation.");
  return quotationFromRow(row);
}

export async function listQuotations(db: D1Database, requestId: string): Promise<CustomCreationQuotation[]> {
  const rows = await db.prepare(`SELECT * FROM custom_print_request_quotations WHERE request_id = ? ORDER BY version DESC`).bind(requestId).all<QuotationRow>();
  return rows.results.map(quotationFromRow);
}

export async function getLatestQuotation(db: D1Database, requestId: string): Promise<CustomCreationQuotation | null> {
  const row = await db
    .prepare(`SELECT * FROM custom_print_request_quotations WHERE request_id = ? ORDER BY version DESC LIMIT 1`)
    .bind(requestId)
    .first<QuotationRow>();
  return row ? quotationFromRow(row) : null;
}

export async function getQuotationById(db: D1Database, id: string): Promise<CustomCreationQuotation | null> {
  const row = await db.prepare(`SELECT * FROM custom_print_request_quotations WHERE id = ?`).bind(id).first<QuotationRow>();
  return row ? quotationFromRow(row) : null;
}

export async function getQuotationByToken(db: D1Database, token: string): Promise<CustomCreationQuotation | null> {
  const row = await db.prepare(`SELECT * FROM custom_print_request_quotations WHERE secure_token = ?`).bind(token).first<QuotationRow>();
  return row ? quotationFromRow(row) : null;
}

export async function sendQuotation(db: D1Database, quotationId: string): Promise<void> {
  const row = await db.prepare(`SELECT * FROM custom_print_request_quotations WHERE id = ?`).bind(quotationId).first<QuotationRow>();
  if (!row) throw new Error("Quotation not found.");
  const quotation = quotationFromRow(row);

  await db.prepare(`UPDATE custom_print_request_quotations SET status = 'sent' WHERE id = ?`).bind(quotationId).run();
  await db
    .prepare(
      `UPDATE custom_print_requests SET quoted_price = ?, production_days = ?, delivery_charges = ?, final_amount = ?, quotation_valid_until = ?, status = 'QUOTATION_SENT', updated_at = ? WHERE id = ?`,
    )
    .bind(quotation.finalAmount, quotation.productionDays, quotation.deliveryCharges, quotation.finalAmount, quotation.validUntil, new Date().toISOString(), quotation.requestId)
    .run();
  await db
    .prepare(`INSERT INTO custom_print_request_history (id, request_id, previous_status, new_status, changed_by, note, created_at) VALUES (?,?,?,?,?,?,?)`)
    .bind(crypto.randomUUID(), quotation.requestId, "UNDER_REVIEW", "QUOTATION_SENT", "admin", "Quotation sent.", new Date().toISOString())
    .run();
}

export async function markQuotationAccepted(db: D1Database, quotationId: string): Promise<CustomCreationRequest> {
  const row = await db.prepare(`SELECT * FROM custom_print_request_quotations WHERE id = ?`).bind(quotationId).first<QuotationRow>();
  if (!row) throw new Error("Quotation not found.");
  const quotation = quotationFromRow(row);
  await db.prepare(`UPDATE custom_print_request_quotations SET status = 'accepted' WHERE id = ?`).bind(quotationId).run();
  return updateStatus(db, quotation.requestId, "CUSTOMER_APPROVED", "customer", "Quotation accepted.");
}

export async function markQuotationDeclined(db: D1Database, quotationId: string): Promise<CustomCreationRequest> {
  const row = await db.prepare(`SELECT * FROM custom_print_request_quotations WHERE id = ?`).bind(quotationId).first<QuotationRow>();
  if (!row) throw new Error("Quotation not found.");
  const quotation = quotationFromRow(row);
  await db.prepare(`UPDATE custom_print_request_quotations SET status = 'declined' WHERE id = ?`).bind(quotationId).run();
  return updateStatus(db, quotation.requestId, "REJECTED", "customer", "Quotation declined.");
}

export async function markPaid(db: D1Database, requestId: string): Promise<CustomCreationRequest> {
  await db.prepare(`UPDATE custom_print_requests SET payment_status = 'paid', updated_at = ? WHERE id = ?`).bind(new Date().toISOString(), requestId).run();
  return updateStatus(db, requestId, "PAID", "system", "Payment received.");
}

export async function linkOrder(db: D1Database, requestId: string, orderId: string): Promise<void> {
  await db.prepare(`UPDATE custom_print_requests SET converted_order_id = ?, updated_at = ? WHERE id = ?`).bind(orderId, new Date().toISOString(), requestId).run();
}
