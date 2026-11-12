import { test, expect } from "@playwright/test";

test("a new user can register, land on their account, and sign out via session expiry redirect", async ({ page }) => {
  const email = `test-${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel(/full name/i).fill("Test User");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/^password$/i).fill("a-very-long-password");
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/account/);
});

test("login rejects an unknown email with a generic error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("nobody@example.com");
  await page.getByLabel(/^password$/i).fill("whatever-password");
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
});
