# Q-FLEET: Claim-Evidence Matrix & Scientific Verification Ledger

**Document**: Claim-Evidence Verification Matrix  
**System**: Q-FLEET / SIH26138 (Quantum-Inspired Green Fleet Optimization Platform)  
**Standard**: Authoritative Primary Sources & Reproducible Benchmark Parity  
**Verification Date**: October 2026  
**Status**: AUDITED & VERIFIED  

---

## 1. Evidence Classification Standards

Every quantitative metric, regulatory parameter, and operational claim presented across the Q-FLEET application, API, reports, and documentation is strictly categorized under one of the following six evidential labels:

1. **`[MEASURED DATA — EMSA MRV]`**: Measured empirical data from official European Maritime Safety Agency (EMSA) THETIS-MRV published reports or UNECE UN/LOCODE registries.
2. **`[EMPIRICAL ANNUAL PREDICTION]`**: Statistical or machine learning predictions trained strictly on historical partitions with zero target leakage and evaluated on temporal holdouts.
3. **`[MODELED VOYAGE ESTIMATE]`**: First-principles physical simulations (Holtrop-Mennen 1984 towing tank calm-water drag, Kwon 1987 added wave resistance).
4. **`[SYNTHETIC MATCHED-BUDGET BENCHMARK]`**: Rigorously matched synthetic optimization trials with identical pseudorandom seeds ($N=42$) and identical evaluation budgets (1,050 evaluations).
5. **`[USER-SELECTED SCENARIO ASSUMPTION]`**: User-configurable commercial inputs (target speed, operating draft, allowance carbon tax rate, fuel price multipliers).
6. **`[INDICATIVE REGULATORY ESTIMATE]`**: Modeled policy proxies (IMO CII proxy rating, EU ETS surrender liabilities, FuelEU Maritime deficit penalty) derived from statutory formulas, clearly distinguished from formal third-party accredited audits.

---

## 2. Comprehensive Claim-Evidence Verification Table

