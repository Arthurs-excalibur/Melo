import { test, expect } from "../fixtures/test";
import { mockAnalysis, emptyAnalysis } from "../fixtures/melo-data";
import { DashboardPage } from "../pages/dashboard.page";

test.describe("Dashboard and AI analysis workflow", () => {
  test("runs cached analysis, reveals aura, renders profile, charts, tracks, and artists", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis({ analysis: mockAnalysis });
    const dashboard = new DashboardPage(authenticatedPage);

    await dashboard.goto();
    await expect(authenticatedPage.getByText(/enqueuing sonic profiling/i)).toBeVisible();
    await dashboard.expectAnalysisLoaded();
    await dashboard.revealAura();
    await dashboard.expectRevealedDashboard();

    await expect(authenticatedPage.getByText("Avery Listener")).toBeVisible();
    await expect(authenticatedPage.getByText("Saturn")).toBeVisible();
    await expect(authenticatedPage.getByText("SZA").first()).toBeVisible();
    await expect(authenticatedPage.getByRole("button", { name: /copy my share link/i })).toBeVisible();
    await expect(authenticatedPage.getByRole("button", { name: /export aura playlist/i })).toBeVisible();
  });

  test("handles analysis failures and retry behavior", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();
    let attempts = 0;
    await authenticatedPage.route("**/api/analysis", (route) => {
      attempts += 1;
      if (attempts === 1) {
        return route.fulfill({ status: 500, json: { error: "Failed AI response" } });
      }
      return route.fulfill({ json: mockAnalysis });
    });

    await authenticatedPage.goto("/dashboard");
    await expect(authenticatedPage.getByText(/failed to start analysis/i)).toBeVisible();
    await authenticatedPage.getByRole("button", { name: /try again/i }).click();
    await expect(authenticatedPage.getByRole("button", { name: /reveal my aura/i })).toBeVisible();
  });

  test("renders empty listening states without crashing visualizations", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis({ analysis: emptyAnalysis });
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await dashboard.revealAura();

    await expect(authenticatedPage.getByText(/no track data available/i)).toBeVisible();
    await expect(authenticatedPage.getByText(/no listening data found/i)).toBeVisible();
    await expect(authenticatedPage.locator("canvas")).toBeVisible();
  });
});
