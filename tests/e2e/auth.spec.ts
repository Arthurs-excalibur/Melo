import { test, expect } from "../fixtures/test";
import { DashboardPage } from "../pages/dashboard.page";
import { SettingsPage } from "../pages/settings.page";

test.describe("Authentication", () => {
  test("redirects unauthorized dashboard users to the landing page", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: /your music taste/i })).toBeVisible();
  });

  test("persists a valid session across protected dashboard and settings routes", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();

    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await dashboard.expectAnalysisLoaded();

    await authenticatedPage.getByLabel("Settings").click();
    const settings = new SettingsPage(authenticatedPage);
    await settings.expectLoaded();
  });

  test("surfaces expired-session API failures as a retryable dashboard error", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();
    await authenticatedPage.route("**/api/analysis", (route) =>
      route.fulfill({ status: 401, json: { error: "Unauthorized" } })
    );

    await authenticatedPage.goto("/dashboard");
    await expect(authenticatedPage.getByText(/failed to start analysis/i)).toBeVisible();
    await expect(authenticatedPage.getByRole("button", { name: /try again/i })).toBeVisible();
  });
});
