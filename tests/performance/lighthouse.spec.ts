import { test } from "../fixtures/test";
import { runLighthouseAudit } from "../utils/lighthouse";

test.describe("Lighthouse", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Lighthouse runs against Chromium only.");
  test.skip(!process.env.RUN_LIGHTHOUSE, "Set RUN_LIGHTHOUSE=1 to enforce Lighthouse budgets locally or in scheduled CI.");

  test("landing page meets production budgets", async ({ baseURL }) => {
    await runLighthouseAudit(`${baseURL}/`, {
      performance: 90,
      accessibility: 95,
      bestPractices: 95,
      seo: 95,
    });
  });
});
