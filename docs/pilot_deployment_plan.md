# Q-FLEET 90-Day Enterprise Pilot Deployment Plan
**Target Implementation:** Commercial Container / Bulk Fleet Operations on Indian & Transcontinental Corridors  
**Alignment:** MoPSW Sagarmala Vision 2030 & Harit Sagar Green Port Guidelines  
**Standard Architecture:** Low-risk, non-intrusive shadow deployment (Zero bridge hardware retrofits required)

---

## 1. Executive Summary & Philosophy

Deploying algorithmic decision-support software in commercial maritime logistics carries zero tolerance for operational disruption. A single delayed vessel can trigger port demurrage charges of $30,000–$80,000 per day or contractual cargo defaults.

Therefore, the Q-FLEET 90-day pilot follows a **four-stage phased roll-out**:
1. **Days 1–15: Shadow Ingestion & Data Telemetry Alignment** (Read-only observation)
2. **Days 16–45: Digital Twin Calibration & Corridor Baselines** (Historical voyage backtesting)
3. **Days 46–75: Active Co-Pilot Dispatcher Trials** (Advisory recommendations alongside human dispatchers)
4. **Days 76–90: Audit Ledger Review & Commercial Expansion Gate** (Verification of modeled vs realized performance)

```
[Day 1-15: Shadow Ingestion] ──> [Day 16-45: Twin Calibration] ──> [Day 46-75: Advisory Pilot] ──> [Day 76-90: Executive Review]
       │                                 │                                 │                               │
Noon-report adapters               Historical voyage                 Live human dispatcher            CII grade preservation
NLP-M / PCS1x parsing              backtesting & validation          speed/fuel advisory              audit & sign-off
```

---

## 2. Phase-by-Phase Execution Schedule

### Phase 1: Data Integration & Shadow Telemetry (Days 1–15)
- **Objective:** Establish automated, secure data ingestion from existing fleet management and port systems without requiring on-board sensor hardware installations.
- **Key Activities:**
  - **Noon Report Ingestion Adapter:** Deploy lightweight parser for standard maritime daily noon reports (CSV, email XML, or API) capturing:
    - GPS coordinates & distance run (last 24 hours)
    - Average engine shaft RPM, indicated power (kW), and vessel speed over ground (SOG)
    - Heavy fuel oil (HFO/VLSFO) and low-sulfur marine gas oil (MGO) daily consumption
    - Mean fore/aft draft and cargo deadweight on board
  - **Indian Port Community System (PCS1x / NLP-Marine) Integration:** Connect to the National Logistics Portal (Marine) API to extract real-time vessel turnaround windows, berth allocations, and tidal gates for JNPA Mumbai (`INNSA`) and Mundra (`INMUN`).
  - **Security & Data Isolation:** Establish tenant-isolated PostgreSQL database instances with TLS 1.3 encryption and role-based access control (RBAC).

### Phase 2: Digital Twin Calibration & Corridor Backtesting (Days 16–45)
- **Objective:** Validate Holtrop-Mennen hydrodynamic parameters against the operator's actual historical voyage telemetry.
- **Key Activities:**
  - **Hull Degradation Factor ($\Delta C_F$):** Calibrate vessel-specific frictional resistance multipliers to account for bio-fouling since the last dry-docking.
  - **Backtesting against 12 Months Historical Data:** Run Q-FLEET in simulation over the operator's prior 100+ voyages on the JNPA Mumbai – Rotterdam corridor.
  - **Discrepancy Analysis:** Verify that Q-FLEET's predicted fuel consumption aligns with actual historical noon reports within a Mean Absolute Percentage Error (MAPE) of $<4.8\%$.
  - **Baseline Agreement Sign-off:** Gain formal agreement from the Chief Technical Officer (CTO) and Fleet Superintendent on the baseline calculation methodology.

