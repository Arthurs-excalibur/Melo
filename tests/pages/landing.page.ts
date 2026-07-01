import type { Page } from "@playwright/test";
import { expect } from "../fixtures/test";

export class LandingPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/");
  }

  get heroHeading() {
    return this.page.getByRole("heading", { name: /your music taste/i });
  }

  get spotifyCtas() {
    return this.page.getByRole("button", { name: /connect spotify/i });
  }

  get howItWorksLink() {
    return this.page.getByRole("link", { name: /see how it works/i });
  }

  async expectLoaded() {
    await expect(this.heroHeading).toBeVisible();
    await expect(this.spotifyCtas.first()).toBeVisible();
    await expect(this.page.getByText("Spotify-Powered Music Intelligence")).toBeVisible();
  }

  async openFaq(question: string) {
    const button = this.page.getByRole("button", { name: new RegExp(question, "i") });
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
  }
}
