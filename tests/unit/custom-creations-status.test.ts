import { describe, expect, it } from "vitest";
import { allowedNextStatuses, canTransition, isValidStatus } from "@/lib/server/custom-creations-status";

describe("custom creations status workflow", () => {
  it("allows the forward happy-path transitions", () => {
    expect(canTransition("PENDING_REVIEW", "UNDER_REVIEW")).toBe(true);
    expect(canTransition("UNDER_REVIEW", "QUOTATION_SENT")).toBe(true);
    expect(canTransition("QUOTATION_SENT", "CUSTOMER_APPROVED")).toBe(true);
    expect(canTransition("CUSTOMER_APPROVED", "PAYMENT_PENDING")).toBe(true);
    expect(canTransition("PAYMENT_PENDING", "PAID")).toBe(true);
    expect(canTransition("PAID", "IN_PRODUCTION")).toBe(true);
    expect(canTransition("IN_PRODUCTION", "QUALITY_CHECK")).toBe(true);
    expect(canTransition("QUALITY_CHECK", "READY_TO_SHIP")).toBe(true);
    expect(canTransition("READY_TO_SHIP", "SHIPPED")).toBe(true);
    expect(canTransition("SHIPPED", "COMPLETED")).toBe(true);
  });

  it("rejects skipping stages", () => {
    expect(canTransition("PENDING_REVIEW", "PAID")).toBe(false);
    expect(canTransition("PENDING_REVIEW", "COMPLETED")).toBe(false);
    expect(canTransition("QUOTATION_SENT", "IN_PRODUCTION")).toBe(false);
  });

  it("rejects transitions out of terminal states", () => {
    expect(allowedNextStatuses("COMPLETED")).toEqual([]);
    expect(allowedNextStatuses("REJECTED")).toEqual([]);
    expect(allowedNextStatuses("CANCELLED")).toEqual([]);
  });

  it("allows cancellation from most active states but not from terminal ones", () => {
    expect(canTransition("PENDING_REVIEW", "CANCELLED")).toBe(true);
    expect(canTransition("IN_PRODUCTION", "CANCELLED")).toBe(true);
    expect(canTransition("COMPLETED", "CANCELLED")).toBe(false);
  });

  it("validates status strings", () => {
    expect(isValidStatus("PENDING_REVIEW")).toBe(true);
    expect(isValidStatus("NOT_A_STATUS")).toBe(false);
  });
});