| # | Public Claim / Metric | Exact Visible Location | Primary Source & Citation | Source Date | Category | Evidence Artifact | Approved Replacement / Current Wording | Status |
|---|---|---|---|---|---|---|---|:---:|
| **01** | **25,691 Annual Reporting Records** | Hero section, Data & Trust section, Fleet Directory, README | European Maritime Safety Agency (EMSA) THETIS-MRV Database | 2022–2023 | `[MEASURED DATA — EMSA MRV]` | `data/data_provenance_manifest.json`, `data/mrv/mrv_cleaned_vessels.csv` (13,059 in 2022 + 12,632 in 2023) | *"25,691 official annual reporting records from EMSA THETIS-MRV (2022–2023)"* | **VERIFIED** |
| **02** | **15,924 Distinct IMO Vessels** | Data & Trust section, Vessel Registry Modal, README | EMSA THETIS-MRV Verified Unique IMO Registry | 2022–2023 | `[MEASURED DATA — EMSA MRV]` | `data/mrv/mrv_cleaned_vessels.csv` (`nunique(imo_number) == 15,924`) | *"15,924 distinct commercial vessels across Container, Bulk, Tanker, LNG, and General Cargo"* | **VERIFIED** |
| **03** | **11,829 UN/LOCODE Locations** | Landing Page Section 7, Port Registry Drawer, README | United Nations Economic Commission for Europe (UNECE) UN/LOCODE 2024-2 | 2024 | `[MEASURED DATA — EMSA MRV]` | `data/ports/ports_cleaned.csv` (11,829 rows) | *"11,829 standardized trade and transport locations worldwide (geographic coordinates)"* | **VERIFIED** |
| **04** | **7 Curated Operational Hubs** | Port Registry Drawer, Architecture docs, README | Port Authority Tariffs & Regional Power Grids (Shanghai, Rotterdam, Los Angeles, Gothenburg, New York, Singapore, Mumbai) | 2024–2026 | `[MODELED VOYAGE ESTIMATE]` | `backend/app/domain/models.py` (`GLOBAL_PORTS`) | *"7 curated operational hubs with modeled shore-power and grid carbon intensity profiles"* | **VERIFIED** |
| **05** | **Zero Target Leakage on Holdout Split** | Data & Trust Section, Benchmark Lab, README | Statistical Machine Learning Protocol | 2026 | `[EMPIRICAL ANNUAL PREDICTION]` | `backend/tests/test_data_provenance.py::test_zero_target_leakage_enforcement` | *"Models fit strictly on 2022 reports and evaluated on separate 2023 holdout data with zero target leakage"* | **VERIFIED** |
| **06** | **Random Forest Leads ML Accuracy ($R^2 = 0.6284$)** | Benchmark Table, Prediction Studio, README | Empirical Holdout Evaluation (Test $N=1,272$) | 2026 | `[EMPIRICAL ANNUAL PREDICTION]` | `docs/benchmark_results.json` (`mrv_empirical_benchmark`) | *"Classical Random Forest achieves $R^2 = 0.6284$, MAE 1,190.8 MT on 2023 holdout with full 8 features"* | **VERIFIED** |
| **07** | **QIEA-GBM Parsimonious Representation** | Benchmark Table, Prediction Studio, README | Quantum-Inspired Feature Selection (3 features) | 2026 | `[EMPIRICAL ANNUAL PREDICTION]` | `docs/benchmark_results.json` (`qiea_predictor`) | *"QIEA-GBM retains 3 features (`ship_type`, `time_at_sea`, `efficiency`), $R^2 = 0.5734$, 0.002 ms latency"* | **VERIFIED** |
| **08** | **MO-PSO Leads Hypervolume (0.2577)** | Landing Page Section 5, Benchmark Table, README | Continuous Swarm Optimization Baseline | 2026 | `[SYNTHETIC MATCHED-BUDGET BENCHMARK]` | `docs/benchmark_results.json` (`fleet_optimization_benchmark`) | *"MO-PSO captures highest continuous hypervolume (0.2577) in 0.51s under 1,050 evaluations"* | **VERIFIED** |
| **09** | **MO-QIEA Leads Pareto Spread ($\Delta = 0.0254$)** | Landing Page Section 5, Pareto Teaser, README | Discrete Alternative Fuel Pathway Exploration | 2026 | `[SYNTHETIC MATCHED-BUDGET BENCHMARK]` | `docs/benchmark_results.json` (`spacing_spread`) | *"MO-QIEA provides widest Pareto spread ($\Delta = 0.0254$) and 4 non-dominated candidates across clean fuels"* | **VERIFIED** |
| **10** | **Non-Linear Cubic Drag Scale ($P \propto V^3$)** | Landing Page Section 2 & 4, Physics Slider | Holtrop & Mennen (1982, 1984), *An Approximate Power Prediction Method* | 1984 | `[MODELED VOYAGE ESTIMATE]` | `backend/app/prediction/evaluation.py` (`compute_hydrodynamic_fuel`) | *"Power demand scales non-linearly with speed ($P \propto V^3$), surging as Froude number exceeds $F_n > 0.20$"* | **VERIFIED** |
| **11** | **Kwon Wave Added Resistance** | Landing Page Section 2 & 4, Physics Bay | Kwon, J.W. (1987), *Speed loss in irregular waves* | 1987 | `[MODELED VOYAGE ESTIMATE]` | `backend/app/prediction/evaluation.py` (`kwon_added_resistance`) | *"Added wave resistance modeled via Kwon (1987) empirical formulation sensitive to wave height and vessel block"* | **VERIFIED** |
| **12** | **IMO CII MEPC.354(78) Letter Ratings (A–E)** | Regulatory Section, Dashboard Regulatory Bay, Reports | IMO Resolution MEPC.354(78) & MEPC.376(80) | 2022 | `[INDICATIVE REGULATORY ESTIMATE]` | `backend/app/domain/regulations.py` (`compute_vessel_cii`) | *"Indicative single-voyage proxy rating (A–E) based on attained AER; statutory certification is annual"* | **VERIFIED** |
| **13** | **EU ETS 100% Phase-In by 2026** | Regulatory Section, Carbon Scrubber, Dashboard | Directive (EU) 2023/959 amending Directive 2003/87/EC | 2023 | `[INDICATIVE REGULATORY ESTIMATE]` | `backend/app/domain/regulations.py` (`compute_eu_ets_cost`) | *"100% surrender obligation modeled for 2026 voyages (100% intra-EU, 50% extra-EU) for ships $\ge 5,000$ GT"* | **VERIFIED** |
| **14** | **FuelEU Maritime Deficit Penalty (€2,400/t VLSFO eq)** | Regulatory Section, Fuel Bento, Dashboard | Regulation (EU) 2023/1805, Article 23(2) & Annex IV | 2023 | `[INDICATIVE REGULATORY ESTIMATE]` | `backend/app/domain/regulations.py` (`compute_fueleu_maritime`) | *"Statutory compliance balance penalty factor of €2,400 per MT VLSFO equivalent energy shortfall"* | **VERIFIED** |
| **15** | **EU ETS Carbon Price (€85/t default)** | Carbon Scrubber, Dashboard Regulatory Bay | User-Selected Policy Assumption (EUA Market Range €50–€150/t) | 2026 | `[USER-SELECTED SCENARIO ASSUMPTION]` | `frontend/src/components/editorial/FuelTaxScrubber.tsx` | *"User-configurable scenario assumption (€85 default) representing current EUA market benchmarks"* | **VERIFIED** |
| **16** | **Illustrative Voyage Scenario (Shanghai → Rotterdam)** | Hero section vessel inspector, telemetry strip | Modeled Demonstration Scenario (10,500 NM, 15,000 TEU container) | 2026 | `[MODELED VOYAGE ESTIMATE]` | `frontend/src/components/editorial/InteractiveHeroVessel.tsx` | *"Illustrative demonstration scenario (15,000 TEU container carrier, 10,500 NM). Not live satellite AIS"* | **VERIFIED** |
| **17** | **Cryptographic Determinism (SHA-256 v2.0)** | Reports, API JSON responses, Audit Badges | Canonical SHA-256 Simulation Serialization Protocol | 2026 | `[SYNTHETIC MATCHED-BUDGET BENCHMARK]` | `backend/app/reports/hashing.py`, `backend/tests/test_report_and_solution_parity.py` | *"Canonical SHA-256 v2.0 hash verifies simulation input/output reproducibility; does not constitute statutory certification"* | **VERIFIED** |
| **18** | **Currency Conversion Rate (1.08 EUR/USD)** | API outputs, JSON ledgers, HTML/PDF reports | European Central Bank (ECB) Reference Rate Benchmark | 2026 | `[USER-SELECTED SCENARIO ASSUMPTION]` | `backend/app/domain/regulations.py` (`eur_usd_exchange = 1.08`) | *"Explicit exchange rate: 1.08 USD per EUR (ECB benchmark rate 2026). EUR amounts exposed in native currency"* | **VERIFIED** |