### Phase 3: Active Advisory Dispatch Trials (Days 46–75)
- **Objective:** Run Q-FLEET as an operational decision-support tool across 3 to 5 candidate vessels on active commercial voyages.
- **Key Activities:**
  - **Dispatcher Co-Pilot Mode:** Provide commercial dispatchers with Q-FLEET's waypoint-by-waypoint optimal speed and fuel pathway recommendations 48 hours prior to departure.
  - **Master Mariner Discretion:** The vessel Master retains full command authority over vessel speed and heading for safety of life at sea (SOLAS). Recommendations are purely advisory.
  - **Dynamic Weather Reaction:** Monitor weather swell and ocean currents along the route; generate proactive speed recovery advisories if heavy sea states cause schedule delays.
  - **Weekly Dispatcher Syncs:** Conduct weekly feedback sessions with chartering managers and operations staff to refine user experience and report formatting.

### Phase 4: Audit Verification, CII Review, & Rollout Gate (Days 76–90)
- **Objective:** Quantify realized vs modeled savings and establish permanent operational deployment.
- **Key Activities:**
  - **Statutory Compliance Audit:** Recompute attained AER and IMO CII letter grades across the pilot vessels; verify that planned Grade B/C trajectories were successfully preserved.
  - **FuelEU Penalty Avoidance Review:** Audit fuel consumption logs against FuelEU Maritime compliance thresholds to verify avoided financial exposure.
  - **Cryptographic Audit Ledger Generation:** Generate tamper-proof SHA-256 PDF audit packs for submission to internal auditors and classification society representatives.
  - **Executive Go/No-Go Decision Gate:** Deliver formal Pilot Summary Report to the Board of Directors with clear ROI calculations and full fleet rollout roadmap.

---

## 3. Data Integration Architecture & Adapters

```
[Vessel Bridge / Chief Engineer]
             │
      (Daily Noon Report)
             ▼
[Noon-Report Ingestion Engine] ──> [Data Hygiene & Normalization]
             ▲                                    │
             │                                    ▼
[PCS1x / NLP-Marine Port Data] ──> [Q-FLEET Hydrodynamic Optimization Engine]
                                                  │
                                                  ▼
                               [Dispatcher Recommendations & Audit Hash]
```

### Supported Ingestion Standards:
1. **IMO DCS / EU MRV Standard CSV:** Standardized voyage summary schema complying with EMSA THETIS-MRV reporting format.
2. **National Logistics Portal - Marine (NLP-M / PCS1x):** REST API integration for Indian major and non-major port gate timestamps.
3. **NMEA 0183 / 2000 Serial Bridge (Optional Future Extension):** In-port cold-ironing electrical connection telemetry.

---

## 4. Key Performance Indicators (KPIs) & Success Criteria

| Evaluation Metric | Pilot Target | Verification Method |
| :--- | :--- | :--- |
| **Prediction Accuracy** | MAPE $< 5.0\%$ vs actual noon reports | Comparison of predicted daily MT vs tank soundings |
| **Optimization Runtime** | $< 2.0	ext{ seconds}$ per run | Automated latency logging in FastAPI middleware |
| **Cargo Demand Satisfaction** | $100.0\%$ (Zero laycan breaches) | Terminal arrival timestamps vs charter party laycans |
| **IMO CII Grade Preservation** | Maintain Grade B or better | Verified attained AER calculation per MEPC.354(78) |
| **System Uptime** | $> 99.9\%$ availability | Prometheus & Grafana monitoring SLA logs |
| **Dispatcher Adoption** | $> 85\%$ recommendation acceptance rate | Dispatcher action audit log in database |

---

## 5. Risk Mitigation & Safety Protocols

1. **Safety of Life at Sea (SOLAS) Primacy:**
   - Q-FLEET's outputs are strictly decision-support advisories. The ship's Master holds ultimate legal and operational authority over speed, routing, and engine loading.
2. **Fail-Safe Offline Mode:**
   - If satellite communications fail mid-voyage, the system caches voyage plans locally. All cryptographic hashing and compliance calculators run offline without remote server connectivity.
3. **No Hardware Risk:**
   - Because Q-FLEET operates via shoreside telemetry and noon report APIs, there is zero risk of vessel downtime, electrical interference, or dry-dock installation delays.
