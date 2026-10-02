# Data Flow and Deployment Architecture
## Pipeline Architecture, Persistence, and Execution Topology

### 1. End-to-End Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Fleet ESG Officer
    participant UI as React 19 Frontend
    participant API as FastAPI Router
    participant Pred as Prediction Service
    participant Opt as MO-QIEA Solver
    participant DB as SQLite Store
    participant Report as Audit Reporter

    Officer->>UI: Selects Scenario (e.g. Asia-Europe Trans-Suez) & Policy Levers
    UI->>API: POST /api/optimize/run {scenario_id, carbon_tax, pop_size=40, gens=50}
    API->>Pred: Inquire Hydrodynamic Resistance & SFOC for (Vessel, Speed, Weather)
    Pred-->>API: Predicted Daily Fuel Consumption (MT/day) & SFOC
    API->>Opt: Initialize Q-bit Superposition Population
    loop 50 Generations
        Opt->>Opt: Collapse Q-bits -> Evaluate (Fuel, Cost, WTW GHG)
        Opt->>Opt: Non-Dominated Sort & Crowding Distance
        Opt->>Opt: Quantum Rotation Gates toward Pareto Elites
    end
    Opt-->>API: Returns Pareto Frontier & Convergence History
    API->>DB: Persist Run Result & Cryptographic Hash
    API-->>UI: Streamed / JSON Pareto Front, Fleet Allocation, and Emissions
    Officer->>UI: Selects Compromise Solution on Pareto Front
    UI->>API: GET /api/reports/export/{run_id}?solution_id=X
    API->>Report: Generate Formal Audit Report (HTML/PDF/JSON)
    Report-->>UI: Downloadable Formal ESG Audit Report
```

---

### 2. Deployment Architecture
- **Single-Command Local Execution**: Orchestrated via `./scripts/run_all.sh`.
- **Backend Service**: Uvicorn running FastAPI on `http://127.0.0.1:8000`.
- **Frontend Service**: Vite serving React 19 SPA on `http://127.0.0.1:5173`.
- **Reverse Proxy / Production Packaging**: Vite proxy routes `/api/*` to FastAPI backend with zero CORS issues in development.
