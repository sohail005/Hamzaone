export const CUSTOM_CREATION_STATUSES = [
  "PENDING_REVIEW",
  "UNDER_REVIEW",
  "QUOTATION_SENT",
  "CUSTOMER_APPROVED",
  "PAYMENT_PENDING",
  "PAID",
  "IN_PRODUCTION",
  "QUALITY_CHECK",
  "READY_TO_SHIP",
  "SHIPPED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
] as const;

export type CustomCreationStatus = (typeof CUSTOM_CREATION_STATUSES)[number];

export type QuotationStatus = "draft" | "sent" | "accepted" | "declined";

export type CustomCreationRequest = {
  id: string;
  requestNumber: string;
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
  status: CustomCreationStatus;
  quotedPrice: number | null;
  productionDays: number | null;
  deliveryCharges: number | null;
  finalAmount: number | null;
  adminNotes: string | null;
  quotationValidUntil: string | null;
  paymentStatus: "unpaid" | "paid";
  convertedOrderId: string | null;
  razorpayOrderId: string | null;
  trackingToken: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomCreationImage = {
  id: string;
  requestId: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
};

export type CustomCreationHistoryEntry = {
  id: string;
  requestId: string;
  previousStatus: CustomCreationStatus | null;
  newStatus: CustomCreationStatus;
  changedBy: string;
  note: string | null;
  createdAt: string;
};

export type CustomCreationQuotation = {
  id: string;
  requestId: string;
  version: number;
  designCost: number;
  printingCost: number;
  finishingCost: number;
  additionalCharges: number;
  deliveryCharges: number;
  discount: number;
  finalAmount: number;
  productionDays: number;
  validUntil: string;
  customerMessage: string | null;
  secureToken: string;
  status: QuotationStatus;
  createdBy: string;
  createdAt: string;
};
