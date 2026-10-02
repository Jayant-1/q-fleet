# Test Strategy and Threat Review
## Quality Assurance, Threat Modeling, and Failure Modes

### 1. Test Levels & Coverage
- **Unit Tests**: Domain models, fuel LHV conversions, WTT/TTW emission math, Holtrop-Mennen resistance formula, Q-bit rotation logic.
- **Contract Tests**: FastAPI request and response schema validation using Pydantic V2.
- **Integration Tests**: End-to-end API workflows (`/api/predict/fuel`, `/api/optimize/run`, `/api/reports/export`).
- **Reproducibility Tests**: Validating that fixed seed $S=42$ yields bitwise identical Pareto fronts.
- **UI & System Tests**: Playwright browser verification of navigation, dark theme visual components, slider responses, and report rendering.

---

### 2. Threat Review and Failure Modes

| Risk / Failure Mode | Severity | Impact | Mitigation Strategy |
|---|---|---|---|
| **Infeasible Solution Claimed Optimal** | Critical | Cargo left stranded; regulatory breach | Algorithmic repair operator actively boosts trips or adds vessels before objective evaluation; quadratic penalties applied if still unfeasible. |
| **Data Leakage in Prediction** | High | Overfitted accuracy; poor real-world generalization | Feature scalers fitted strictly on training partition; zero test leakage. |
| **Local Pareto Stagnation** | Medium | Suboptimal green fuel adoption | Quantum Catastrophe operator detects population diversity collapse and resets superposition amplitudes. |
| **Shore Power Misapplication** | High | Erroneously assuming zero-emission ocean cruising | Shore power logic mathematically restricted to berth duration ($T_{\text{berth}}$) and port cold-ironing availability ($A_{\text{shore}}=1$). |
| **Numerical Instability in MAPE** | Low | Division by zero or huge percentages | Guard clauses when target fuel is near zero; primary metric is MAE and RMSE. |
