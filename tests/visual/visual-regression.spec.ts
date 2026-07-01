import { test, expect } from "../fixtures/test";
import { DashboardPage } from "../pages/dashboard.page";
import { CompatibilityPage } from "../pages/compatibility.page";
import { SettingsPage } from "../pages/settings.page";

test.describe("Visual regression", () => {
  test("landing", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("landing.png", { fullPage: true, animations: "disabled" });
  });

  test("dashboard aura reveal", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await dashboard.revealAura();
    await expect(authenticatedPage).toHaveScreenshot("dashboard-aura.png", { fullPage: true, animations: "disabled" });
  });

  test("compatibility result", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();
    const compatibility = new CompatibilityPage(authenticatedPage);
    await compatibility.goto();
    await compatibility.compare("demo-aura");
    await compatibility.expectResult();
    await expect(authenticatedPage).toHaveScreenshot("compatibility-result.png", { fullPage: true, animations: "disabled" });
  });

  test("settings", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();
    const settings = new SettingsPage(authenticatedPage);
    await settings.goto();
    await expect(authenticatedPage).toHaveScreenshot("settings.png", { fullPage: true, animations: "disabled" });
  });

  test("error page", async ({ page }) => {
    await page.goto("/missing-page-for-visual-baseline");
    await expect(page).toHaveScreenshot("not-found.png", { fullPage: true, animations: "disabled" });
  });
});
