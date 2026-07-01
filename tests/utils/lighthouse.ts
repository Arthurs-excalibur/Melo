import fs from "node:fs";
import path from "node:path";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { expect } from "../fixtures/test";

export type LighthouseBudgets = {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
};

export async function runLighthouseAudit(url: string, budgets: LighthouseBudgets) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: ["html", "json"],
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    });

    if (!result?.lhr || !result.report) {
      throw new Error("Lighthouse did not return a report.");
    }

    const outputDir = path.join(process.cwd(), "test-results", "lighthouse");
    fs.mkdirSync(outputDir, { recursive: true });
    const slug = new URL(url).pathname.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
    const [html, json] = Array.isArray(result.report) ? result.report : [result.report, JSON.stringify(result.lhr, null, 2)];
    fs.writeFileSync(path.join(outputDir, `${slug}.html`), html);
    fs.writeFileSync(path.join(outputDir, `${slug}.json`), json);

    const categories = result.lhr.categories;
    expect(Math.round((categories.performance?.score ?? 0) * 100)).toBeGreaterThanOrEqual(budgets.performance);
    expect(Math.round((categories.accessibility?.score ?? 0) * 100)).toBeGreaterThanOrEqual(budgets.accessibility);
    expect(Math.round((categories["best-practices"]?.score ?? 0) * 100)).toBeGreaterThanOrEqual(budgets.bestPractices);
    expect(Math.round((categories.seo?.score ?? 0) * 100)).toBeGreaterThanOrEqual(budgets.seo);

    return {
      lcp: result.lhr.audits["largest-contentful-paint"]?.numericValue,
      cls: result.lhr.audits["cumulative-layout-shift"]?.numericValue,
      inp: result.lhr.audits["interaction-to-next-paint"]?.numericValue,
      fcp: result.lhr.audits["first-contentful-paint"]?.numericValue,
      tbt: result.lhr.audits["total-blocking-time"]?.numericValue,
    };
  } finally {
    await chrome.kill();
  }
}
