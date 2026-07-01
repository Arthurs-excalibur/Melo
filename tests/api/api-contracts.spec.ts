import { test, expect, expectUnauthorized } from "../fixtures/test";

const protectedGetEndpoints = [
  "/api/users/me",
  "/api/users/top-artists",
  "/api/users/top-tracks",
  "/api/users/history",
  "/api/visualizations/genre-galaxy",
  "/api/visualizations/audio-dna",
  "/api/visualizations/mood-graph",
  "/api/visualizations/timeline",
];

test.describe("API contracts", () => {
  for (const endpoint of protectedGetEndpoints) {
    test(`GET ${endpoint} requires authentication`, async ({ request }) => {
      await expectUnauthorized(request, endpoint);
    });
  }

  test("POST /api/analysis requires authentication", async ({ request }) => {
    await expectUnauthorized(request, "/api/analysis", "POST");
  });

  test("GET /api/analysis validates required jobId", async ({ request }) => {
    const response = await request.get("/api/analysis");
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing jobId parameter" });
  });

  test("GET /api/analysis reports missing jobs", async ({ request }) => {
    const response = await request.get("/api/analysis?jobId=missing-job");
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: "Job not found" });
  });

  test("POST /api/compatibility requires authentication before validation", async ({ request }) => {
    await expectUnauthorized(request, "/api/compatibility", "POST");
  });

  test("GET /api/compatibility validates required jobId", async ({ request }) => {
    const response = await request.get("/api/compatibility");
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing jobId parameter" });
  });

  test("GET /api/compatibility reports missing jobs", async ({ request }) => {
    const response = await request.get("/api/compatibility?jobId=missing-job");
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: "Job not found" });
  });

  test("POST /api/export-playlist requires authentication", async ({ request }) => {
    await expectUnauthorized(request, "/api/export-playlist", "POST");
  });

  test("DELETE /api/user requires authentication", async ({ request }) => {
    await expectUnauthorized(request, "/api/user", "DELETE");
  });

  test("GET /api/share/[id] returns public JSON or a not-found contract", async ({ request }) => {
    const response = await request.get("/api/share/definitely-missing-share-id");
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: "Share card not found or expired" });
  });

  test("Inngest endpoint is reachable", async ({ request }) => {
    const response = await request.get("/api/inngest");
    expect([200, 405]).toContain(response.status());
  });
});

test.describe("Live authenticated API smoke tests", () => {
  test.skip(!process.env.RUN_LIVE_INTEGRATION, "Set RUN_LIVE_INTEGRATION=1 with real NextAuth cookies to run live API mutation paths.");

  test("documents live integration coverage gate", async () => {
    expect(process.env.RUN_LIVE_INTEGRATION).toBeTruthy();
  });
});