---

## 3. Mandatory Copy Corrections Log (Removed Unsupported Language)

| Former / Unsupported Language | Issue Identified | Corrected Replacement Language | Verification File |
|---|---|---|---|
| *"achieving 16.1% higher Pareto hypervolume with 80% fewer evaluations"* | Mathematically false. MO-PSO led continuous hypervolume (0.2577 vs 0.1839). MO-QIEA's genuine advantage is Pareto spread ($\Delta = 0.0254$). | *"MO-PSO leads overall hypervolume at 0.2577; MO-QIEA achieves the widest Pareto spread ($\Delta = 0.0254$) across clean fuel pathways under a matched 1,050-evaluation budget."* | `frontend/src/components/editorial/QuantumParetoTeaser.tsx` |
| *"The Maritime Carbon Squeeze: €1,420,000 Annual Carbon Liability"* | Arbitrary single-vessel liability figure presented as a universal fact. | *"Five conflicting realities on every voyage"* (structured around non-linear drag, weather, alternative fuel premiums, laycans, and regulations). | `frontend/src/components/editorial/EditorialShowcase.tsx` |
| *"-28.0% Required GHG intensity reduction by 2030 vs 2019 baseline"* | Misattributed to single-year operational CII rather than IMO 2023 GHG Strategy ambition levels. | Cited IMO Resolutions MEPC.354(78) and MEPC.376(80) with specific annual reduction factors ($Z = 11\%$ in 2026). | `frontend/src/components/editorial/EditorialShowcase.tsx` |
| *"exporting verified dispatch reports"* / *"official audit report"* | Implied third-party statutory verification. | *"exporting reproducible modeled voyage reports"* / *"reproducible simulation report"*. | `frontend/src/components/tour/InteractiveTaskWalkthrough.tsx`, `frontend/src/components/ReportViewer.tsx` |
| *"verified electrified terminals"* | UN/LOCODE ports are transport locations, not certified cold-ironing berths. | *"compatible operational hubs with modeled shore-power connectivity"*. | `frontend/src/components/ReportViewer.tsx`, `frontend/src/components/FuelPathwayLifecycle.tsx` |
| *"Live position: 24°32.1'N 054°28.4'E"* | Implied real-time satellite AIS vessel tracking. | *"Illustrative voyage scenario: Shanghai → Rotterdam (10,500 NM) · Modeled Demo · Not Live AIS"*. | `frontend/src/components/editorial/EditorialShowcase.tsx`, `frontend/src/components/editorial/InteractiveHeroVessel.tsx` |
| Direct summation of EUR and USD without exchange rate disclosure | Currency addition ambiguity between EU regulations and bunker fuel prices. | Disclosed 1.08 EUR/USD ECB benchmark rate; exposed native `*_eur` alongside converted `*_usd` fields with explicit metadata. | `backend/app/domain/regulations.py`, `backend/app/reports/generator.py` |

---

## 4. Evidential Verification Verdict

Every public quantitative claim and qualitative statement across the Q-FLEET platform is fully reconciled with primary sources, empirical datasets, and verified repository artifacts. Zero contradictory, unprovable, or greenwashing claims remain.
