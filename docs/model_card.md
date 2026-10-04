# Q-FLEET Model Card
## Maritime Operational Fuel Consumption & Multi-Objective Green Fleet Deployment
### Smart India Hackathon 2026 — Problem Statement 2 (SIH26138)

---

### 1. Model Details

- **Model Name**: Q-FLEET Hybrid Hydrodynamic & Quantum-Inspired Empirical Predictor
- **Version**: 2.0.0
- **Model Date**: October 2026
- **Model Type**: Hybrid Physics-Informed Metaheuristic & Sparse Gradient Boosted Regressor
  - **Physics Core**: Holtrop-Mennen (1982/1984) Semi-Empirical Calm-Water Resistance Equations + ISO 15016 Weather Added Resistance Formulation.
  - **Machine Learning Regressors (Stratified MRV Benchmark on 2,500 Subsampled Records)**:
    - **Classical Random Forest Regressor** (Accuracy Benchmark Leader): $R^2 = 0.6284$, $\text{MAE} = 1,190.8\text{ MT}$ (8 features)
    - **Quantum-Inspired QIEA-GBM Sparse Regressor** (Proposed Parsimonious Model): $R^2 = 0.5734$, $\text{MAE} = 1,256.4\text{ MT}$ (3 features: `time_at_sea_hours`, `annual_technical_efficiency`, `operational_speed_proxy`, latency $0.002\text{ ms}$)
    - **Classical GA-GBM Regressor** (Genetic Algorithm Baseline): $R^2 = 0.5563$, $\text{MAE} = 1,274.3\text{ MT}$ (3 features)
    - **Classical Ridge Regression Baseline** (Linear Model): $R^2 = 0.3971$, $\text{MAE} = 1,736.1\text{ MT}$ (8 features)
  - **Optimization Engine**: Multi-Objective Quantum-Inspired Evolutionary Algorithm (MO-QIEA) with dynamic multi-state Q-bit rotation angles $\Delta \theta$ and catastrophe mutation operator.
- **License**: MIT License (Smart India Hackathon Open Submission)

---

### 2. Intended Use & Domain Scope

#### Primary Intended Uses
- Multi-objective dispatch planning across commercial shipping corridors (Asia–Europe, Transpacific, Transatlantic, Intra-Europe, Indian Ocean).
- Trade-off analysis between voyage fuel burn, operational expenditure ($ USD/voyage), and lifecycle greenhouse gas emissions ($\text{tCO}_2\text{e}$ Well-to-Wake).
- Pre-voyage statutory compliance auditing and decision support under:
  - IMO Resolution MEPC.354(78) Carbon Intensity Indicator (CII, Grades A–E).
  - European Union Regulation (EU) 2023/1805 (FuelEU Maritime) compliance balance and deficit penalties.
  - European Union Directive (EU) 2023/959 (Maritime EU ETS) allowance surrender liabilities.

#### Out-of-Scope & Unintended Uses
- Statutory 12-month SEEMP Part III formal legal certification (the platform generates reproducible mathematical simulations and indicative operational proxies; formal statutory certification requires 365-day accredited verifier logs).
- Real-time engine room sub-second throttle automation or ECDIS automated rudder steering.

---

### 3. Training & Validation Data Provenance & Dataset Partitioning

- **Data Source**: Official European Maritime Safety Agency (EMSA) THETIS-MRV Public Registry (Reporting Years 2022 and 2023).
- **Vessel Population**: 25,691 verified annual commercial reporting records across 15,924 distinct IMO vessels (10,050 vessels report across both years).
- **Vessel Classes Represented**:
  - Container Ships (Feeder, Panamax, Post-Panamax, Ultra-Large Container Vessels up to 24,000 TEU).
  - Bulk Carriers (Handysize, Supramax, Capesize).
  - Oil & Chemical Tankers (Aframax, Suezmax, VLCC).
  - LNG Carriers (Membrane & Spherical Moss type).
  - Ro-Ro Cargo & Pure Car/Truck Carriers (PCTC).
