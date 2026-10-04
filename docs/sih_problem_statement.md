# Smart India Hackathon 2026 — Problem Statement Transcription
## Problem Statement ID: SIH26138
### Category: Software / Clean & Green Technology / Logistics & Transportation

---

### Official Title
**Optimal Vessel Scheduling and Green Fleet Deployment for Maritime Logistics**

---

### Background & Context
Maritime transport carries approximately 80% of global trade volume and contributes nearly 3% of global anthropogenic greenhouse gas emissions. With the international adoption of the Revised 2023 IMO GHG Strategy, IMO Resolution MEPC.354(78) on the Carbon Intensity Indicator (CII), the European Union Emissions Trading System (EU ETS Directive 2023/959), and FuelEU Maritime (Regulation EU 2023/1805), commercial shipowners and charterers face unprecedented multi-layered regulatory mandates.

Fleet operators must decide:
1. Which vessel classes to deploy across scheduled liner corridors.
2. What operating speeds and transit drafts to maintain under dynamic sea states (waves, wind, currents).
3. How to schedule voyages to satisfy cargo demand commitments and port berth windows while avoiding contractual delay penalties.
4. Which bunker fuel pathways (VLSFO, MGO, LNG, Bio-Methanol, e-Ammonia, Liquid Hydrogen, and Onshore Power Supply / Cold-Ironing) to select to minimize Well-to-Wake (WTW) lifecycle emissions.
5. How to balance commercial operational expenditures ($ USD) against statutory European carbon allowance costs (€ EUR) and regulatory deficit penalties.

---

### Core Functional Requirements
1. **Naval Hydrodynamic & Empirical Fuel Prediction Engine**:
   - Model hydrodynamic resistance (frictional, wave-making, shallow-water squat) and added weather resistance (wind, waves, currents).
   - Ingest and calibrate models against real-world European Maritime Safety Agency (EMSA) THETIS-MRV commercial vessel reporting data.
   - Provide statistical confidence or conformal prediction intervals for estimated fuel consumption.

2. **Multi-Objective Green Fleet Deployment Optimization**:
   - Formulate and solve a Pareto-optimal multi-objective optimization problem:
     - Objective 1: Minimize total voyage fuel consumption (MT).
     - Objective 2: Minimize total commercial operating expenditure ($ USD, including bunker, charter, shore-power, and carbon levies).
     - Objective 3: Minimize Well-to-Wake lifecycle GHG emissions ($\text{tCO}_2\text{e}$).
   - Enforce constraints: 100% cargo demand satisfaction, physical vessel speed limits, hull draft restrictions, and arrival deadlines.
   - Identify the compromise knee-point solution representing the optimal commercial-environmental balance.

3. **Statutory Decarbonization Mandate Accounting**:
   - Calculate operational Carbon Intensity Indicator (CII) and discrete letter grades (A through E) under IMO MEPC.354(78) with 2026 reduction factors.
   - Compute FuelEU Maritime compliance balances and non-compliance deficit penalties (€2,400/t VLSFO-equivalent) under Regulation (EU) 2023/1805.
   - Evaluate EU ETS allowance surrender liabilities under Directive (EU) 2023/959 with geographic scope accounting (100% intra-EU, 50% extra-EU).

4. **Transparent Auditability & Multi-Channel Reporting**:
   - Provide cryptographic proof of calculation determinism and tamper protection (canonical SHA-256 fingerprint).
   - Generate synchronized reports across REST JSON ledgers, interactive printable HTML, and binary ReportLab PDF documents with bit-level numerical parity.

5. **Decision Support System (DSS) Experience**:
   - Interactive, responsive web console operating cleanly across mobile (320px–390px), tablet, and desktop viewports.
   - Real-time sensitivity sandboxes with reactive stale-state notifications and instant recalculation triggers.
