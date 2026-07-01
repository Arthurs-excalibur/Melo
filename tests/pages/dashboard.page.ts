import type { Page } from "@playwright/test";
import { expect } from "../fixtures/test";

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/dashboard");
  }

  async revealAura() {
    await this.page.getByRole("button", { name: /reveal my aura/i }).click();
  }

  async expectAnalysisLoaded() {
    await expect(this.page.getByRole("button", { name: /reveal my aura/i })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: /velvet voyager/i })).toBeAttached();
  }

  async expectRevealedDashboard() {
    await expect(this.page.getByRole("heading", { name: /velvet voyager/i })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: /interactive music universe/i })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: /top songs/i })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: /top artists/i })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: /emotional journey/i })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: /audio dna/i })).toBeVisible();
  }
}
