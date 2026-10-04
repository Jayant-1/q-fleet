# Quantum-Inspired Fuel Consumption Prediction & Green Fleet Optimization (SIH26138)

[![Smart India Hackathon](https://img.shields.io/badge/SIH-Problem%20Statement%2026138-00e5ff?style=for-the-badge&logo=anchor)](https://www.sih.gov.in/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![IMO MEPC.354(78)](https://img.shields.io/badge/IMO-MEPC.354(78)%20CII-ff6b00?style=for-the-badge)](https://www.imo.org)
[![FuelEU Maritime](https://img.shields.io/badge/EU-2023%2F1805%20FuelEU-10b981?style=for-the-badge)](https://eur-lex.europa.eu)
[![EU ETS Maritime](https://img.shields.io/badge/EU-2023%2F959%20ETS-3b82f6?style=for-the-badge)](https://climate.ec.europa.eu)

An end-to-end maritime decision support system built for **Smart India Hackathon (Problem Statement SIH26138)**. The platform integrates calibrated first-principles hydrodynamic naval architecture models, real **EMSA THETIS-MRV** commercial vessel datasets (25,691 annual reporting records representing 15,924 distinct IMO vessels), quantum-inspired evolutionary algorithms (QIEA) for sparse feature selection and multi-objective Pareto fleet allocation, full Well-to-Wake (WTW) lifecycle GHG accounting, and an audit-grade ESG compliance reporting engine.

---

## 1. Dual Operational Interfaces

The platform features two synchronized user interfaces designed under an editorial, Swiss-inspired typographic discipline with a single **Safety Amber (`#ff6b00`)** accent:

1. **Editorial Showcase (Acts 1–7):**
   - **Act 1: Cinematic Hero & Naval Telemetry:** High-contrast vessel telemetry, chronometer, and mission launcher.
   - **Act 2: IMO Regulatory Manifesto:** IMO MEPC.354(78) trajectory, EU ETS allowance costs, and FuelEU penalties.
   - **Act 3: Holtrop-Mennen Hydrodynamic Slider:** Real-time resistance ($R_F, R_W, R_{AW}$) and brake power simulator.
   - **Act 4: Live MO-QIEA Pareto Frontier:** Interactive non-dominated frontier with Knee-point inspection.
   - **Act 5: Alternative Fuels Lifecycle Bento Grid:** WTW lifecycle emissions for VLSFO, LNG, Bio-Methanol, Ammonia, and Hydrogen.
   - **Act 6: Quantum vs Classical Benchmark Lab:** Transparent performance metrics across 1,050 matched evaluations.
   - **Act 7: Complete Swiss Technical Specification:** Full architectural contract and API endpoints.

2. **Mission Dispatcher Cockpit & Regulatory Control:**
   - **Hydrodynamics Studio (Left Bay):** Live parameter sliders for cruising speed, vessel draft, and wave height.
   - **Spatial Bathymetry & Corridors Stage (Center):** Geodesic WGS-84 route map with interactive waypoints.
   - **Quantum Pareto Frontier Dock (Bottom):** Live trade-off scatter plot with waypoint-by-waypoint speed profile and fleet allocations.
   - **Regulatory Dock (Right Bay):** Bunker fuel selector, EU ETS carbon slider, dynamic IMO CII letter grade badge (A–E), and FuelEU deficit penalties.
   - **Vessel Registry & Fleet Integration Modal:** Search 25,691 real EMSA MRV annual records across 15,924 distinct IMO vessels with full pagination + ingest custom CSV fleet rosters with automated validation.
   - **Port Terminals & Provenance Drawer:** UN/LOCODE global coordinates (11,829 ports), 7 calibrated operational hubs, and SHA-256 data provenance manifest.
   - **"Why This Plan?" Sensitivity Explorer:** Policy sandbox with alternative fuel parity threshold calculation and live re-optimization.
   - **1-Click Audit PDF Export:** Formal maritime audit PDF report streaming via `/api/reports/pdf/{run_id}` with verified numerical parity.

---

## 2. Real-World Datasets & Scientific Integrity

### Strict Scientific Separation & Zero Target Leakage
- **Empirical Annual Vessel Model (`[MEASURED-ANNUAL-EMSA-MRV]`):**
  - Trained exclusively on official **EMSA THETIS-MRV** annual reports for 2022 (13,059 ships) and evaluated on unseen 2023 future holdout data (12,632 ships).
  - **Zero Target Leakage Guarantee:** Strict exclusion of all target-derived variables (total fuel consumption, total CO₂ emissions, calculated average hourly fuel quotients, or distance derived from fuel burn). Preprocessing statistics (imputation medians) are fitted strictly on the 2022 training partition before transforming test data.
  - **Leak-Free Temporal Holdout Performance:** $R^2 = 0.5734$, $\text{MAE} = 1,256.4\ \text{MT}$ on the benchmark sample across 3 quantum-selected independent features (`ship_type`, `time_at_sea_hours`, `efficiency_val_gco2_per_tnm`), outperforming Classical GA-GBM ($R^2 = 0.5563$).
  - **Calibrated Conformal Prediction:** Includes split-conformal 95% confidence intervals fitted on validation residuals, achieving **94.89% empirical test coverage** on the untouched 2023 holdout.
- **Operational Voyage Simulator (`[MODELED ESTIMATE]`):**
  - First-principles Holtrop-Mennen calm-water friction + Kwon added wave resistance for voyage-level speed, draft, and wave simulations.

### Authoritative Data Sources & Offline Reproducibility
| Dataset | Source Agency | Raw Records | Cleaned Output | SHA-256 Checksum | Scope Note |
|---|---|---|---|---|---|
| **EMSA THETIS-MRV 2022** | European Maritime Safety Agency | 13,059 ships | `data/mrv/mrv_cleaned_vessels.csv` | Official EU Maritime Reporting | Full archive training set |
| **EMSA THETIS-MRV 2023** | European Maritime Safety Agency | 12,632 ships | `data/mrv/mrv_cleaned_vessels.csv` | Future Temporal Holdout Test | Unseen future holdout |
| **UN/LOCODE 2024-2** | UNECE | 11,829 ports | `data/ports/ports_cleaned.csv` | Standard Port Geolocation Registry | Transport geographic points |
| **Curated Hub Terminals** | Port Authorities & Grid Operators | 7 terminals | Calibrated Engineering Model | Verified Shore Power & Grid CI | Calibrated simulation assets |
| **Committed Offline Fixture** | SIH26138 Repository | 1,000 ships | `data/fixtures/mrv_sample.csv` | Deterministic offline verification | Guaranteed offline fallback |

---

## 3. Mathematical & Algorithmic Formulation

### Quantum-Inspired Evolutionary Feature Selection (QIEA-FS)
QIEA-FS represents feature inclusion probabilities as quantum probability amplitudes:
$$|q_j\rangle = \cos(\theta_j)|0\rangle + \sin(\theta_j)|1\rangle, \quad \theta_j \in [0, \pi/2]$$

Features are collapsed into binary masks by sampling against $\sin^2(\theta_j)$ and updated via unitary rotation gates:
$$U(\Delta\theta_j) = \begin{bmatrix} \cos(\Delta\theta_j) & -\sin(\Delta\theta_j) \\ \sin(\Delta\theta_j) & \cos(\Delta\theta_j) \end{bmatrix}$$

### Multi-Objective Green Fleet Optimization (MO-QIEA)
The decision vector $\mathbf{x} = [(\text{corridor}_v, \text{speed}_v, \text{fuel}_v, \text{shore\_power}_v)]_{v=1}^{N_v}$ optimizes three competing objectives under budget parity:
1. **Total Operational Expenditure:**
   $$\min f_1(\mathbf{x}) = \sum_{v \in \mathcal{V}} \left[ C_{\text{bunker}}(v) + C_{\text{charter}}(v) + C_{\text{cold-ironing}}(v) + C_{\text{voluntary-tax}}(v) + C_{\text{ETS}}(v) + C_{\text{FuelEU}}(v) \right]$$
2. **Well-to-Wake Lifecycle GHG Emissions:**
   $$\min f_2(\mathbf{x}) = \sum_{v \in \mathcal{V}} \left[ E^{\text{WTT}}(v) + E^{\text{TTW}}(v) + E^{\text{grid}}(v) \right] \quad [\text{tCO}_2\text{e}]$$
3. **Demand Satisfaction & Schedule Reliability:**
   $$\max f_3(\mathbf{x}) = \text{Demand Satisfaction Pct} - \lambda \cdot \text{Delay Penalty}$$

### Dynamic Maritime Regulations
- **IMO CII (MEPC.354(78)):** Dynamic Annual Efficiency Ratio ($\text{AER} = \frac{\text{Fuel} \times C_F}{\text{DWT} \times \text{Distance}}$) evaluated against 2026 reduction factor $Z=11\%$ to assign discrete letter grades **A**, **B**, **C**, **D**, or **E**.
- **FuelEU Maritime (Regulation EU 2023/1805):** Mandated GHG intensity limits (89.34 $\text{gCO}_2\text{eq/MJ}$ in 2026) with regulatory deficit penalty: $\text{Penalty} = \frac{|\text{CB}|}{\text{GHGIE}_{\text{actual}} \times 41{,}000\ \text{MJ/t}} \times €2{,}400$.
- **EU ETS Maritime Directive (EU) 2023/959:** 100% intra-EU, 50% extra-EU, and 0% non-EU allowance surrender for commercial vessels $\ge 5,000\ \text{GT}$.

---

## 4. Empirical Benchmarks (Scientific Parity)

All models and algorithms are benchmarked transparently on identical hardware under matched computational budgets.

### A. EMSA THETIS-MRV Real Holdout Benchmark (Train=2022, Test=2023)

We report performance on both the stratified 2,500-vessel benchmark partition (for fast, reproducible verification in `docs/benchmark_results.json`) and the complete 25,691-record official archive (representing 15,924 distinct IMO vessels):

#### Stratified Benchmark Partition (Train: 1,044 | Val: 184 | Test: 1,272)
| Model | $R^2$ Score | MAE (Annual MT) | Features Used | Latency |
|---|:---:|:---:|:---:|:---:|
| **Classical Ridge Regression (Linear Baseline)** | 0.3971 | 1,736.1 MT | 8 / 8 | 0.000 ms |
| **Classical Random Forest (Non-Linear Baseline)** | **0.6284** | **1,190.8 MT** | 8 / 8 | 0.020 ms |
| **Classical GA-GBM (Genetic Feature Selection)** | 0.5563 | 1,274.3 MT | 3 / 8 | 0.001 ms |
| **Proposed QIEA-GBM (Rotation Gate Selection)** | 0.5734 | 1,256.4 MT | **3 / 8** | **0.002 ms** |

#### Complete Cleaned Archive (2022: 13,059 | 2023: 12,632)
- **Classical Random Forest (Full 8 Features):** $R^2 = 0.7350$, $\text{MAE} = 1,050.5\ \text{MT}$
- **Proposed QIEA-GBM (Parsimonious 2 Features):** $R^2 = 0.4318$, $\text{MAE} = 1,754.9\ \text{MT}$

> **Methodological Takeaway:** Random Forest provides the highest raw predictive accuracy when all 8 technical variables are available. QIEA-FS functions as a parsimonious metaheuristic: by retaining only the 2–3 most physically informative features (`ship_type`, `time_at_sea_hours`, `efficiency_val_gco2_per_tnm`), it reduces data ingestion overhead and enables sub-microsecond batch inference latency with calibrated 94.89% empirical conformal prediction intervals.

### B. Matched-Budget Multi-Objective Fleet Optimization Benchmark (1,050 Evals)
| Algorithm | Pareto Front Size | Feasibility | Hypervolume | Spacing ($\Delta$) | Min Fuel | Min WTW GHG | Runtime |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Proposed MO-QIEA** | **4** | **100.0%** | 0.1839 | **0.0254** | 10,643.5 MT | 37,034.4 t | 0.80 s |
| **NSGA-II (Baseline)** | 2 | 100.0% | 0.2366 | 0.0000 | 9,979.4 MT | 37,035.3 t | 1.44 s |
| **MO-PSO (Baseline)** | 2 | 100.0% | **0.2577** | 0.0000 | **9,511.3 MT** | **34,247.4 t** | **0.50 s** |

- **Hypervolume Winner:** MO-PSO converges rapidly and captures the largest hypervolume ($0.2577$).
- **Pareto Diversity Winner:** MO-QIEA generates a significantly more diverse and well-spread non-dominated frontier (4 distinct compromise solutions across the knee curve, with uniform spacing spread $\Delta = 0.0254$), preventing premature convergence into a single point cluster and offering maritime dispatchers genuine operational choice.

> **Regulatory Scope Clarification:** Single-voyage CII calculations rendered in dispatch solutions represent indicative operational estimates per IMO MEPC.354(78) and do not substitute for official year-long verified SEEMP Part III compliance assessments. The SHA-256 canonical hash documents mathematical input/output simulation determinism under the specified inputs and random seed; it does NOT constitute statutory third-party verifier certification. Similarly, UN/LOCODE coordinates designate transport points and do not certify terminal-level cold-ironing electrical infrastructure.

---

## 5. Architecture Diagrams (Excalidraw)

Editable vector architecture models are maintained in `docs/architecture/` and available via shareable Excalidraw URLs:

1. **System Topology & Dual UI Context:** [`docs/architecture/system_diagram.excalidraw`](file:///mnt/Jayant/Code/Work%20Station/SIH/SIH26138/docs/architecture/system_diagram.excalidraw)
2. **Data Pipeline & QIEA Feature Selection:** [`docs/architecture/data_pipeline.excalidraw`](file:///mnt/Jayant/Code/Work%20Station/SIH/SIH26138/docs/architecture/data_pipeline.excalidraw) — [View on Excalidraw](https://excalidraw.com/#json=n-itRtyOpm5FKHBGcltVX,UfpenE2uEDtQH5TITqxKuA)
3. **MO-QIEA Quantum Optimization Workflow:** [`docs/architecture/optimization_workflow.excalidraw`](file:///mnt/Jayant/Code/Work%20Station/SIH/SIH26138/docs/architecture/optimization_workflow.excalidraw) — [View on Excalidraw](https://excalidraw.com/#json=38PiMSS0D6s2H0O04FkyE,d56ftXHVVSBXXqU9yThA_Q)
4. **Mission Dispatcher Decision Flow:** [`docs/architecture/user_flow.excalidraw`](file:///mnt/Jayant/Code/Work%20Station/SIH/SIH26138/docs/architecture/user_flow.excalidraw) — [View on Excalidraw](https://excalidraw.com/#json=2duetaYbbcTwQduEWXyK4,2keQi2-qDi7L88kchMLR1g)

---

## 6. Quick Start & Execution

### Prerequisites
- Python 3.11+
- Node.js 18+ (`pnpm` auto-detected, fallback to `npm`)
- Linux, macOS, or WSL2

### One-Command Startup
To launch both the FastAPI backend and React frontend concurrently:

```bash
git clone <repository-url>
cd SIH26138
chmod +x scripts/run_all.sh
./scripts/run_all.sh
```

- **Frontend Application:** [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **Backend API & Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Data Provenance Ledger:** [http://127.0.0.1:8000/api/scenarios/provenance](http://127.0.0.1:8000/api/scenarios/provenance)

### Automated Test Suite
```bash
.venv/bin/pytest backend/tests/ -v
```
*Executes all 39 unit, integration, and regulatory tests covering domain models, Holtrop hydrodynamics, QIEA feature selector, MRV empirical holdout accuracy, IMO CII calculations, FuelEU penalties, UN/LOCODE pagination, CSV strict validation, version 2.0 cryptographic audit hash tamper-resistance, HTML escaping against markup injection, and PDF binary parity.*

### Headless CLI Benchmark Runner
```bash
.venv/bin/python scripts/run_benchmarks.py
```
*Runs all 3 phases (Hydrodynamic voyage prediction, EMSA MRV temporal holdout benchmark, and Matched-budget fleet optimization) and persists results to `docs/benchmark_results.json`.*

### Data Ingestion Pipeline (Optional Live Re-Fetch)
```bash
.venv/bin/python scripts/ingest_real_data.py
```
*Re-downloads original EMSA THETIS-MRV datasets, UN/LOCODE port tables, generates cleaned sets, and updates `data/data_provenance_manifest.json`.*

---

## 7. License & SIH Attribution

Developed for the **Smart India Hackathon** under **Problem Statement SIH26138**: *Quantum-Inspired Fuel Consumption Prediction and Green Fleet Optimization*.

Licensed under the MIT License.
