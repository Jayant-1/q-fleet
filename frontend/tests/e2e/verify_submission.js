/**
 * Q-FLEET / SIH26138 - Complete Submission Verification Runner
 * Evaluator-grade test harness that automatically:
 * 1. Checks if backend (:8000) and frontend (:5173) are running; spawns them if not.
 * 2. Polls health endpoints until ready.
 * 3. Runs Gate 1: Backend Pytest Suite (45 tests, 0 warnings).
 * 4. Runs Gate 2: Frontend Production Build (TypeScript + Vite, 0 errors).
 * 5. Runs Gate 3: Multi-Viewport Zero-Overflow Audits (30 checks across 320px-1440px).
 * 6. Runs Gate 4: Master 16-Requirement Behavioral E2E Playwright Suite.
 * 7. Safely terminates any spawned background processes on exit/error/signal.
 * 8. Returns exit code 0 ONLY if 100% of gates pass.
 */

import { execSync, spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../..");
const frontendDir = path.resolve(rootDir, "frontend");

console.log("================================================================================");
console.log("Q-FLEET / SIH26138: MASTER SUBMISSION READINESS & RELEASE GATE AUDIT");
console.log("================================================================================");

let allPassed = true;
const spawnedProcesses = [];

function cleanup() {
  for (const proc of spawnedProcesses) {
    try {
      if (proc && !proc.killed) {
        proc.kill("SIGTERM");
      }
    } catch (_) {}
  }
}

process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(1); });
process.on("SIGTERM", () => { cleanup(); process.exit(1); });

function checkUrl(url, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
  });
}

async function waitForUrl(url, maxWaitMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const ok = await checkUrl(url, 1000);
    if (ok) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function ensureServersRunning() {
  // Check backend
  const backendHealthy = await checkUrl("http://127.0.0.1:8000/api/health");
  if (!backendHealthy) {
    console.log("[SETUP] Spawning FastAPI backend on 127.0.0.1:8000...");
    const pythonBin = path.resolve(rootDir, ".venv/bin/python");
    const backendProc = spawn(pythonBin, ["-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000"], {
      cwd: rootDir,
      stdio: "ignore",
      detached: false,
    });
    spawnedProcesses.push(backendProc);
    const ready = await waitForUrl("http://127.0.0.1:8000/api/health", 15000);
    if (!ready) {
      throw new Error("FastAPI backend failed to become healthy within 15 seconds.");
    }
    console.log(">>> FastAPI backend healthy ✅");
  } else {
    console.log(">>> FastAPI backend already running & healthy ✅");
  }

  // Check frontend
  const frontendHealthy = await checkUrl("http://127.0.0.1:5173");
  if (!frontendHealthy) {
    console.log("[SETUP] Spawning Vite frontend dev server on 127.0.0.1:5173...");
    const frontendProc = spawn("pnpm", ["run", "dev", "--port", "5173", "--host", "127.0.0.1"], {
      cwd: frontendDir,
      stdio: "ignore",
      detached: false,
    });
    spawnedProcesses.push(frontendProc);
    const ready = await waitForUrl("http://127.0.0.1:5173", 15000);
    if (!ready) {
      throw new Error("Vite frontend failed to become healthy within 15 seconds.");
    }
    console.log(">>> Vite frontend healthy ✅");
  } else {
    console.log(">>> Vite frontend already running & healthy ✅");
  }
}

function runGate(title, cmd, cwd = rootDir) {
  console.log(`\n--------------------------------------------------------------------------------`);
  console.log(`[GATE] ${title}...`);
  console.log(`--------------------------------------------------------------------------------`);
  try {
    const output = execSync(cmd, { cwd, encoding: "utf-8", stdio: "inherit" });
    console.log(`>>> ${title}: PASSED ✅`);
  } catch (err) {
    console.error(`>>> ${title}: FAILED ❌`);
    allPassed = false;
  }
}

async function main() {
  try {
    await ensureServersRunning();

    // Gate 1: Backend Pytest Suite
    runGate("Gate 1: Backend Pytest Suite (45 tests, 0 warnings)", ".venv/bin/pytest backend/tests/ -v");

    // Gate 2: Frontend Production Build
    runGate("Gate 2: Frontend Production Build (TypeScript + Vite)", "pnpm --dir frontend build");

    // Gate 3: Viewport Responsiveness Suite (320px - 1440px)
    runGate("Gate 3: Multi-Viewport Zero-Overflow Audits (320px, 390px, 768px, 1024px, 1440px)", "node tests/e2e/test_mobile_viewports.js", frontendDir);

    // Gate 4: Master 16-Requirement Behavioral E2E Journey
    runGate("Gate 4: Master 16-Requirement Behavioral E2E Playwright Suite", "node tests/e2e/run_all_e2e.js", frontendDir);

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
  } catch (fatalErr) {
    console.error(`\n[FATAL EXECUTION ERROR]: ${fatalErr.message}`);
    console.error("FINAL SUBMISSION VERDICT: NO-GO ❌");
    process.exit(1);
  }
}

main();
