# Q-FLEET Enterprise Scaling Architecture
**System:** SIH26138 (Q-FLEET)  
**Target Operational Scale:** 500+ commercial vessels, 100+ global corridors, multi-tenant fleet operator deployments  
**Performance Mandate:** Sub-second interactive simulation, high-throughput batch scheduling, and zero downtime compliance reporting

---

## 1. System Overview & Scalability Challenges

Commercial maritime operations exhibit unique workload characteristics:
1. **Interactive Real-Time Exploration:** Dispatchers adjust fuel tax and speed sliders on single corridors, expecting sub-2-second response times.
2. **Batch Fleet Scheduling:** Periodic quarterly deployment runs across 100+ vessels and 20+ corridors require heavy computational genetic search.
3. **Audit Immutability:** Regulatory classification bodies require tamper-proof historical ledgers accessible for 5+ years under IMO/EU mandates.

To satisfy these conflicting requirements, Q-FLEET adopts a **decoupled, multi-tier asynchronous architecture**:

```
                       [Clients / Dispatchers / Mobile]
                                      │
                               (HTTPS / TLS 1.3)
                                      ▼
                        [API Gateway / Load Balancer]
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
      [FastAPI Ingestion Tier]                  [Static Web Frontend]
       (Stateless Workers)                       (Edge CDN / NGINX)
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
 [Redis Hot Cache]    [Celery / Redis Task Queue]
  - UN/LOCODE Ports    - Batch QIEA / NSGA-II Jobs
  - Physics Meshes     - Multi-corridor sweeps
       │                   │
       ▼                   ▼
 [PostgreSQL Multi-Tenant DB] ──> [Immutable S3 Storage]
  - Partitioned Voyage Records     - Signed Audit PDFs
  - SHA-256 Ledger Hashes          - Machine JSON Packs
```

---

## 2. Core Architectural Components

### 2.1 Stateless API Ingestion Tier (FastAPI)
- **Framework:** FastAPI running on Uvicorn workers behind an NGINX reverse proxy.
- **Horizontal Scaling:** Auto-scales based on CPU utilization and request concurrency via Kubernetes Horizontal Pod Autoscaler (HPA).
- **Lightweight Responsibilities:** Validates incoming Pydantic schemas, handles user authentication (JWT / OAuth2), and dispatches long-running jobs to the background task queue.

### 2.2 In-Memory Hydrodynamic Hot Cache (Redis)
- **Hydrodynamic Precomputation:** Resistance calculations for standard hull forms (Holtrop-Mennen wetted surface area, viscous drag, and wave resistance coefficients) are pre-calculated across discrete speed-draft meshes and cached in Redis.
- **UN/LOCODE Geodesic Routing:** Distance matrices and waypoint coordinates across global shipping corridors are held in memory for immediate retrieval ($O(1)$ access).
- **Latency Optimization:** Reduces solver evaluation time from ~1.5s to $<400	ext{ ms}$ for standard corridor evaluations.

### 2.3 Asynchronous Optimization Worker Pool (Celery / Redis)
- **Task Decoupling:** Single-corridor interactive evaluations execute synchronously within the API worker. Complex multi-fleet quarterly deployments are enqueued as asynchronous Celery tasks.
- **Worker Allocation:** High-priority queues serve interactive dispatchers; low-priority queues process overnight multi-objective parameter sweeps.
- **Hardware Acceleration:** Mathematical inner loops use vectorized NumPy / C-extensions, fully utilizing all available CPU cores without Global Interpreter Lock (GIL) contention.

### 2.4 Multi-Tenant Database Architecture (PostgreSQL)
- **Tenant Isolation:** Fleet operators have dedicated schemas or Row-Level Security (RLS) policies enforcing complete data privacy between competitors.
- **Partition Pruning:** Voyage tables are partitioned by calendar year (`voyages_2025`, `voyages_2026`) and corridor region, preventing index bloat as the database grows to millions of voyage legs.
- **Cryptographic Hash Ledger:** Every committed optimization run stores its canonical SHA-256 fingerprint in an append-only audit table with cryptographic foreign keys.

### 2.5 Immutable Artifact Store (S3-Compatible Object Storage)
- **Audit Packs:** Generated regulatory PDF reports and machine-readable JSON compliance ledgers are written to AWS S3 / MinIO with Object Lock (WORM: Write Once, Read Many).
- **Integrity Guarantee:** Objects cannot be deleted or modified by dispatchers or administrators for the statutory IMO 5-year retention period.

---

## 3. Performance & Throughput Targets

| Operational Scenario | Target Workload | System Latency Target | Scaling Mechanism |
| :--- | :--- | :--- | :--- |
| **Interactive Route Tuning** | Single route, 15 vessels | $< 2.0	ext{ seconds}$ | Vectorized CPU execution |
| **Fleet-Wide Batch Run** | 100 vessels, 10 corridors | $< 15.0	ext{ seconds}$ | Celery worker parallelization |
| **PDF Audit Generation** | Full report rendering | $< 1.2	ext{ seconds}$ | Headless PDF stream generation |
| **Concurrent Telemetry Ingestion** | 500 vessel noon reports | 10,000 requests/sec | Async FastAPI + Redis queue |

---

## 4. Disaster Recovery & High Availability

1. **Active-Active Redundancy:** Stateless API workers run across multiple availability zones (AZs) with automated failover.
2. **Database Replication:** PostgreSQL primary-replica streaming replication with $< 5	ext{ minute}$ Recovery Point Objective (RPO).
3. **Air-Gapped Standalone Capability:** The complete application bundle can be packaged as a single self-contained Docker Compose appliance for installation on localized port servers or edge computers.
