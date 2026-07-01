import { test, expect } from "../fixtures/test";

test.describe("API latency budgets", () => {
  test("public share not-found response returns quickly", async ({ request }) => {
    const started = performance.now();
    const response = await request.get("/api/share/latency-probe-missing");
    const duration = performance.now() - started;

    expect(response.status()).toBe(404);
    expect(duration).toBeLessThan(1_500);
  });

  test("unauthorized protected API short-circuits quickly", async ({ request }) => {
    const started = performance.now();
    const response = await request.post("/api/analysis", { data: { timeRange: "medium_term" } });
    const duration = performance.now() - started;

    expect(response.status()).toBe(401);
    expect(duration).toBeLessThan(1_500);
  });
});
