import { test, expect } from "../fixtures/test";
import { DashboardPage } from "../pages/dashboard.page";

test.describe("Playlist export", () => {
  test("creates a playlist from the revealed aura and shows success", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await dashboard.revealAura();

    const popupPromise = authenticatedPage.waitForEvent("popup").catch(() => null);
    await authenticatedPage.getByRole("button", { name: /export aura playlist/i }).click();
    await popupPromise;
    await expect(authenticatedPage.getByRole("button", { name: /opened in spotify/i })).toBeVisible();
  });

  test("prompts re-authentication when playlist scopes are missing", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();
    await authenticatedPage.route("**/api/export-playlist", (route) =>
      route.fulfill({
        status: 403,
        json: {
          error: "REAUTH_REQUIRED",
          message: "Your session is missing playlist permissions.",
        },
      })
    );

    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await dashboard.revealAura();
    await authenticatedPage.getByRole("button", { name: /export aura playlist/i }).click();

    await expect(authenticatedPage.getByRole("heading", { name: /playlist creation failed/i })).toBeVisible();
    await expect(authenticatedPage.getByRole("button", { name: /sign out & re-authenticate/i })).toBeVisible();
  });
});
