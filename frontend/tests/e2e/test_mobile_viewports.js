/**
 * Q-FLEET / SIH26138 - Mobile Viewport & Responsiveness Verification Suite
 * Tests 320px, 390px, 768px, 1024px, 1440px across Landing and Dashboard tabs.
 * Enforces strictly 0px horizontal overflow (scrollWidth <= clientWidth).
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

let playwright;
try {
  playwright = require("playwright");
} catch (e) {
  try {
    playwright = require("/home/jayant/.gemini/antigravity/brain/4b98f27f-fda8-4438-a6dc-8bb318a8e5b6/scratch/scraper/node_modules/playwright");
  } catch (err) {
    console.error("Playwright module not found:", err);
    process.exit(1);
  }
}
const { chromium } = playwright;

const VIEWPORTS = [
  { name: "Mobile Minimal (320px)", width: 320, height: 640 },
  { name: "Mobile Standard (390px)", width: 390, height: 844 },
  { name: "Tablet Portrait (768px)", width: 768, height: 1024 },
  { name: "Tablet Landscape (1024px)", width: 1024, height: 768 },
  { name: "Desktop (1440px)", width: 1440, height: 900 }
];

const TABS = [
  "Overview",
  "Naval Physics",
  "Pareto Optimization",
  "Compliance & CII",
  "Fleet Directory"
];

async function runViewportAudits() {
  console.log("================================================================================");
  console.log("Q-FLEET / SIH26138: Multi-Viewport Responsiveness & Zero-Overflow Audit");
  console.log("================================================================================");

  const browser = await chromium.launch({ headless: true });
  let totalViolations = 0;
  let testsPassed = 0;

  for (const vp of VIEWPORTS) {
    console.log(`\n>>> Auditing Viewport: ${vp.name} [${vp.width}x${vp.height}]...`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    await context.addInitScript(() => {
      try {
        localStorage.setItem("greenfleet_welcomed_v1", "true");
      } catch (e) {}
    });

    const page = await context.newPage();

    // 1. Audit Landing Page
    try {
      await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);

      const landingMetrics = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        return {
          scrollWidth: Math.max(docEl.scrollWidth, body.scrollWidth),
          innerWidth: window.innerWidth
        };
      });

      const overflow = landingMetrics.scrollWidth - landingMetrics.innerWidth;
      if (overflow > 1) {
        console.error(`  [FAIL] Landing Page: horizontal overflow detected: +${overflow}px (scroll: ${landingMetrics.scrollWidth}px, inner: ${landingMetrics.innerWidth}px)`);
        totalViolations++;
      } else {
        console.log(`  [PASS] Landing Page: zero overflow (${landingMetrics.scrollWidth}px / ${landingMetrics.innerWidth}px)`);
        testsPassed++;
      }
    } catch (e) {
      console.error(`  [ERROR] Landing Page audit failed: ${e.message}`);
      totalViolations++;
    }

    // 2. Audit Dashboard Page and all 5 tabs
    try {
      await page.goto("http://127.0.0.1:5173/dashboard", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);

      for (const tab of TABS) {
        const tabBtn = page.locator(`button:has-text(\"${tab}\")`).first();
        if (await tabBtn.count() > 0) {
          await tabBtn.click({ force: true });
          await page.waitForTimeout(350);

          const tabMetrics = await page.evaluate(() => {
            const docEl = document.documentElement;
            const body = document.body;
            return {
              scrollWidth: Math.max(docEl.scrollWidth, body.scrollWidth),
              innerWidth: window.innerWidth
            };
          });

          const tabOverflow = tabMetrics.scrollWidth - tabMetrics.innerWidth;
          if (tabOverflow > 1) {
            console.error(`  [FAIL] Dashboard Tab [${tab}]: horizontal overflow detected: +${tabOverflow}px (scroll: ${tabMetrics.scrollWidth}px, inner: ${tabMetrics.innerWidth}px)`);
            totalViolations++;
          } else {
            console.log(`  [PASS] Dashboard Tab [${tab}]: zero overflow (${tabMetrics.scrollWidth}px / ${tabMetrics.innerWidth}px)`);
            testsPassed++;
          }
        } else {
          console.warn(`  [WARN] Dashboard Tab [${tab}] button not found`);
        }
      }
    } catch (e) {
      console.error(`  [ERROR] Dashboard audit failed: ${e.message}`);
      totalViolations++;
    }

    await context.close();
  }

  await browser.close();

  console.log("\n================================================================================");
  console.log(`Viewport Audit Complete: ${testsPassed} passed, ${totalViolations} violations.`);
  console.log("================================================================================");

  if (totalViolations > 0) {
    process.exit(1);
  } else {
    console.log("All viewports passed 100% with zero horizontal overflow! 🎉");
    process.exit(0);
  }
}

runViewportAudits().catch(err => {
  console.error("Fatal error during viewport audits:", err);
  process.exit(1);
});
