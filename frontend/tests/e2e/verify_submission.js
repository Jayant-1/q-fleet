/**
 * Q-FLEET / SIH26138 - Complete Submission Verification Runner
 * Validates all release gates:
 * 1. Backend Pytest test suite (40 tests, 0 warnings)
 * 2. Frontend production build (TypeScript + Vite, 0 errors)
 * 3. Mobile viewport & zero-overflow audits (30 checks across 5 viewports)
 * 4. Master 23-scenario Playwright E2E functional test suite
 */

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../..");

console.log("================================================================================");
console.log("Q-FLEET / SIH26138: MASTER SUBMISSION READINESS & RELEASE GATE AUDIT");
console.log("================================================================================");

let allPassed = true;

function runGate(title, cmd, cwd = rootDir) {
  console.log(`\n[GATE] ${title}...`);
  try {
    const output = execSync(cmd, { cwd, encoding: "utf-8", stdio: "pipe" });
    console.log(output.trim());
    console.log(`>>> ${title}: PASSED ✅`);
  } catch (err) {
    console.error(`>>> ${title}: FAILED ❌`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    allPassed = false;
  }
}

// Gate 1: Backend Pytest Suite
runGate("Backend Pytest Suite (40 tests, 0 warnings)", ".venv/bin/pytest backend/tests/");

// Gate 2: Frontend Production Build
runGate("Frontend Production Build (TypeScript + Vite)", "pnpm --dir frontend build");

// Gate 3: Viewport Responsiveness Suite (320px - 1440px)
runGate("Viewport Zero-Overflow Audits (320px, 390px, 768px, 1024px, 1440px)", "node tests/e2e/test_mobile_viewports.js", path.resolve(rootDir, "frontend"));

// Gate 4: Master 23-Scenario E2E Journey
runGate("Master 23-Scenario E2E Playwright Suite", "node tests/e2e/run_all_e2e.js", path.resolve(rootDir, "frontend"));

console.log("\n================================================================================");
if (allPassed) {
  console.log("FINAL SUBMISSION VERDICT: GO (100% OF RELEASE GATES PASSED) 🚀");
  console.log("Q-FLEET / SIH26138 is verified, reproducible, and ready for evaluation.");
  console.log("================================================================================");
  process.exit(0);
} else {
  console.error("FINAL SUBMISSION VERDICT: NO-GO (One or more gates failed) ❌");
  console.log("================================================================================");
  process.exit(1);
}
