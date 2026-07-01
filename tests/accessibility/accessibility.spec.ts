import { test } from "../fixtures/test";
import { DashboardPage } from "../pages/dashboard.page";
import { CompatibilityPage } from "../pages/compatibility.page";

test.describe("Accessibility", () => {
  test("landing page has no critical axe violations", async ({ page, runAxe }) => {
    await page.goto("/");
    await runAxe();
  });

  test("dashboard revealed state has no critical axe violations", async ({ authenticatedPage, mockMeloApis, runAxe }) => {
    await mockMeloApis();
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await dashboard.revealAura();
    await runAxe("main");
  });

  test("compatibility form and result are keyboard accessible", async ({ authenticatedPage, mockMeloApis, runAxe }) => {
    await mockMeloApis();
    const compatibility = new CompatibilityPage(authenticatedPage);
    await compatibility.goto();
    await authenticatedPage.keyboard.press("Tab");
    await compatibility.compare("demo-aura");
    await compatibility.expectResult();
    await runAxe("main");
  });
});
