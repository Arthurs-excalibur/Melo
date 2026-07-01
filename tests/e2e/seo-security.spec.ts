import { test, expect } from "../fixtures/test";

test.describe("SEO and security", () => {
  test("renders core metadata and social sharing tags on landing", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/melo/i);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /emotional soundtrack/i);
    await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
  });

  test("robots and sitemap endpoints are either present or intentionally absent", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect([200, 404]).toContain(robots.status());

    const sitemap = await request.get("/sitemap.xml");
    expect([200, 404]).toContain(sitemap.status());
  });

  test("authentication APIs use secure cookie flags during sign-in setup", async ({ request }) => {
    const response = await request.get("/api/auth/csrf");
    expect(response.status()).toBe(200);
    const setCookie = response.headers()["set-cookie"] ?? "";
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
  });

  test("does not expose mixed-content links on the landing page", async ({ page }) => {
    await page.goto("/");
    const insecureLinks = await page.locator('a[href^="http://"]').count();
    expect(insecureLinks).toBe(0);
  });
});
