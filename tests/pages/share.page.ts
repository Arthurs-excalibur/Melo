import type { Page } from "@playwright/test";
import { expect } from "../fixtures/test";

export class SharePage {
  constructor(private readonly page: Page) {}

  async goto(id = "demo-aura") {
    await this.page.goto(`/share/${id}`);
  }

  async expectLoaded() {
    await expect(this.page.getByRole("heading", { name: /your identity card/i })).toBeVisible();
    await expect(this.page.getByRole("heading", { name: /velvet voyager/i })).toBeVisible();
    await expect(this.page.getByText(/emerald aura/i)).toBeVisible();
  }
}
