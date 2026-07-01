import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
    ["list"],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXTAUTH_URL: baseURL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "melo-playwright-secret",
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ?? "playwright-client-id",
      SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ?? "playwright-client-secret",
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "iPhone SE", use: { ...devices["iPhone SE"] } },
    { name: "iPhone 15", use: { ...devices["iPhone 15"] } },
    { name: "Pixel 8", use: { ...devices["Pixel 7"], viewport: { width: 412, height: 915 } } },
    { name: "Galaxy S24", use: { ...devices["Galaxy S9+"], viewport: { width: 384, height: 854 } } },
    { name: "iPad Mini", use: { ...devices["iPad Mini"] } },
    { name: "iPad Pro", use: { ...devices["iPad Pro 11"] } },
    { name: "desktop-1366", use: { browserName: "chromium", viewport: { width: 1366, height: 768 } } },
    { name: "desktop-1440", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
    { name: "desktop-1920", use: { browserName: "chromium", viewport: { width: 1920, height: 1080 } } },
    { name: "desktop-2560", use: { browserName: "chromium", viewport: { width: 2560, height: 1440 } } },
  ],
});
