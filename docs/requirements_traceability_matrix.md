# Comprehensive Requirements Traceability Matrix (RTM)
## Project: Q-FLEET / SIH26138
### Quantum-Inspired Maritime Fuel Prediction & Multi-Objective Green Fleet Optimization

---

### 1. Document Overview
This Requirements Traceability Matrix provides complete bidirectional traceability from Smart India Hackathon Problem Statement 2 (SIH26138) deliverables and statutory maritime standards down to source implementation modules, REST endpoints, UI components, automated verification tests, evidential classifications, and delivery status.

### 2. Evidential Classification Taxonomy
Every metric, formula, and data source in Q-FLEET is categorized according to the official Claim-Evidence Framework:
- `[MEASURED DATA — EMSA MRV]`: 25,691 empirical annual vessel observations from official European Maritime Safety Agency reporting.
- `[EMPIRICAL ANNUAL PREDICTION]`: ML-based annual emissions estimates with conformal prediction intervals trained on EMSA data.
- `[MODELED VOYAGE ESTIMATE]`: Hydrodynamic physics proxy (Holtrop-Mennen resistance + ISO 15016 weather) for discrete single voyages.
- `[SYNTHETIC MATCHED-BUDGET BENCHMARK]`: Fair algorithmic comparison under identical budgets (1,050 evaluations, N=42 seed).
- `[USER-SELECTED SCENARIO ASSUMPTION]`: Operational inputs configured by the evaluator (speed, draft, weather severity, carbon tax).
- `[INDICATIVE REGULATORY ESTIMATE]`: Mathematical simulation proxy of IMO MEPC.354(78), EU ETS Directive 2023/959, and FuelEU Maritime Reg 2023/1805.

---

### 3. Master Traceability Matrix

