import type { Page } from "@playwright/test";
import { expect } from "../fixtures/test";

export class SettingsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/settings");
  }

  async expectLoaded() {
    await expect(this.page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: "Profile" })).toBeVisible();
    await expect(this.page.getByText("Connected to Spotify")).toBeVisible();
    await expect(this.page.getByRole("button", { name: /sign out/i })).toBeVisible();
    await expect(this.page.getByRole("button", { name: /delete data/i })).toBeVisible();
  }
}
