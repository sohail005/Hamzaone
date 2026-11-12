import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:8787",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run cf:preview",
    url: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:8787",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
