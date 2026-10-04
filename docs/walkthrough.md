# Q-FLEET (SIH26138) Final Submission & Evaluator Walkthrough

## Executive Summary & Final Release Verdict
- **Project**: Q-FLEET — Quantum-Inspired Maritime Fuel Prediction & Multi-Objective Green Fleet Optimization
- **Problem Statement**: Smart India Hackathon — Problem Statement 2 (SIH26138)
- **Local Application URLs**:
  - Landing Page: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
  - Operational Dashboard: [http://127.0.0.1:5173/dashboard](http://127.0.0.1:5173/dashboard)
  - FastAPI Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Master Release Gate Verdict**: **GO (100% OF RELEASE GATES PASSED) 🚀**

---

## 1. Verified Release Gate Results

All release gates are executable via a single command:
```bash
pnpm --dir frontend run verify:submission
```

| Release Gate | Verification Command | Required Standard | Verified Evidence | Status |
|---|---|---|---|:---:|
| **Gate 1: Backend Pytest Suite** | `.venv/bin/pytest backend/tests/ -v` | 45 tests passing with 0 warnings | **45 passed in 6.02s**, 0 warnings, 0 failures | **PASSED ✅** |
| **Gate 2: Frontend Production Build** | `pnpm --dir frontend build` | TypeScript + Vite exit code 0 | **2,130 modules transformed**, 0 errors (built in 5.25s) | **PASSED ✅** |
| **Gate 3: Multi-Viewport Audit** | `pnpm --dir frontend run test:e2e:mobile` | Strictly 0px horizontal overflow | **30 checks passed, 0 violations** across 320px–1440px | **PASSED ✅** |
| **Gate 4: Master 16-Requirement E2E Suite** | `pnpm --dir frontend run test:e2e` | 16 behavioral requirements pass | **16 of 16 requirements passed, 0 failures** | **PASSED ✅** |

---

## 2. Scientific & Data Provenance Foundation

### A. Ground-Truth Data Assets & Checksums
- **EMSA THETIS-MRV Dataset**: **25,691** verified annual commercial vessel observations (13,059 in 2022 training archive, 12,632 in 2023 temporal holdout) representing **15,924** unique IMO commercial vessels.
  - File: `data/mrv/mrv_cleaned_vessels.csv`
  - SHA-256: `88d84ad8bafc95fb16a5863a3fb72cfc22e815e37350458aa10c1ad7302d23e5`
- **UN/LOCODE Standardized Locations**: **11,829** international transport geographic coordinates (UNECE 2024-2).
  - File: `data/ports/ports_cleaned.csv`
  - SHA-256: `2bca082bfac3fb3f539b60f0ee08470539d57af97c84da3350074c6862184609`
- **Curated Operational Hubs**: **7** calibrated maritime hubs with modeled shore-power electrical connectivity and regional grid carbon intensities.
  - File: `data/fixtures/major_ports_fixture.csv`
  - SHA-256: `94172e22cb080e9cb9a9fcf6a2ed5489e66fd551ab001c6cbdec5b9faff006cc`
- **Deterministic Offline Fixture**: **1,000** vessel sample ensuring 100% offline test reproducibility.
  - File: `data/fixtures/mrv_sample.csv`
  - SHA-256: `2dabe0736c23b2542c07b9c00ec06d62e8a2a5cc887628873c25b980ff94937f`

### B. Evidential Classification Taxonomy
Every metric, formula, and figure in Q-FLEET is explicitly classified under the Claim-Evidence Framework:
1. `[MEASURED DATA — EMSA MRV]`: Real empirical observations from official European Maritime Safety Agency reporting.
2. `[EMPIRICAL ANNUAL PREDICTION]`: ML-based annual emissions estimates with 95% conformal prediction intervals trained on EMSA 2022 and tested on unseen 2023 holdout.
3. `[MODELED VOYAGE ESTIMATE]`: First-principles naval hydrodynamic proxy (Holtrop-Mennen calm-water resistance + ISO 15016 weather drag) for discrete single voyages.
4. `[SYNTHETIC MATCHED-BUDGET BENCHMARK]`: Fair algorithmic comparison under identical budgets (1,050 evaluations, seed = 42).
5. `[USER-SELECTED SCENARIO ASSUMPTION]`: Operational inputs configured by the evaluator (target speed, draft, weather severity, carbon tax).
6. `[INDICATIVE REGULATORY ESTIMATE]`: Mathematical simulation proxy of IMO MEPC.354(78), EU ETS Directive 2023/959, and FuelEU Maritime Reg (EU) 2023/1805.

### C. Benchmark Truth & No Greenwashing
- **Hypervolume & Convergence Leader**: Multi-Objective Particle Swarm Optimization (**MO-PSO**) captures highest hypervolume ($0.2577$) in $0.50\text{ s}$.
- **Pareto Spread & Diversity Leader**: Quantum-Inspired Evolutionary Algorithm (**MO-QIEA**) produces the most uniform and widely distributed Pareto compromise set ($\text{Spread } \Delta = 0.0254$), providing dispatchers with genuinely distinct trade-off choices without clustering into a single point.
- **Machine Learning Regressors**: Classical Random Forest leads raw tabular accuracy ($R^2 = 0.6284$, $\text{MAE} = 1,190.8\text{ MT}$); QIEA-GBM serves as a parsimonious metaheuristic ($R^2 = 0.5734$, 3 features, $0.002\text{ ms}$ inference latency).

---

## 3. Currency Reconciliation & Statutory Audit Architecture

- **Dual-Currency Exposure**:
  - Global bunker fuel expenditures and operational voyage costs are denominated in **USD ($)**.
  - Statutory European regulatory liabilities under Directive (EU) 2023/959 (EU ETS) and Regulation (EU) 2023/1805 (FuelEU Maritime) are assessed in **EUR (€)**.
  - Standardized conversion rate: **ECB Reference Rate Benchmark Snapshot of 1.08 USD/EUR** (€1.00 = $1.08 USD), dated October 18, 2024.
- **EU ETS Surrender Timeline**: Under Directive (EU) 2023/959, surrender occurs in September of the year following the reporting period (e.g. 2026 voyage liabilities are surrendered in September 2027 at 100%).
- **Cryptographic Canonical Audit Hash v2.0**:
  - The canonical SHA-256 hash protects all scenario inputs, custom fleet rosters, vessel speeds, operating drafts, adjustment explanations, and allocations.
  - Any modification to persisted runs or memory state fails closed: `/api/optimize/run/{id}`, `/api/reports/html/{id}`, and `/api/reports/pdf/{id}` return **HTTP 400**.
- **Numerical Parity**: Bit-for-bit parity holds across API JSON responses, SQLite/JSON storage, HTML report, and binary ReportLab PDF streams.

---

## 4. Key Documentation Artifacts in Repository

1. [`docs/sih_problem_statement.md`](sih_problem_statement.md): Authoritative Problem Statement 2 (SIH26138) scope and requirements.
2. [`docs/requirements_traceability_matrix.md`](requirements_traceability_matrix.md): Bidirectional traceability matrix mapping SIH deliverables to modules, endpoints, UI components, tests, and evidence sources.
3. [`docs/model_card.md`](model_card.md): Complete Model Card documenting architectures, holdout splits, conformal prediction bounds, and operational boundaries.
4. [`docs/claim_evidence_matrix.md`](claim_evidence_matrix.md): Master classification mapping all metrics to verified evidence categories.
5. [`docs/judge_demo_script.md`](judge_demo_script.md): Step-by-step 3-minute evaluator presentation script covering naval physics, quantum optimization, compliance auditing, and PDF export.
6. [`docs/submission_checklist.md`](submission_checklist.md): Release gate verification matrix confirming all SIH requirements are satisfied.
7. [`frontend/tests/e2e/`](../frontend/tests/e2e/): Committed Playwright test suite (`run_all_e2e.js`, `test_mobile_viewports.js`, `verify_submission.js`).
