# Requirements Traceability Matrix (RTM)
## Project: Quantum-Inspired Fuel Consumption Prediction and Green Fleet Optimization (SIH26138)

### 1. Document Overview & Objective Traceability
This document establishes end-to-end traceability from the Smart India Hackathon Problem Statement 2 (SIH26138) requirements and delivery table to technical specifications, architectural components, operational algorithms, test cases, and demonstration workflows.

---

### 2. High-Level Problem Statement Mapping

| ID | PDF Clause / Deliverable | Source Description | Platform Implementation Component | Verification / Test ID |
|---|---|---|---|---|
| **REQ-01** | **Deliverable 1: Fuel Consumption Prediction Model** | Quantum-inspired predictive model for vessel fuel consumption under varying operational conditions (speed, load, weather, vessel type). | `backend.app.prediction.quantum_inspired_predictor` (QIEA-FS/HPO + Regressor Pipeline) & `backend.app.prediction.classical_models` (Ridge, RF, GBM). | `TEST-PRED-01` to `TEST-PRED-05` |
| **REQ-02** | **Deliverable 2: Mathematical Optimization Formulation** | Multi-objective optimization model for green fleet deployment: vessel mix, capacity, speed, fuel type; objectives: min fuel, min emissions, min cost; constraints: cargo demand, schedule reliability, emission limits. | `backend.app.optimization.problem` (`FleetDeploymentProblem`, objective functions, penalty/repair constraints). | `TEST-OPT-01` to `TEST-OPT-04` |
| **REQ-03** | **Deliverable 3: Quantum-Inspired Optimization Algorithm** | Core metaheuristic engine using Quantum Optimization or equivalent, explicit encoding scheme for fleet decisions, and quantum update mechanisms (rotation gates, superposition collapse). | `backend.app.optimization.qiea_engine` (`MultiObjectiveQIEA`, Q-bit amplitude/angle encoding, dynamic rotation lookup, catastrophe mutation). | `TEST-QIEA-01` to `TEST-QIEA-06` |
| **REQ-04** | **Deliverable 4: Software Platform / Decision Support System** | End-to-end implementable system: User interface or API, Scenario simulation, Visualization of fleet allocation and emission profiles, Report generation. | `backend.app.api.*`, `frontend/src/*` (FastAPI REST API, React 19 + TypeScript + Tailwind CSS Data-as-Art UI, Report Generator). | `TEST-INT-01`, `TEST-UI-01` to `TEST-UI-06` |
| **REQ-05** | **Deliverable 5: Demonstration** | Complete technical and real/simulated large-scale scenario with algorithm details, implementation guide, and experimental results. | `scripts/run_benchmarks.py`, `scripts/seed_data.py`, reproducible scenario suite (Global Maritime Corridors: Asia-Europe, Transpacific, Intra-Europe, Transatlantic, Indian Ocean). | `TEST-DEMO-01`, `TEST-SYS-01` |

---

### 3. Detailed Functional Requirements (FR)

