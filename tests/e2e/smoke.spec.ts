import { test, expect } from "@playwright/test";

test("homepage loads and links to the shop", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /shop the collection/i })).toBeVisible();
});

test("shop page lists products that link to a detail page", async ({ page }) => {
  await page.goto("/shop");
  const firstProduct = page.locator("a[href^='/products/']").first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();
  await expect(page).toHaveURL(/\/products\//);
});

test("admin routes redirect unauthenticated visitors to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});

test("account routes redirect unauthenticated visitors to login", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login/);
});

test("sitemap and robots are served", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Disallow");
});
