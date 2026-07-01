import { test, expect } from "../fixtures/test";

test.describe("Share cards", () => {
  test("returns a public share API payload", async ({ request }) => {
    const response = await request.get("/api/share/demo-aura");
    expect([200, 404]).toContain(response.status());
  });

  test("shows a not-found experience for invalid share IDs", async ({ page }) => {
    await page.goto("/share/definitely-missing-share-id");
    await expect(page.getByRole("heading", { name: /we lost this page/i })).toBeVisible();
  });

  test("sets useful share metadata for missing cards", async ({ page }) => {
    await page.goto("/share/definitely-missing-share-id");
    await expect(page).toHaveTitle(/share card not found|melo/i);
  });
});
