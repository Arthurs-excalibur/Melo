import { test, expect } from "../fixtures/test";
import { DashboardPage } from "../pages/dashboard.page";
import { expectNoHorizontalOverflow, expectPrimaryControlsClickable } from "../utils/responsive";

test.describe("Responsive behavior", () => {
  test("landing has no horizontal overflow and keeps CTAs clickable", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /your music taste/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectPrimaryControlsClickable(page);
  });

  test("dashboard charts and galaxy scale in the active viewport", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await dashboard.revealAura();

    await expect(authenticatedPage.locator("canvas")).toBeVisible();
    await expect(authenticatedPage.locator(".recharts-responsive-container").first()).toBeVisible();
    await expectNoHorizontalOverflow(authenticatedPage);
  });
});
