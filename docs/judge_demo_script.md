# Q-FLEET Evaluator & Judge Demonstration Script
## Smart India Hackathon 2026 — Problem Statement 2 (SIH26138)
### Duration: 3 Minutes | Live System Walkthrough

---

### Prerequisites & Setup
1. **Frontend**: Open `http://127.0.0.1:5173/` in your browser.
2. **Backend**: FastAPI server running at `http://127.0.0.1:8000/docs`.
3. **Screen Size**: Works seamlessly on any screen (Desktop 1440px, Tablet, or Mobile 390px/320px).

---

### Step-by-Step Evaluator Script

#### [00:00 – 00:35] Act 1: The Problem & Real-World Ground Truth
1. **Landing Page (`http://127.0.0.1:5173/`)**:
   - Point out the headline: **Quantum-Inspired Maritime Fuel Prediction & Green Fleet Deployment**.
   - Show the evaluator the **Proven Data Foundation** badge:
     - **15,924** unique commercial vessels.
     - **25,691** official European Maritime Safety Agency (EMSA) THETIS-MRV reporting records.
     - **11,829** international UN/LOCODE standardized transport locations.
   - Highlight the **Scientific Claim-Evidence Disclosure**: every metric is explicitly categorized as measured data, modeled voyage estimate, empirical prediction, or regulatory proxy.
2. **Click "LAUNCH DISPATCH COCKPIT"**:
   - Observe the smooth expanding circle transition directly into the operational dashboard (`/dashboard`).

---

#### [00:35 – 01:15] Act 2: Naval Architecture Physics & Monotonicity
1. **Navigate to the "Naval Physics" tab**:
   - Demonstrate the hydrodynamic engine based on Holtrop-Mennen resistance equations and ISO 15016 wave drag:
     `P_B = (R_T · V) / η_D (power scales non-linearly with speed, approximately P ~ V³)`
   - Move the **Vessel Speed Slider** (e.g. from 14 knots to 20 knots).
   - Point out the cubic surge in engine shaft power and daily fuel burn.
   - Adjust the **Operating Draft** slider: observe the increase in wetted hull surface area and displacement resistance.
   - Mention: *"Our physics model is monotonically increasing with speed and draft, preventing non-physical artifacts."*

---

#### [01:15 – 02:00] Act 3: Multi-Objective Quantum Optimization (MO-QIEA)
1. **Navigate to the "Pareto Optimization" tab**:
   - Highlight the conflicting objectives:
     1. Minimize voyage fuel consumption (Metric Tons).
     2. Minimize operational expenditure (USD).
     3. Minimize Well-to-Wake greenhouse gas emissions (tCO2e).
   - Click **"RUN QUANTUM SOLVER"**:
     - Observe the solver completing in under 2 seconds.
     - Watch the dynamic non-dominated Pareto frontier render.
   - Hover over different solutions on the frontier:
     - Show the **Speed-Optimized Plan** vs the **Green Bio-Methanol Plan** vs the **Cost-Compromise Plan**.
   - Inspect the **Corridor Allocation Table**:
     - Note the physical vessel speed clamping and schedule recovery annotations.
     - Point out the alternative fuel pathways (VLSFO, LNG, Bio-Methanol, Shore Power).

---

#### [02:00 – 02:35] Act 4: Statutory Maritime Compliance & Sensitivity Sandbox
1. **Navigate to the "Compliance & CII" tab**:
   - Show the **IMO Carbon Intensity Indicator (CII)** ratings:
     - Attained AER vs required reference line per MEPC.354(78) with discrete letter grades (A through E).
   - Show **Regulation (EU) 2023/1805 (FuelEU Maritime)** compliance balance and €2,400 statutory penalty.
   - Show **Directive (EU) 2023/959 (Maritime EU ETS)** surrender cost at 100% phase-in.
   - Point out the **Dual Currency Exposure**:
     - Bunker fuels in USD ($), EU liabilities in EUR (€) converted at the European Central Bank (ECB) benchmark of **1.08 USD/EUR**.
2. **Test the "Sensitivity Sandbox"**:
   - Increase the **Carbon Tax Slider** (e.g. to $250/ton).
   - Point out the **Stale Parameters Indicator** (amber pulsing dot indicating inputs deviated from the displayed run).
   - Re-run the optimizer to show dynamic adaptation towards low-carbon alternative fuels.

---

#### [02:35 – 03:00] Act 5: Audit Ledger, Cryptographic Parity, & PDF Export
1. **Cryptographic Parity & Report Generation**:
   - Click **"EXPORT PDF"** in the top navigation header:
     - Observe the generated audit report with executive KPIs, vessel mix, and the **Canonical SHA-256 Fingerprint**.
   - Mention the fail-closed security guarantee:
     - *"Any modification to scenario inputs, custom fleet, vessel speeds, or allocations invalidates the SHA-256 hash, causing the system to fail closed (HTTP 400)."*
2. **Conclude with Evaluation Summary**:
   - 45+ automated backend tests passing with 0 warnings.
   - Clean Vite production build with zero TypeScript errors.
   - Playwright automated verification covering 23 end-to-end scenarios and 30 viewport checks across 320px–1440px with 0px horizontal overflow.
   - A mathematically honest, fully reproducible hackathon submission.
