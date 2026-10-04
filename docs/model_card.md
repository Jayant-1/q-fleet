# Q-FLEET Model Card
## Maritime Operational Fuel Consumption & Multi-Objective Green Fleet Deployment
### Smart India Hackathon 2026 — Problem Statement 2 (SIH26138)

---

### 1. Model Details

- **Model Name**: Q-FLEET Hybrid Hydrodynamic & Quantum-Inspired Empirical Predictor
- **Version**: 2.0.0
- **Model Date**: October 2026
- **Model Type**: Hybrid Physics-Informed Metaheuristic & Sparse Gradient Boosted Regressor
  - **Physics Core**: Holtrop-Mennen (1982/1984) Semi-Empirical Resistance Equations + ISO 15016 Weather Drag Added Resistance
  - **ML Regressors**:
    - **Random Forest Regressor** (Accuracy Benchmark Leader): $R^2 = 0.6284$, $	ext{MAE} = 1,190.8	ext{ MT}$
    - **QIEA-GBM Sparse Regressor** (Parsimonious Operational Model): $R^2 = 0.5734$, $	ext{MAE} = 1,327.9	ext{ MT}$, 3 Features, Latency $0.002	ext{ ms}$
    - **Ridge Regression Linear Baseline**: $R^2 = 0.5348$, $	ext{MAE} = 1,444.6	ext{ MT}$
  - **Optimization Engine**: Multi-Objective Quantum-Inspired Evolutionary Algorithm (MO-QIEA) with dynamic Q-bit rotation angles $\Delta 	heta$ and catastrophe mutation operator.
- **License**: Smart India Hackathon Evaluator & Educational Open Access

---

### 2. Intended Use & Domain Scope

#### Primary Intended Uses
- Multi-objective dispatch planning across commercial shipping corridors (Asia–Europe, Transpacific, Transatlantic, Intra-Europe, Indian Ocean).
- Trade-off analysis between voyage fuel burn, operational expenditure ($/voyage), and lifecycle greenhouse gas emissions ($	ext{tCO}_2	ext{e}$ Well-to-Wake).
- Pre-voyage statutory compliance auditing under:
  - IMO Resolution MEPC.354(78) Carbon Intensity Indicator (CII, Grades A–E).
  - European Union Regulation (EU) 2023/1805 (FuelEU Maritime) compliance balance and deficit penalties.
  - European Union Directive (EU) 2023/959 (Maritime EU ETS) surrender allowance liabilities.

#### Out-of-Scope & Unintended Uses
- Statutory 12-month SEEMP Part III formal certification (the platform generates reproducible mathematical simulations and indicative operational proxies; statutory certification requires 365-day accredited verifier logs).
- Real-time engine room sub-second throttle automation or ECDIS automated rudder steering.

---

### 3. Training & Validation Data Provenance

- **Data Source**: Official European Maritime Safety Agency (EMSA) THETIS-MRV Public Registry (Reporting Years 2022 and 2023).
- **Vessel Population**: 25,691 verified annual commercial reporting records across 15,924 distinct IMO vessels.
- **Vessel Classes Represented**:
  - Container Ships (Feeder, Panamax, Post-Panamax, Ultra-Large Container Vessels up to 24,000 TEU).
  - Bulk Carriers (Handysize, Supramax, Capesize).
  - Oil & Chemical Tankers (Aframax, Suezmax, VLCC).
  - LNG Carriers (Membrane & Spherical Moss type).
  - Ro-Ro Cargo & Pure Car/Truck Carriers (PCTC).
- **Partitioning Strategy**: Strict 70% Train / 15% Validation / 15% Holdout Test split with deterministic random seed ($S=42$).
- **Zero Target Leakage Guarantee**: Absolute separation of target columns (`total_fuel_consumption_m_tonnes`, `annual_total_co2_emissions_m_tonnes`) during feature extraction.

---

### 4. Conformal Prediction & Uncertainty Quantification

To provide confidence intervals for maritime decision-makers, predictions include non-parametric inductive conformal prediction intervals:
- **Coverage Target**: 90% Empirical Confidence ($lpha = 0.10$).
- **Conformal Margin**: Calibrated against the holdout residual distribution.
- **Output Bounds**: Every annual estimate reports:
  $$\hat{y} \pm q_{1-lpha}\left(|y - \hat{y}|ight)$$
  ensuring bounded risk exposure for fleet environmental compliance teams.

---

### 5. Algorithmic Optimization Benchmarking

Evaluated under strict matched computational budgets (1,050 evaluations per algorithm, $N=42$ random seed):

| Optimization Algorithm | Hypervolume (HV) | Generational Distance (GD) | Spread ($\Delta$) | Runtime (s) | Pareto Solutions Found |
|---|---|---|---|---|---|
| **MO-PSO** | **0.2577** | 0.0812 | 0.4120 | **0.51s** | 5 |
| **MO-QIEA** | 0.2185 | 0.0894 | **0.0254** | 0.86s | 4 |
| **NSGA-II** | 0.2366 | 0.0845 | 0.3890 | 1.50s | 5 |

> **Scientific Fact-Checking Disclosure**:
> - **Hypervolume & Convergence Speed Leader**: Multi-Objective Particle Swarm Optimization (MO-PSO) achieved highest hypervolume (0.2577) in 0.51 seconds.
> - **Pareto Frontier Uniformity & Diversity Leader**: Quantum-Inspired Evolutionary Algorithm (MO-QIEA) achieved the most uniform, well-spaced Pareto distribution ($\Delta = 0.0254$), providing dispatchers with non-clustered, distinct trade-off compromises.

---

### 6. Currency Reconciliation Architecture

- **Bunker Fuel Expenditures**: Calculated and quoted in United States Dollars (USD, $) reflecting global marine fuel spot and contract pricing standards.
- **European Regulatory Penalties**: Statutory liabilities under EU ETS Directive 2023/959 and FuelEU Maritime Regulation (EU) 2023/1805 are established in Euros (EUR, €).
- **Exchange Rate Benchmark**: Converted at the European Central Bank (ECB) Reference Rate benchmark of **1.08 USD/EUR** (€1.00 = $1.08 USD).

---

### 7. Cryptographic Audit Integrity

- **Hash Standard**: Canonical SHA-256 fingerprint version 2.0.
- **Protected Fields**: All scenario inputs (carbon tax, weather multiplier, demand, random seed, speed limits, operating draft, custom fleet) and all visible solution allocations (vessel ID, route, speed, fuel type, draft, round trips, cargo, fuel burn, operational cost, GHG emissions, regulatory ratings).
- **Fail-Closed Security**: Evaluated across 13 distinct tampering categories. Any unauthorized alteration to persisted records immediately fails validation and causes endpoints (`/api/optimize/run/{id}`, `/api/reports/html/{id}`, `/api/reports/pdf/{id}`) to return HTTP 400.
