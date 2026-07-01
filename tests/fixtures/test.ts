/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect, type Page, type APIRequestContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { encode } from "next-auth/jwt";
import { mockAnalysis, mockCompatibility, mockSession, mockShareCard } from "./melo-data";

type ConsoleNetworkIssue = {
  type: string;
  message: string;
};

type MeloFixtures = {
  issues: ConsoleNetworkIssue[];
  authenticatedPage: Page;
  mockMeloApis: (options?: { analysis?: unknown; compatibility?: unknown }) => Promise<void>;
  runAxe: (selector?: string) => Promise<void>;
};

const ignoredConsolePatterns = [
  /Failed to load resource: the server responded with a status of 404.*favicon/i,
  /Download the React DevTools/i,
];

async function nextAuthCookieValue() {
  return encode({
    secret: process.env.NEXTAUTH_SECRET ?? "melo-playwright-secret",
    token: {
      name: mockSession.user.name,
      email: mockSession.user.email,
      picture: mockSession.user.image,
      accessToken: mockSession.accessToken,
      refreshToken: mockSession.refreshToken,
      accessTokenExpires: Date.now() + 60 * 60 * 1000,
      spotifyId: mockSession.spotifyId,
      scope: mockSession.scope,
      sub: mockSession.spotifyId,
    },
  });
}

async function addAuthCookie(page: Page, baseURL?: string) {
  baseURL ??= "http://127.0.0.1:3000";
  const url = new URL(baseURL);
  await page.context().addCookies([
    {
      name: "next-auth.session-token",
      value: await nextAuthCookieValue(),
      domain: url.hostname,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: url.protocol === "https:",
      expires: Math.floor(Date.now() / 1000) + 60 * 60,
    },
  ]);
}

export const test = base.extend<MeloFixtures>({
  issues: async ({ page }, use) => {
    const issues: ConsoleNetworkIssue[] = [];

    page.on("console", (msg) => {
      if (!["error", "warning"].includes(msg.type())) return;
      const message = msg.text();
      if (ignoredConsolePatterns.some((pattern) => pattern.test(message))) return;
      issues.push({ type: msg.type(), message });
    });

    page.on("pageerror", (error) => {
      issues.push({ type: "pageerror", message: error.message });
    });

    page.on("requestfailed", (request) => {
      const failure = request.failure();
      issues.push({
        type: "requestfailed",
        message: `${request.method()} ${request.url()} ${failure?.errorText ?? ""}`,
      });
    });

    page.on("response", (response) => {
      const status = response.status();
      const url = response.url();
      if (status >= 500 || (status === 404 && !url.includes("/_next/static") && !url.includes("favicon"))) {
        issues.push({ type: "badresponse", message: `${status} ${url}` });
      }
    });

    await use(issues);

    expect.soft(issues, issues.map((issue) => `${issue.type}: ${issue.message}`).join("\n")).toEqual([]);
  },

  authenticatedPage: async ({ page, baseURL }, use) => {
    await addAuthCookie(page, baseURL);
    await use(page);
  },

  mockMeloApis: async ({ page }, use) => {
    await use(async (options) => {
      await page.route("**/api/auth/session", (route) => route.fulfill({ json: mockSession }));
      await page.route("**/api/analysis", async (route) => {
        if (route.request().method() === "POST") {
          await route.fulfill({ json: options?.analysis ?? mockAnalysis });
        } else {
          await route.fulfill({ json: options?.analysis ?? mockAnalysis });
        }
      });
      await page.route("**/api/compatibility", async (route) => {
        if (route.request().method() === "POST") {
          await route.fulfill({ json: options?.compatibility ?? mockCompatibility });
        } else {
          await route.fulfill({ json: options?.compatibility ?? mockCompatibility });
        }
      });
      await page.route("**/api/export-playlist", (route) =>
        route.fulfill({ json: { success: true, url: "https://open.spotify.com/playlist/test", trackCount: 6, coverUploaded: true } })
      );
      await page.route("**/api/visualizations/**", (route) => route.fulfill({ json: mockAnalysis.data.moodGraph }));
      await page.route("**/api/share/demo-aura", (route) => route.fulfill({ json: mockShareCard }));
    });
  },

  runAxe: async ({ page }, use) => {
    await use(async (selector = "body") => {
      const results = await new AxeBuilder({ page }).include(selector).analyze();
      expect(results.violations).toEqual([]);
    });
  },
});

export { expect };

export async function expectUnauthorized(request: APIRequestContext, path: string, method: "GET" | "POST" | "DELETE" = "GET") {
  const response = method === "POST"
    ? await request.post(path, { data: {} })
    : method === "DELETE"
      ? await request.delete(path)
      : await request.get(path);
  expect(response.status(), `${method} ${path}`).toBe(401);
}
