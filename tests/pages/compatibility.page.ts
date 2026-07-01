import type { Page } from "@playwright/test";
import { expect } from "../fixtures/test";

export class CompatibilityPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/compatibility");
  }

  async compare(shareId = "demo-aura") {
    await this.page.getByPlaceholder(/share\/abc123/i).fill(shareId);
    await this.page.getByRole("button", { name: /compare/i }).click();
  }

  async expectResult() {
    await expect(this.page.getByText("Compatibility Result")).toBeVisible();
    await expect(this.page.getByRole("heading", { name: /cosmic match/i })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: /compatibility breakdown/i })).toBeVisible();
  }
}