- **Dataset Partitioning Methodology**:
  The empirical models operate under strict temporal holdout to guarantee zero future data leakage:
  - **Training Partition (Reporting Period 2022)**: 1,044 samples (85% of 2022 sampled partition).
  - **Validation / Calibration Partition (Reporting Period 2022)**: 184 samples (15% of 2022 sampled partition).
  - **Unseen Future Test Holdout (Reporting Period 2023)**: 1,272 samples (100% of 2023 sampled partition).
  - **Sampling & Pipeline Calibration**: The 2,500-record benchmark subset is created via stratified sampling (`max_samples=2500`, deterministic `seed = 42`) across vessel types. Imputation medians and feature scalers are fitted strictly on the 2022 training rows, ensuring that no lookahead information from 2023 leaks into model parameters.
- **Zero Target Leakage Guarantee**: Complete exclusion of target columns (`total_fuel_consumption_m_tonnes`, `annual_total_co2_emissions_m_tonnes`) during feature transformation.

---

### 4. Conformal Prediction & Uncertainty Quantification

To provide mathematically sound confidence intervals for maritime dispatchers, predictions utilize non-parametric inductive split-conformal prediction intervals:
- **Coverage Target**: 95% Empirical Confidence ($\alpha = 0.05$).
- **Calibration Method**: Split-conformal calibration evaluated against validation residuals, achieving approximately 94.89% empirical test coverage on unseen 2023 holdout voyages.
- **Output Bounds**: Every annual estimate reports:
  $$\hat{y} \pm q_{1-\alpha}\left(|y - \hat{y}|\right)$$
  where $q_{1-\alpha}$ represents the $1-\alpha$ empirical quantile of non-conformity scores computed on calibration holdout data.

---

### 5. Algorithmic Optimization Benchmarking

All algorithms were evaluated on identical hardware under matched computational budgets of 1,050 objective function evaluations per algorithm with deterministic random seed (`seed = 42`):

| Optimization Algorithm | Hypervolume (HV) | Pareto Front Diversity / Spread ($\Delta$) | Runtime (s) | Pareto Solutions Found | Feasibility Rate (%) |
|---|---|---|---|---|---|
| **MO-PSO** | **0.2577** | 0.0000 | **0.51s** | 2 | 100.0% |
| **MO-QIEA (Proposed)** | 0.1839 | **0.0254** | 0.86s | **4** | 100.0% |
| **NSGA-II** | 0.2366 | 0.0000 | 1.50s | 2 | 100.0% |

> **Scientific Benchmark Findings**:
> - **Hypervolume Leader**: Multi-Objective Particle Swarm Optimization (MO-PSO) achieved highest hypervolume (0.2577) in 0.51 seconds.
> - **Pareto Frontier Uniformity & Spread Leader**: Proposed Quantum-Inspired Evolutionary Algorithm (MO-QIEA) achieved the highest solution diversity and uniform spacing ($\Delta = 0.0254$, front size 4), preventing degenerate clustering at extreme corners and supplying dispatchers with a balanced set of non-dominated compromise solutions.
> - *Note on Generational Distance (GD)*: Generational Distance is omitted because no true closed-form analytical Pareto frontier exists for real-world combinatorial vessel-corridor dispatch.

---

### 6. Currency Reconciliation Architecture (ECB Snapshot)

- **Bunker Fuel Expenditures**: Calculated and quoted in United States Dollars (USD, $) reflecting international marine fuel spot and contract pricing standards.
- **European Regulatory Penalties**: Statutory liabilities under Directive (EU) 2023/959 (EU ETS) and Regulation (EU) 2023/1805 (FuelEU Maritime) are established in Euros (EUR, €).
- **Exchange Rate Benchmark**: Converted using an official European Central Bank (ECB) Reference Rate benchmark snapshot of **1.08 USD/EUR** (€1.00 = $1.08 USD, snapshot date: October 18, 2024, formula: $\text{amount}_{\text{USD}} = \text{amount}_{\text{EUR}} \times 1.08$).

---

### 7. Canonical Integrity & Fail-Closed Protection

- **Hash Standard**: Canonical SHA-256 deterministic fingerprint (version 2.0).
- **Protected Fields**: All scenario inputs (carbon tax, weather multiplier, demand, random seed, speed limits, operating draft, custom fleet, FX rate and date) and all visible solution allocations (vessel ID, route, speed, fuel type, draft, round trips, cargo, fuel burn, operational cost, GHG emissions, regulatory ratings).
- **Fail-Closed Security**: Evaluated across 13 distinct tampering categories. Any unauthorized alteration to persisted records immediately fails validation and causes endpoints (`/api/optimize/run/{id}`, `/api/reports/html/{id}`, `/api/reports/pdf/{id}`) to fail closed and return HTTP 400.