| Requirement ID | Category | Requirement Statement | Implementation Module | API Endpoint | UI Component | Test ID | Evidential Source | Status |
|---|---|---|---|---|---|---|---|---|
| **REQ-01** | Prediction | Vessel fuel consumption prediction under speed, load, weather, and vessel class | `backend/app/prediction/hydrodynamics.py`, `backend/app/prediction/quantum_inspired_predictor.py` | `POST /api/predict/fuel` | `PhysicsCalculator.tsx` | `test_hydrodynamic_physics_monotonicity`, `test_weather_added_resistance` | `[MODELED VOYAGE ESTIMATE]` | **VERIFIED** |
| **REQ-01.1** | Prediction | Empirical annual fuel and emissions prediction with conformal prediction bounds | `backend/app/prediction/mrv_predictor.py` | `POST /api/predict/mrv-annual` | `FleetDirectory.tsx` | `test_mrv_empirical_predictor_accuracy_and_confidence` | `[EMPIRICAL ANNUAL PREDICTION]` | **VERIFIED** |
| **REQ-01.2** | Prediction | Quantum-Inspired Feature Selection (QIEA-FS) and regressor benchmarking | `backend/app/prediction/quantum_inspired_predictor.py`, `backend/app/prediction/classical_models.py` | `GET /api/predict/benchmark` | `PredictiveModelBenchmark.tsx` | `test_qiea_predictor_training_and_accuracy`, `test_prediction_inference_latency` | `[SYNTHETIC MATCHED-BUDGET BENCHMARK]` | **VERIFIED** |
| **REQ-02** | Optimization | Mathematical multi-objective formulation: min fuel, min cost, min lifecycle GHG | `backend/app/optimization/problem.py` | `POST /api/optimize/run` | `ParetoFrontPlot.tsx`, `FleetAllocator.tsx` | `test_moqiea_feasibility_and_cargo_demand`, `test_fast_non_dominated_sort_ranks` | `[MODELED VOYAGE ESTIMATE]` | **VERIFIED** |
| **REQ-02.1** | Constraints | Cargo demand satisfaction constraint (100% target or heavy shortfall penalty) | `backend/app/optimization/problem.py` | `POST /api/optimize/run` | `FleetAllocator.tsx` | `test_moqiea_feasibility_and_cargo_demand` | `[USER-SELECTED SCENARIO ASSUMPTION]` | **VERIFIED** |
| **REQ-02.2** | Constraints | Vessel speed limits, physical hull clamping, and schedule recovery repair | `backend/app/optimization/problem.py` | `POST /api/optimize/run` | `SensitivitySandbox.tsx`, `FleetAllocator.tsx` | `test_speed_limits_and_schedule_repair_explanation` | `[MODELED VOYAGE ESTIMATE]` | **VERIFIED** |
| **REQ-02.3** | Constraints | Operating draft preservation and hydrodynamic drag scaling | `backend/app/optimization/problem.py`, `backend/app/prediction/hydrodynamics.py` | `POST /api/optimize/run` | `SensitivitySandbox.tsx`, `PhysicsCalculator.tsx` | `test_operating_draft_drag_increase_and_preservation` | `[MODELED VOYAGE ESTIMATE]` | **VERIFIED** |
| **REQ-02.4** | Regulatory | IMO MEPC.354(78) Carbon Intensity Indicator (CII) AER calculation & rating (A-E) | `backend/app/domain/regulations.py` | `POST /api/optimize/run` | `CIIRatingBadge.tsx`, `ComplianceLedger.tsx` | `test_cii_calculation_monotonicity_and_ratings` | `[INDICATIVE REGULATORY ESTIMATE]` | **VERIFIED** |
| **REQ-02.5** | Regulatory | Regulation (EU) 2023/1805 FuelEU Maritime compliance balance and €2,400 penalty | `backend/app/domain/regulations.py` | `POST /api/optimize/run` | `ComplianceLedger.tsx`, `ReportViewer.tsx` | `test_fueleu_maritime_compliance_and_penalty` | `[INDICATIVE REGULATORY ESTIMATE]` | **VERIFIED** |
| **REQ-02.6** | Regulatory | Directive (EU) 2023/959 Maritime EU ETS cost assessment and phase-in | `backend/app/domain/regulations.py` | `POST /api/optimize/run` | `ComplianceLedger.tsx`, `ReportViewer.tsx` | `test_eu_ets_cost_phase_in` | `[INDICATIVE REGULATORY ESTIMATE]` | **VERIFIED** |
| **REQ-02.7** | Currency | Dual currency exposure (USD bunker market / EUR EU liabilities) with ECB 1.08 rate | `backend/app/domain/regulations.py`, `backend/app/reports/generator.py` | `GET /api/reports/html/{id}`, `GET /api/reports/pdf/{id}` | `ReportViewer.tsx` | `test_solution_and_reports_numerical_parity` | `[INDICATIVE REGULATORY ESTIMATE]` | **VERIFIED** |
| **REQ-03** | Algorithm | Multi-Objective Quantum-Inspired Evolutionary Algorithm (MO-QIEA) engine | `backend/app/optimization/qiea_engine.py` | `POST /api/optimize/run` | `ParetoFrontPlot.tsx` | `test_reproducibility_with_seed`, `test_moqiea_feasibility_and_cargo_demand` | `[SYNTHETIC MATCHED-BUDGET BENCHMARK]` | **VERIFIED** |
| **REQ-03.1** | Benchmarking | Matched computational budget benchmarking against NSGA-II and MO-PSO | `backend/app/optimization/benchmark_suite.py` | `GET /api/optimize/benchmark` | `OptimizerBenchmarkView.tsx` | `test_matched_budget_benchmark` | `[SYNTHETIC MATCHED-BUDGET BENCHMARK]` | **VERIFIED** |
| **REQ-04** | DSS Platform | Interactive responsive web application with Data-as-Art visual theme | `frontend/src/components/*` | N/A | `LandingPage.tsx`, `App.tsx` | Playwright viewports (320px, 390px, 768px, 1024px, 1440px) | `[USER-SELECTED SCENARIO ASSUMPTION]` | **VERIFIED** |
| **REQ-04.1** | DSS Platform | Sensitivity sandbox with real-time reactive stale indicators and rerun triggers | `frontend/src/components/SensitivitySandbox.tsx` | `POST /api/optimize/run` | `SensitivitySandbox.tsx` | Playwright Scenario 11 | `[USER-SELECTED SCENARIO ASSUMPTION]` | **VERIFIED** |
| **REQ-04.2** | DSS Platform | Global maritime corridor map with interactive waypoints and vessel positions | `frontend/src/components/CorridorMap.tsx` | `GET /api/scenarios/corridors` | `CorridorMap.tsx` | Playwright Scenario 06 | `[MODELED VOYAGE ESTIMATE]` | **VERIFIED** |
| **REQ-04.3** | DSS Platform | Complete alternative fuel lifecycle registry (WTW, WTT, TTW, LHV, cost) | `backend/app/domain/fuels.py` | `GET /api/scenarios/fuels` | `FuelPathwayLifecycle.tsx` | `test_fuel_registry_completeness`, `test_fuel_lifecycle_consistency` | `[INDICATIVE REGULATORY ESTIMATE]` | **VERIFIED** |
| **REQ-05** | Provenance | Real-world EMSA THETIS-MRV dataset integration (25,691 vessel records) | `data/mrv/mrv_cleaned_vessels.csv`, `backend/app/api/routes_scenarios.py` | `GET /api/scenarios/mrv-vessels` | `FleetDirectory.tsx` | `test_mrv_dataset_physical_ranges_and_columns`, `test_zero_target_leakage_enforcement` | `[MEASURED DATA — EMSA MRV]` | **VERIFIED** |
| **REQ-05.1** | Provenance | UN/LOCODE standardized transport locations (11,829 entries) vs 7 operational hubs | `data/ports/ports_cleaned.csv`, `backend/app/domain/models.py` | `GET /api/scenarios/ports/unlocode`, `GET /api/scenarios/ports/list` | `CorridorMap.tsx`, `FleetAllocator.tsx` | `test_unlocode_ports_endpoint`, `test_major_ports_fixture_coordinates` | `[MEASURED DATA — EMSA MRV]` | **VERIFIED** |
| **REQ-05.2** | CSV Ingestion | Strict custom fleet CSV upload validation with physical range checking | `backend/app/api/routes_scenarios.py` | `POST /api/scenarios/custom-fleet/validate` | `CustomFleetUpload.tsx` | `test_csv_validation_strict_rejection`, `test_custom_fleet_and_route_filtering` | `[USER-SELECTED SCENARIO ASSUMPTION]` | **VERIFIED** |
| **REQ-06** | Audit Integrity | Cryptographic canonical SHA-256 hash protecting all inputs and allocations | `backend/app/reports/hashing.py`, `backend/app/api/routes_reports.py` | `GET /api/reports/json/{id}`, `GET /api/reports/html/{id}`, `GET /api/reports/pdf/{id}` | `ReportViewer.tsx` | `test_canonical_audit_hash_parity_and_persistence`, `test_canonical_hash_protects_all_inputs_and_allocations_tamper_detection` | `[MODELED VOYAGE ESTIMATE]` | **VERIFIED** |
| **REQ-06.1** | Audit Integrity | Fail-closed security architecture rejecting tampered runs across all endpoints | `backend/app/reports/hashing.py`, `backend/app/api/routes_reports.py`, `backend/app/api/routes_optimization.py` | `GET /api/optimize/run/{id}`, `/api/reports/*` | `ReportViewer.tsx` | `test_comprehensive_audit_integrity_tamper_and_fail_closed_endpoints` | `[MODELED VOYAGE ESTIMATE]` | **VERIFIED** |
| **REQ-06.2** | Reporting | Dual-format audit reporting (HTML & binary ReportLab PDF) with numerical parity | `backend/app/reports/generator.py` | `GET /api/reports/html/{id}`, `GET /api/reports/pdf/{id}` | `ReportViewer.tsx` | `test_solution_and_reports_numerical_parity`, `test_html_escaping_and_pdf_safety_for_vessel_names` | `[MODELED VOYAGE ESTIMATE]` | **VERIFIED** |
| **REQ-07** | Non-Functional | Prediction inference latency < 15 ms, optimization runtime < 8.0 s | `backend/app/prediction/*`, `backend/app/optimization/*` | `POST /api/predict/fuel`, `POST /api/optimize/run` | N/A | `test_prediction_inference_latency`, `test_matched_budget_benchmark` | `[SYNTHETIC MATCHED-BUDGET BENCHMARK]` | **VERIFIED** |
| **REQ-08** | Non-Functional | Responsive design without horizontal overflow across 320px - 1440px viewports | `frontend/src/*` | N/A | Full Application | Playwright viewport automated suites | N/A | **VERIFIED** |
| **REQ-09** | Non-Functional | Accessibility, high contrast, reduced motion, and WebGL-safe fallbacks | `frontend/src/*` | N/A | Full Application | WCAG 2.1 AA audit, Playwright tests | N/A | **VERIFIED** |
| **REQ-10** | Reproducibility | Deterministic seed reproducibility (S=42) and one-command execution | `scripts/run_benchmarks.py`, `backend/app/optimization/*` | N/A | N/A | `test_reproducibility_with_seed` | `[SYNTHETIC MATCHED-BUDGET BENCHMARK]` | **VERIFIED** |

---

### 4. Verification & Audit Summary
- **Backend Unit & Integration Tests**: 40 tests passing with 0 warnings.
- **Frontend Build Status**: Clean production build with Vite + TypeScript (`0` errors).
- **Audit Integrity Protection**: 13 mutation tampering categories tested and proven to fail closed (HTTP 400).
- **Numerical Parity**: 100% bit-level agreement across API JSON, SQLite/JSON storage, HTML report, and ReportLab PDF binary stream.
