import { CUSTOM_CREATION_STATUSES, type CustomCreationStatus } from "./custom-creations-types";

export { CUSTOM_CREATION_STATUSES };

const ALLOWED_TRANSITIONS: Record<CustomCreationStatus, CustomCreationStatus[]> = {
  PENDING_REVIEW: ["UNDER_REVIEW", "REJECTED", "CANCELLED"],
  UNDER_REVIEW: ["QUOTATION_SENT", "REJECTED", "CANCELLED"],
  QUOTATION_SENT: ["CUSTOMER_APPROVED", "REJECTED", "CANCELLED"],
  CUSTOMER_APPROVED: ["PAYMENT_PENDING", "CANCELLED"],
  PAYMENT_PENDING: ["PAID", "CANCELLED"],
  PAID: ["IN_PRODUCTION", "CANCELLED"],
  IN_PRODUCTION: ["QUALITY_CHECK", "CANCELLED"],
  QUALITY_CHECK: ["READY_TO_SHIP", "IN_PRODUCTION", "CANCELLED"],
  READY_TO_SHIP: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function isValidStatus(value: string): value is CustomCreationStatus {
  return (CUSTOM_CREATION_STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: CustomCreationStatus, to: CustomCreationStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function allowedNextStatuses(from: CustomCreationStatus): CustomCreationStatus[] {
  return ALLOWED_TRANSITIONS[from];
}
