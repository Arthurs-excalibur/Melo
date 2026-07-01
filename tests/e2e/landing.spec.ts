import { test, expect } from "../fixtures/test";
import { LandingPage } from "../pages/landing.page";

test.describe("Landing", () => {
  test("loads the hero, feature sections, FAQ, and footer links", async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.goto();
    await landing.expectLoaded();

    await landing.howItWorksLink.click();
    await expect(page.locator("#how-it-works")).toBeInViewport();

    await expect(page.getByText(/how it works/i).first()).toBeVisible();
    await expect(page.getByText(/personalities/i).first()).toBeVisible();
    await landing.openFaq("What data does Melo access?");
    await expect(page.getByText(/top tracks, top artists/i)).toBeVisible();

    await expect(page.getByRole("link", { name: /view demo/i })).toHaveAttribute("href", "/share/demo-aura");
    await expect(page.getByText(/privacy-first/i).last()).toBeVisible();
  });

  test("Spotify CTA starts the NextAuth Spotify sign-in flow", async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.goto();

    const signInRequest = page.waitForRequest((request) =>
      request.url().includes("/api/auth/signin/spotify") && request.method() === "POST"
    );
    await landing.spotifyCtas.first().click();
    await signInRequest;
  });
});
