import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/server/auth";

describe("password hashing", () => {
  it("verifies a password against its own hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    await expect(verifyPassword("correct-horse-battery-staple", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("produces a different hash each time due to a random salt", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
  });

  it("rejects a malformed stored hash instead of throwing", async () => {
    await expect(verifyPassword("anything", "not-a-valid-hash")).resolves.toBe(false);
  });
});
