import { test, expect } from "../fixtures/test";

test.describe("Spotify integration guardrails", () => {
  test("OAuth sign-in endpoint advertises Spotify provider", async ({ request }) => {
    const response = await request.get("/api/auth/providers");
    expect(response.status()).toBe(200);
    const providers = await response.json();
    expect(providers.spotify).toMatchObject({
      id: "spotify",
      name: "Spotify",
      type: "oauth",
    });
  });

  test("session endpoint returns an unauthenticated empty session by default", async ({ request }) => {
    const response = await request.get("/api/auth/session");
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({});
  });
});
