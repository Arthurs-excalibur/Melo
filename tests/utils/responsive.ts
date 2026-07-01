import { expect, type Page } from "@playwright/test";

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;
    return documentElement.scrollWidth - documentElement.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

export async function expectPrimaryControlsClickable(page: Page) {
  const buttons = await page.getByRole("button").all();
  for (const button of buttons.slice(0, 8)) {
    await expect(button).toBeEnabled();
    const box = await button.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 0).toBeGreaterThan(0);
  }
}
