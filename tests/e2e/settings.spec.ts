import { test, expect } from "../fixtures/test";
import { SettingsPage } from "../pages/settings.page";

test.describe("Settings", () => {
  test("loads profile, theme controls, sign-out, and delete-data actions", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();
    const settings = new SettingsPage(authenticatedPage);
    await settings.goto();
    await settings.expectLoaded();

    await authenticatedPage.getByRole("button", { name: /show themes/i }).click();
    await expect(authenticatedPage.getByText(/appearance/i)).toBeVisible();
  });

  test("confirms before deleting account data", async ({ authenticatedPage, mockMeloApis }) => {
    await mockMeloApis();
    const settings = new SettingsPage(authenticatedPage);
    await settings.goto();

    authenticatedPage.on("dialog", async (dialog) => {
      expect(dialog.message()).toMatch(/delete all your Melo data/i);
      await dialog.dismiss();
    });
    await authenticatedPage.getByRole("button", { name: /delete data/i }).click();
  });
});
