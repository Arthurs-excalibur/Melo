import { test, expect } from "../fixtures/test";
import { CompatibilityPage } from "../pages/compatibility.page";

test.describe("Compatibility", () => {
  test("compares against a friend share link and displays the score breakdown", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();
    const compatibility = new CompatibilityPage(authenticatedPage);

    await compatibility.goto();
    await compatibility.compare("https://melo.app/share/demo-aura");
    await compatibility.expectResult();
    await expect(authenticatedPage.getByText("86")).toBeVisible();
    await expect(authenticatedPage.getByText(/genre dna/i)).toBeVisible();
  });

  test("validates missing share IDs and displays API errors", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();
    const compatibility = new CompatibilityPage(authenticatedPage);
    await compatibility.goto();

    await authenticatedPage.getByRole("button", { name: /compare/i }).click({ force: true });
    await expect(authenticatedPage.getByRole("button", { name: /compare/i })).toBeDisabled();

    await authenticatedPage.route("**/api/compatibility", (route) =>
      route.fulfill({ status: 404, json: { error: "Share card not found or expired" } })
    );
    await compatibility.compare("missing-share");
    await expect(authenticatedPage.getByText(/share card not found or expired/i)).toBeVisible();
  });
});
