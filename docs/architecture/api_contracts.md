# API Contracts and Data Validation
## RESTful Endpoints, Request/Response Schemas, and Error Handling

### 1. Prediction Endpoints

#### `POST /api/predict/fuel`
Predicts fuel consumption for a given vessel and operational voyage state.

**Request Body (`PredictFuelRequest`)**:
```json
{
  "vessel_type": "Container_UltraLarge",
  "dwt": 165000,
  "speed_knots": 19.5,
  "cargo_load_ratio": 0.85,
  "draft_meters": 14.2,
  "wind_speed_knots": 18.0,
  "wave_height_meters": 2.5,
  "current_knots": 0.5,
  "fuel_type": "LNG",
  "use_quantum_feature_selector": true
}
```

**Response (`PredictFuelResponse`)**:
```json
{
  "predicted_fuel_mt_per_day": 82.45,
  "specific_fuel_oil_consumption_g_per_kwh": 168.2,
  "estimated_shaft_power_kw": 48200.0,
  "feature_importance_mask": [1, 1, 1, 0, 1, 1, 0, 1],
  "model_version": "qiea-gbm-v1.0",
  "inference_latency_ms": 3.8
}
```

---

### 2. Multi-Objective Optimization Endpoints

#### `POST /api/optimize/run`
Runs multi-objective fleet optimization using MO-QIEA, NSGA-II, or MO-PSO.

**Request Body (`OptimizeRunRequest`)**:
```json
{
  "scenario_id": "asia_europe_express",
  "algorithm": "MO-QIEA",
  "population_size": 40,
  "generations": 50,
  "carbon_tax_per_ton": 100.0,
  "weather_severity_factor": 1.0,
  "fuel_price_multipliers": {
    "VLSFO": 1.0,
    "LNG": 1.0,
    "BIO_METHANOL": 1.0,
    "GREEN_H2": 1.0,
    "GREEN_NH3": 1.0
  },
  "random_seed": 42
}
```

**Response (`OptimizeRunResponse`)**:
```json
{
  "run_id": "run_20261003_041201_moqiea",
  "algorithm": "MO-QIEA",
  "execution_time_seconds": 3.42,
  "generations_completed": 50,
  "total_evaluations": 2000,
  "pareto_front": [
    {
      "solution_id": "sol_01",
      "fuel_mt": 1420.5,
      "cost_usd": 1284500.0,
      "lifecycle_ghg_tco2e": 3840.2,
      "schedule_delay_hours": 0.0,
      "demand_satisfied_pct": 100.0,
      "is_feasible": true,
      "vessel_allocations": [
        {
          "vessel_id": "VESSEL_01",
          "route_id": "ROUTE_SUEZ_01",
          "speed_knots": 18.2,
          "fuel_type": "LNG",
          "shore_power_used": true,
          "trips": 1
        }
      ]
    }
  ],
  "convergence_history": [
    {"generation": 1, "best_fuel": 1850.0, "best_cost": 1620000.0, "best_ghg": 5100.0, "hypervolume": 0.52},
    {"generation": 50, "best_fuel": 1420.5, "best_cost": 1284500.0, "best_ghg": 3840.2, "hypervolume": 0.84}
  ]
}
```

---

### 3. Benchmarking Endpoints

#### `POST /api/benchmarks/compare`
Executes matched-budget benchmark across MO-QIEA, NSGA-II, and MO-PSO.