| Req ID | Category | Requirement Statement | Input Parameters / Domain | Output / Artifact | Acceptance Criteria |
|---|---|---|---|---|---|
| **FR-PRED-01** | Prediction | Multi-variable operational prediction pipeline | Speed Over Ground (knots: 8-26), Deadweight Tonnage (DWT: 5k-220k), Cargo Load factor (0.0-1.0), Draft (m), Beaufort Wind Force (0-10), Significant Wave Height (Hs m: 0-9), Current velocity (knots), Vessel Type (Container, Bulk Carrier, Tanker, LNG Carrier, Ro-Ro). | Metric Tons of fuel per nautical day (MT/day) & Specific Fuel Oil Consumption (SFOC g/kWh). | R² ≥ 0.88, MAE < 2.5 MT/day on holdout test partition. |
| **FR-PRED-02** | Quantum Feature Selection | Quantum-Inspired Evolutionary Feature Selection (QIEA-FS) | Superposition Q-bit register |ψ⟩ = α|0⟩ + β|1⟩ for feature subset inclusion. | Ranked feature importance and sparse optimal feature mask. | Shows statistically significant feature reduction without degrading test R² by more than 1.5%. |
| **FR-PRED-03** | Prediction Baselines | Rigorous baseline comparison against standard classical regressors | Identical train/val/test splits (70/15/15) across all estimators. | Metric comparison table (MAE, RMSE, MAPE, R², latency ms). | Baselines include Ordinary Least Squares, Ridge Regression, Random Forest, and Classical GA-Feature Selection. |
| **FR-OPT-01** | Formulation | Multi-objective formulation with 3 core conflicting objectives | Fleet decision vector x = {vessel, speed, fuel, route}. | Objectives: (1) Total voyage fuel (MT), (2) Total operational cost ($ USD), (3) Lifecycle GHG emissions (tCO2e WTW). | Strict pareto non-domination filtering; no single scalarizing bias required. |
| **FR-OPT-02** | Constraints | Cargo Demand Satisfaction | Route origin-destination demand in TEU (container) or Metric Tons (dry/liquid bulk). | Route capacity allocation sum(C_v * trips_v) ≥ D_r. | 100% demand satisfaction in feasible solutions; zero cargo shortfall. |
| **FR-OPT-03** | Constraints | Schedule Reliability & Transit Windows | Port turnaround time, cruising speed v_s, corridor distance L_r, maximum allowable voyage duration T_max. | Calculated arrival time T_transit + T_berth ≤ T_window + slack. | Violations penalized heavily or repaired by speed/vessel adjustment. |
| **FR-OPT-04** | Constraints | Vessel Inventory & Engine Compatibility | Fleet roster N_v per vessel class and engine fuel capabilities (Conventional, Dual-Fuel LNG, Methanol-Ready, Ammonia-Ready, H2 Fuel Cell). | Feasible assignment indicator x_{v,f,r} in {0, 1}. | No vessel assigned to an incompatible fuel or exceeding available fleet counts. |
| **FR-OPT-05** | Fuels | Alternative Fuel Scenarios (Well-to-Wake Lifecycle Accounting) | Fuels: VLSFO (baseline), MGO, LNG, Green Methanol, Green Liquid Hydrogen, Green Ammonia, and Port Shore Power. | Well-to-Tank (WTT) emissions, Tank-to-Wake (TTW) emissions, Lower Heating Value (MJ/kg), Bunkering cost ($/MT). | Separate WTT and TTW factors based on IMO MEPC.376(80) / FuelEU Maritime standards. |
| **FR-OPT-06** | Shore Power | Port Shore Power (Cold Ironing) Integration | Berth duration, auxiliary power load (MW), port cold ironing availability flag, regional shore grid carbon intensity (gCO2/kWh). | Berth emissions reduction vs onboard auxiliary diesel generation. | Applied strictly during port berth dwell; not erroneously applied to open ocean cruising. |
| **FR-OPT-07** | Algorithm | Quantum-Inspired Multi-Objective Evolutionary Algorithm (MO-QIEA) | Q-bit chromosome representation: matrix of Q-bits with probability amplitudes (α, β) where |α|² + |β|² = 1. Quantum rotation gate Δθ = f(fitness, pareto rank). Dynamic Catastrophe operator. | Non-dominated Pareto frontier set P*. | Clear convergence within 50-100 iterations; superior Pareto Hypervolume Indicator (HV) and Spread (Δ) vs classical GA under matched evaluation budgets. |
| **FR-OPT-08** | Benchmarking | Optimization Benchmark Suite | Matched computational budget: e.g. 50 generations × 40 candidates = 2000 function evaluations across MO-QIEA, NSGA-II, and MO-PSO. | Hypervolume (HV), Generational Distance (GD), Spacing/Spread metric, Wall-clock runtime (s). | Fair, deterministic comparison with identical random seeds; clear disclosure of trade-offs. |
| **FR-DSS-01** | Platform UI | Maritime Decision Support Interface | Interactive responsive web application ("Data as Art" visual theme with Oceanic Navy #070d18 and luminescent telemetry accents). | Live route map, fleet allocator, Pareto scatter plot, emission Sankey/breakdown, policy sandbox. | Fluid across Desktop (1920x1080), Laptop (1366x768), Tablet (768px), and Mobile (375px) without horizontal clipping or broken controls. |
| **FR-DSS-02** | Scenario Sandbox | Dynamic Policy and Market Simulation | Carbon tax slider ($0 - $300/ton CO2), Fuel price multipliers, Extreme weather severity index (0.8x - 1.5x), Route demand surges. | Instant re-evaluation and delta metrics vs baseline fleet deployment. | Real-time parameter updates in < 200 ms; full re-optimization triggering upon request. |
| **FR-DSS-03** | Reporting | Audit-Grade Scenario and Deployment Report | Full scenario input parameters, vessel roster, fuel pathway definitions, Pareto front table, selected compromise plan. | Formatted downloadable/printable HTML & JSON executive audit report. | Includes metadata, cryptographic run hash, emission inventory, cost ledger, and algorithmic convergence metrics. |

---

### 4. Non-Functional Requirements (NFR)

| NFR ID | Category | Requirement Statement | Metric / Target |
|---|---|---|---|
| **NFR-PERF-01** | Latency | Single fuel consumption prediction inference time | < 15 ms per vessel-voyage query. |
| **NFR-PERF-02** | Optimization Runtime | Multi-objective fleet deployment optimization run (5 routes, 15 vessel candidates, 6 fuels) | < 8.0 seconds for full 50-generation run. |
| **NFR-REPRO-01** | Determinism | Reproducible results under fixed pseudorandom seeds | Identical Pareto front and metrics given seed S=42. |
| **NFR-A11Y-01** | Accessibility & UX | Accessible charts, high contrast ratio, keyboard navigation, reduced-motion compliance | WCAG 2.1 AA contrast ratio (≥ 4.5:1 text, ≥ 3:1 graphics); full tab keyboard flow; @media (prefers-reduced-motion). |
| **NFR-DATA-01** | Data Provenance | Clear labeling of synthetic vs empirical data and IMO standard citations | 100% of synthetic records labeled [SYNTHETIC-SIMULATED]; emission factors cite IMO MEPC/FuelEU Maritime. |
| **NFR-RESP-01** | Adaptive Layout | Responsive art direction ("The design adapts, not shrinks") | Desktop (cinematic 12-col spatial), Tablet (balanced editorial), Mobile (intimate touch-first vertical flow). |

---

### 5. Fuel Lifecycle & Emission Factors (Authoritative Provenance)

Based on IMO MEPC.376(80), 2023 IMO GHG Strategy, and European Union FuelEU Maritime (Regulation EU 2023/1805):

| Fuel Type | Fuel Code | Lower Heating Value (LHV, MJ/kg) | Well-to-Tank (WTT) (gCO2e/MJ) | Tank-to-Wake (TTW) (gCO2/g fuel) | Total WTW (gCO2e/MJ) | Relative Bunkering Cost Baseline ($/MT) |
|---|---|---|---|---|---|---|
| **Very Low Sulfur Fuel Oil** | `VLSFO` | 41.0 | 13.5 | 3.151 | 90.3 | $620 |
| **Marine Gas Oil** | `MGO` | 42.7 | 14.2 | 3.206 | 89.2 | $780 |
| **Liquefied Natural Gas** | `LNG` | 48.0 | 18.5 (fossil) / 8.0 (bio) | 2.750 (+ methane slip) | 75.8 | $710 |
| **Green E-Methanol** | `BIO_METHANOL` | 19.9 | 10.2 (renewable synthesis) | 1.375 (biogenic net neutral) | 22.5 | $920 |
| **Green Liquid Hydrogen** | `GREEN_H2` | 120.0 | 14.0 (electrolysis via solar/wind) | 0.000 | 14.0 | $3,400 |
| **Green E-Ammonia** | `GREEN_NH3` | 18.6 | 16.5 (renewable Haber-Bosch) | 0.000 (N2O slip managed) | 16.5 | $1,150 |
| **Shore Power (Cold Ironing)** | `SHORE_POWER` | 3.6 MJ/kWh | 115.0 (gCO2e/kWh green grid) | 0.000 at berth | 31.9 (gCO2e/MJ) | $0.18 / kWh |
