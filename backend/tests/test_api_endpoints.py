"""Integration tests for FastAPI REST API endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Verifies API health status."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "engines" in data


def test_scenarios_and_fuels_endpoints():
    """Verifies scenario listings and authoritative fuel registry."""
    res_scen = client.get("/api/scenarios/list")
    assert res_scen.status_code == 200
    scenarios = res_scen.json()
    assert len(scenarios) >= 1

    res_fuels = client.get("/api/scenarios/fuels/registry")
    assert res_fuels.status_code == 200
    fuels = res_fuels.json()
    fuel_codes = [f["code"] for f in fuels]
    assert "VLSFO" in fuel_codes
    assert "LNG" in fuel_codes
    assert "BIO_METHANOL" in fuel_codes
    assert "SHORE_POWER" in fuel_codes


def test_predict_fuel_api():
    """Verifies prediction REST endpoint."""
    payload = {
        "vessel_type": "Container_UltraLarge",
        "dwt": 195000,
        "speed_knots": 19.0,
        "cargo_load_ratio": 0.85,
        "draft_meters": 15.0,
        "wind_speed_knots": 14.0,
        "wave_height_meters": 2.0,
        "current_knots": 0.3,
        "fuel_type": "BIO_METHANOL",
        "use_quantum_feature_selector": True
    }
    res = client.post("/api/predict/fuel", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_fuel_mt_per_day"] > 0
    assert data["lhv_adjusted_daily_mt"] > 0
    assert len(data["feature_importance_mask"]) > 0
    assert data["inference_latency_ms"] < 25.0


def test_optimize_and_report_flow():
    """Verifies optimization run execution and HTML/JSON report streaming."""
    opt_payload = {
        "scenario_id": "global_liner_2026",
        "algorithm": "MO-QIEA",
        "population_size": 15,
        "generations": 10,
        "carbon_tax_per_ton": 100.0,
        "random_seed": 42
    }
    res_opt = client.post("/api/optimize/run", json=opt_payload)
    assert res_opt.status_code == 200
    opt_data = res_opt.json()
    run_id = opt_data["run_id"]
    assert len(opt_data["pareto_front"]) >= 1

    # Fetch HTML report
    res_rep = client.get(f"/api/reports/html/{run_id}")
    assert res_rep.status_code == 200
    assert "GREEN FLEET DEPLOYMENT & ESG AUDIT LEDGER" in res_rep.text
    assert "IMO MEPC.376(80)" in res_rep.text

    # Fetch JSON ledger
    res_json = client.get(f"/api/reports/json/{run_id}")
    assert res_json.status_code == 200
    ledger = res_json.json()
    assert "hash" in ledger
    assert ledger["run_id"] == run_id
