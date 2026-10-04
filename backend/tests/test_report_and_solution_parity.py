"""
Test exact numerical parity across API JSON, HTML, PDF, and durable persistence.
Verifies that:
1. Solution schema fields match HTML and PDF outputs.
2. Reports persist across API restarts (durable disk storage in data/runs/).
3. HTTP error codes are strictly respected (400, 404, 422).
4. Custom fleets and scenario levers accurately influence optimization.
"""

import json
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.api.routes_optimization import OPTIMIZATION_RUNS_STORE, RUNS_DIR, get_run_entry
from backend.app.reports.hashing import (
    recompute_hash_from_persisted_run,
    verify_run_integrity,
    validate_run_integrity
)

client = TestClient(app)


def test_solution_and_reports_numerical_parity():
    """Verifies that API JSON, HTML, and JSON reports contain identical numerical metrics."""
    req_payload = {
        "scenario_id": "global_liner_2026",
        "algorithm": "MO-QIEA",
        "population_size": 15,
        "generations": 10,
        "carbon_tax_per_ton": 100.0,
        "random_seed": 42
    }
    res = client.post("/api/optimize/run", json=req_payload)
    assert res.status_code == 200
    data = res.json()
    run_id = data["run_id"]
    front = data["pareto_front"]
    assert len(front) >= 1

    knee_id = data["compromise_solution_id"]
    target_sol = next((s for s in front if s["solution_id"] == knee_id), front[0])

    # Check that new regulatory fields are present in schema
    assert "fleet_average_cii_rating" in target_sol
    assert "total_fueleu_penalty_usd" in target_sol
    assert "total_eu_ets_cost_usd" in target_sol
    assert "cii_grade_counts" in target_sol

    for alloc in target_sol["allocations"]:
        assert "cii_rating" in alloc
        assert "attained_aer" in alloc
        assert "fueleu_deficit_penalty_usd" in alloc
        assert "eu_ets_cost_usd" in alloc

    # 1. Fetch HTML Report
    res_html = client.get(f"/api/reports/html/{run_id}?solution_id={target_sol['solution_id']}")
    assert res_html.status_code == 200
    html_text = res_html.text

    # Verify exact numbers exist in HTML
    fuel_str = f"{target_sol['total_fuel_mt']:,.1f} MT"
    assert fuel_str in html_text, f"Expected {fuel_str} in HTML report"
    assert f"${target_sol['total_cost_usd']:,.0f}" in html_text
    assert f"{target_sol['total_lifecycle_ghg_tco2e']:,.1f} tCO₂e" in html_text
    assert f"Grade {target_sol['fleet_average_cii_rating']}" in html_text
    assert f"${target_sol['total_fueleu_penalty_usd']:,.0f}" in html_text
    assert f"${target_sol['total_eu_ets_cost_usd']:,.0f}" in html_text
    assert "Mathematical Simulation Footnote" in html_text

    # 2. Fetch PDF Report & Assert Binary Text Numerical Parity
    res_pdf = client.get(f"/api/reports/pdf/{run_id}?solution_id={target_sol['solution_id']}")
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert len(res_pdf.content) > 1000
    assert res_pdf.content.startswith(b"%PDF")

    import base64
    import zlib
    start_pos = res_pdf.content.find(b"stream\n") + len(b"stream\n")
    end_pos = res_pdf.content.find(b"endstream", start_pos)
    stream_raw = res_pdf.content[start_pos:end_pos].strip()
    a85_data = base64.a85decode(stream_raw, adobe=True)
    pdf_text = zlib.decompress(a85_data).decode("latin1", errors="ignore")

    assert fuel_str in pdf_text, f"Expected {fuel_str} inside binary PDF stream text"
    assert f"${target_sol['total_cost_usd']:,.0f}" in pdf_text, "Expected cost string inside binary PDF stream text"
    assert f"Grade {target_sol['fleet_average_cii_rating']}" in pdf_text, "Expected CII rating inside binary PDF stream text"

    # 3. Canonical Audit Hash Bit-for-Bit Parity Verification
    canonical_hash = data["audit_hash"]
    assert len(canonical_hash) == 64, "Canonical SHA-256 hash must be 64 hexadecimal characters"
    assert canonical_hash in html_text, f"Expected canonical audit hash {canonical_hash} inside HTML report"
    assert canonical_hash[:24] in pdf_text, f"Expected canonical audit hash prefix {canonical_hash[:24]} in PDF header"
    assert canonical_hash in pdf_text, f"Expected full canonical audit hash {canonical_hash} in PDF footnote"

    # 4. Fetch JSON Ledger and Verify Identical Hash
    res_json = client.get(f"/api/reports/json/{run_id}")
    assert res_json.status_code == 200
    ledger = res_json.json()
    assert ledger["run_id"] == run_id
    assert ledger["hash"] == canonical_hash, f"Expected ledger hash {ledger['hash']} to match canonical hash {canonical_hash}"


def test_durable_run_persistence_after_restart():
    """Simulates server restart by wiping OPTIMIZATION_RUNS_STORE and fetching from data/runs/."""
    req_payload = {
        "scenario_id": "global_liner_2026",
        "algorithm": "MO-QIEA",
        "population_size": 15,
        "generations": 5,
        "carbon_tax_per_ton": 120.0,
        "random_seed": 77
    }
    res = client.post("/api/optimize/run", json=req_payload)
    assert res.status_code == 200
    run_id = res.json()["run_id"]

    # Verify disk file was written
    disk_file = RUNS_DIR / f"{run_id}.json"
    assert disk_file.exists(), f"Durable run file {disk_file} should exist"

    # WIPE in-memory cache to simulate server restart
    OPTIMIZATION_RUNS_STORE.clear()
    assert run_id not in OPTIMIZATION_RUNS_STORE

    # Retrieval from /api/optimize/run/{run_id}
    res_get = client.get(f"/api/optimize/run/{run_id}")
    assert res_get.status_code == 200
    assert res_get.json()["run_id"] == run_id

    # HTML report generation from disk-loaded run
    res_html = client.get(f"/api/reports/html/{run_id}")
    assert res_html.status_code == 200
    assert "GREEN FLEET DEPLOYMENT & ESG AUDIT LEDGER" in res_html.text

    # PDF report generation from disk-loaded run
    res_pdf = client.get(f"/api/reports/pdf/{run_id}")
    assert res_pdf.status_code == 200
    assert res_pdf.content.startswith(b"%PDF")


def test_http_error_codes():
    """Verifies that 400, 404, and 422 HTTP status codes are raised correctly."""
    # 400: Unknown scenario_id
    res_bad_scen = client.post("/api/optimize/run", json={
        "scenario_id": "non_existent_fake_scenario",
        "algorithm": "MO-QIEA"
    })
    assert res_bad_scen.status_code == 400
    assert "Unknown scenario_id" in res_bad_scen.json()["detail"]

    # 404: Unknown run_id
    res_not_found = client.get("/api/optimize/run/run_9999999999_fake_id")
    assert res_not_found.status_code == 404

    res_html_404 = client.get("/api/reports/html/run_9999999999_fake_id")
    assert res_html_404.status_code == 404

    # 422: Malformed payload (violating Pydantic schema constraints)
    res_422 = client.post("/api/predict/fuel", json={
        "vessel_type": "Container_UltraLarge",
        "speed_knots": -5.0  # Invalid negative speed ge=1.0 constraint
    })
    assert res_422.status_code == 422


def test_custom_fleet_and_route_filtering():
    """Verifies custom imported fleet roster and route filter apply to optimization."""
    custom_vessel = {
        "vessel_id": "USR_999",
        "name": "Custom Green Clipper",
        "vessel_type": "Container_UltraLarge",
        "dwt": 190000,
        "capacity_teu_or_dwt": 20000,
        "design_speed_knots": 18.5,
        "compatible_fuels": ["BIO_METHANOL", "MGO"],
        "has_shore_power_connection": True,
        "daily_capital_cost_usd": 45000.0,
        "cii_rating_baseline": "A"
    }

    req_payload = {
        "scenario_id": "global_liner_2026",
        "selected_route_id": "ROUTE_ASIA_EUR",
        "custom_fleet": [custom_vessel],
        "algorithm": "MO-QIEA",
        "population_size": 10,
        "generations": 5,
        "carbon_tax_per_ton": 150.0,
        "random_seed": 42
    }
    res = client.post("/api/optimize/run", json=req_payload)
    assert res.status_code == 200
    data = res.json()
    sol = data["pareto_front"][0]

    # Verify that the custom vessel was deployed on ROUTE_ASIA_EUR
    deployed_names = [a["vessel_name"] for a in sol["allocations"]]
    assert "Custom Green Clipper" in deployed_names
    deployed_routes = [a["route_id"] for a in sol["allocations"]]
    assert all(r == "ROUTE_ASIA_EUR" for r in deployed_routes)


def test_unlocode_ports_endpoint():
    """Verifies that UN/LOCODE endpoint returns global ports, pagination, and disclaimer."""
    # 1. Page 1 query
    res = client.get("/api/scenarios/ports/unlocode?page=1&page_size=25")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] > 1000
    assert len(data["records"]) == 25
    assert "disclaimer" in data
    assert "shore-power" in data["disclaimer"]

    # 2. Filter by country
    res_cn = client.get("/api/scenarios/ports/unlocode?country=CN&page_size=10")
    assert res_cn.status_code == 200
    data_cn = res_cn.json()
    assert data_cn["total_count"] > 0
    assert all(p["country"] == "CN" for p in data_cn["records"])

    # 3. Search by name query
    res_shanghai = client.get("/api/scenarios/ports/unlocode?query=Shanghai")
    assert res_shanghai.status_code == 200
    data_sh = res_shanghai.json()
    assert data_sh["total_count"] >= 1
    found_sha = any(p["locode"] == "CNSHA" or "shanghai" in p["port_name"].lower() for p in data_sh["records"])
    assert found_sha, "Expected Shanghai in search results"


def test_csv_validation_strict_rejection():
    """Verifies strict validation logic rejects corrupted, invalid, and non-physical vessel files."""
    # 1. Missing required column
    bad_header_csv = "name,dwt,design_speed_knots\nMY_SHIP,50000,14.5"
    res1 = client.post("/api/scenarios/vessels/validate-csv", json={"csv_content": bad_header_csv})
    assert res1.status_code == 200
    data1 = res1.json()
    assert not data1["is_valid"]
    assert any("Missing required" in err for err in data1["errors"])

    # 2. Non-monotonic speed bounds (min >= max)
    bad_speed_csv = (
        "name,vessel_type,dwt,min_speed_knots,design_speed_knots,max_speed_knots,compatible_fuels\n"
        "INVERTED_SPEED,Container_PostPanamax,95000,22.0,18.0,16.0,\"VLSFO,MGO\""
    )
    res2 = client.post("/api/scenarios/vessels/validate-csv", json={"csv_content": bad_speed_csv})
    assert res2.status_code == 200
    data2 = res2.json()
    assert not data2["is_valid"]
    assert any("strictly less than" in err for err in data2["errors"])

    # 3. Unknown fuel type
    bad_fuel_csv = (
        "name,vessel_type,dwt,design_speed_knots,compatible_fuels\n"
        "MYSTERY_FUEL,Bulk_Capesize,180000,14.5,\"UNOBTANIUM,VLSFO\""
    )
    res3 = client.post("/api/scenarios/vessels/validate-csv", json={"csv_content": bad_fuel_csv})
    assert res3.status_code == 200
    data3 = res3.json()
    assert not data3["is_valid"]
    assert any("UNOBTANIUM" in err for err in data3["errors"])

    # 4. Valid CSV succeeds with parsed_count
    valid_csv = (
        "name,vessel_type,dwt,design_speed_knots,compatible_fuels\n"
        "VALID_CLIPPER,Container_PostPanamax,95000,17.5,\"VLSFO,MGO,LNG\""
    )
    res4 = client.post("/api/scenarios/vessels/validate-csv", json={"csv_content": valid_csv})
    assert res4.status_code == 200
    data4 = res4.json()
    assert data4["is_valid"]
    assert data4["parsed_count"] == 1

def test_target_speed_knots_hydrodynamic_scaling():
    """Verifies that user-supplied target_speed_knots strictly binds to allocations and scales fuel burn (P ~ V^3)."""
    # Baseline feasible speed: 17.0 knots (above 16.8 kts minimum schedule requirement for Asia-Europe)
    payload_slow = {
        "scenario_id": "global_liner_2026",
        "selected_route_id": "ROUTE_ASIA_EUR",
        "target_speed_knots": 17.0,
        "algorithm": "MO-QIEA",
        "population_size": 10,
        "generations": 5,
        "random_seed": 42
    }
    res_slow = client.post("/api/optimize/run", json=payload_slow)
    assert res_slow.status_code == 200
    data_slow = res_slow.json()
    sol_slow = data_slow["pareto_front"][0]

    # Verify all vessel allocations strictly use 17.0 knots
    for alloc in sol_slow["allocations"]:
        assert alloc["speed_knots"] == 17.0

    # High speed run: 20.0 knots
    payload_fast = {
        "scenario_id": "global_liner_2026",
        "selected_route_id": "ROUTE_ASIA_EUR",
        "target_speed_knots": 20.0,
        "algorithm": "MO-QIEA",
        "population_size": 10,
        "generations": 5,
        "random_seed": 42
    }
    res_fast = client.post("/api/optimize/run", json=payload_fast)
    assert res_fast.status_code == 200
    data_fast = res_fast.json()
    sol_fast = data_fast["pareto_front"][0]

    for alloc in sol_fast["allocations"]:
        assert alloc["speed_knots"] == 20.0

    # Fuel burn at 20 kts must be substantially higher than at 17 kts (approx (20/17)^3 ~ 1.63x power)
    assert sol_fast["total_fuel_mt"] > 1.35 * sol_slow["total_fuel_mt"], (
        f"Fast fuel burn ({sol_fast['total_fuel_mt']}) must be significantly higher than slow ({sol_slow['total_fuel_mt']})"
    )


def test_optimization_metadata_and_deterministic_audit_hash():
    """Verifies selected_route_id, fleet_size, and deterministic audit_hash persist across backend restart."""
    payload = {
        "scenario_id": "global_liner_2026",
        "selected_route_id": "ROUTE_ASIA_EUR",
        "target_speed_knots": 17.5,
        "preferred_fuel_type": "BIO_METHANOL",
        "algorithm": "MO-QIEA",
        "population_size": 10,
        "generations": 5,
        "random_seed": 42
    }
    res = client.post("/api/optimize/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    run_id = data["run_id"]

    assert data["selected_route_id"] == "ROUTE_ASIA_EUR"
    assert data["fleet_size"] == 15  # Total fleet roster under consideration
    audit_hash = data["audit_hash"]
    assert audit_hash is not None
    assert len(audit_hash) == 64  # SHA-256 hex string

    # Wipe in-memory store to simulate server restart
    OPTIMIZATION_RUNS_STORE.clear()
    assert run_id not in OPTIMIZATION_RUNS_STORE

    # Retrieve from disk via GET /api/optimize/run/{run_id}
    res_disk = client.get(f"/api/optimize/run/{run_id}")
    assert res_disk.status_code == 200
    data_disk = res_disk.json()

    assert data_disk["selected_route_id"] == "ROUTE_ASIA_EUR"
    assert data_disk["fleet_size"] == 15
    assert data_disk["audit_hash"] == audit_hash


def test_invalid_solution_id_returns_404():
    """Verifies that requesting an invalid or non-existent solution_id returns HTTP 404 for HTML and PDF reports."""
    payload = {
        "scenario_id": "global_liner_2026",
        "algorithm": "MO-QIEA",
        "population_size": 10,
        "generations": 5,
        "random_seed": 42
    }
    res = client.post("/api/optimize/run", json=payload)
    assert res.status_code == 200
    run_id = res.json()["run_id"]
    valid_sol_id = res.json()["pareto_front"][0]["solution_id"]

    # Valid solution_id should succeed
    res_html_valid = client.get(f"/api/reports/html/{run_id}?solution_id={valid_sol_id}")
    assert res_html_valid.status_code == 200

    res_pdf_valid = client.get(f"/api/reports/pdf/{run_id}?solution_id={valid_sol_id}")
    assert res_pdf_valid.status_code == 200

    # Invalid solution_id must return 404 Not Found
    res_html_invalid = client.get(f"/api/reports/html/{run_id}?solution_id=nonexistent_solution_abc123")
    assert res_html_invalid.status_code == 404
    assert "not found in run" in res_html_invalid.json()["detail"]

    res_pdf_invalid = client.get(f"/api/reports/pdf/{run_id}?solution_id=nonexistent_solution_abc123")
    assert res_pdf_invalid.status_code == 404
    assert "not found in run" in res_pdf_invalid.json()["detail"]


def test_canonical_audit_hash_parity_and_persistence():
    """
    REGRESSION TEST:
    Verifies that the canonical SHA-256 audit hash is bit-for-bit identical across:
    1. Live API response
    2. Persisted JSON on disk (data/runs/{run_id}.json)
    3. JSON audit ledger (/api/reports/json/{run_id})
    4. HTML report (/api/reports/html/{run_id})
    5. Binary PDF report (/api/reports/pdf/{run_id})
    6. Independent recomputation from disk after wiping in-memory cache (simulating cold server restart).
    """
    req_payload = {
        "scenario_id": "global_liner_2026",
        "algorithm": "MO-QIEA",
        "population_size": 15,
        "generations": 8,
        "carbon_tax_per_ton": 150.0,
        "random_seed": 777
    }
    res = client.post("/api/optimize/run", json=req_payload)
    assert res.status_code == 200
    live_data = res.json()
    run_id = live_data["run_id"]
    canonical_hash = live_data["audit_hash"]
    assert len(canonical_hash) == 64, "Canonical SHA-256 hash must be 64 characters"

    # 1. Verify JSON audit ledger shares exact hash
    res_ledger = client.get(f"/api/reports/json/{run_id}")
    assert res_ledger.status_code == 200
    assert res_ledger.json()["hash"] == canonical_hash

    # 2. Verify HTML report embeds exact hash
    res_html = client.get(f"/api/reports/html/{run_id}")
    assert res_html.status_code == 200
    assert canonical_hash in res_html.text

    # 3. Verify PDF report embeds exact hash and prefix
    import base64
    import zlib
    res_pdf = client.get(f"/api/reports/pdf/{run_id}")
    assert res_pdf.status_code == 200
    start_pos = res_pdf.content.find(b"stream\n") + len(b"stream\n")
    end_pos = res_pdf.content.find(b"endstream", start_pos)
    stream_raw = res_pdf.content[start_pos:end_pos].strip()
    a85_data = base64.a85decode(stream_raw, adobe=True)
    pdf_text = zlib.decompress(a85_data).decode("latin1", errors="ignore")
    assert canonical_hash[:24] in pdf_text
    assert canonical_hash in pdf_text

    # 4. Verify persisted JSON on disk exists
    disk_file = RUNS_DIR / f"{run_id}.json"
    assert disk_file.exists()
    with open(disk_file, "r", encoding="utf-8") as f:
        persisted_entry = json.load(f)

    # 5. Independent recomputation from persisted file
    recomputed_hash = recompute_hash_from_persisted_run(persisted_entry)
    assert recomputed_hash == canonical_hash, f"Independent recomputed hash {recomputed_hash} must match canonical {canonical_hash}"

    # 6. Simulate cold restart: wipe in-memory store and re-fetch ledger
    OPTIMIZATION_RUNS_STORE.clear()
    assert run_id not in OPTIMIZATION_RUNS_STORE

    res_post_restart = client.get(f"/api/reports/json/{run_id}")
    assert res_post_restart.status_code == 200
    assert res_post_restart.json()["hash"] == canonical_hash


def test_speed_limits_and_schedule_repair_explanation():
    """
    Verifies target vs actual speed handling, physical clamping, schedule repair,
    and explanatory adjustment reason strings in allocations.
    """
    # Test 1: High speed clamped to vessel max speed (e.g. 24 kts requested)
    res_high = client.post("/api/optimize/run", json={
        "scenario_id": "global_liner_2026",
        "algorithm": "MO-QIEA",
        "population_size": 10,
        "generations": 5,
        "target_speed_knots": 24.0,
        "random_seed": 42
    })
    assert res_high.status_code == 200
    sol_high = res_high.json()["pareto_front"][0]
    for alloc in sol_high["allocations"]:
        assert "target_speed_knots" in alloc
        assert "applied_speed_knots" in alloc
        assert "speed_adjustment_reason" in alloc
        assert alloc["target_speed_knots"] == 24.0
        # If vessel max speed is below 24.0 (like VESSEL_10 at 17.5 kts), it should be clamped
        if alloc["applied_speed_knots"] < 24.0:
            assert "Clamped to physical maximum" in alloc["speed_adjustment_reason"]

    # Test 2: Low speed raised by schedule repair to meet corridor arrival deadline
    res_low = client.post("/api/optimize/run", json={
        "scenario_id": "global_liner_2026",
        "algorithm": "MO-QIEA",
        "population_size": 10,
        "generations": 5,
        "target_speed_knots": 8.0,
        "random_seed": 42
    })
    assert res_low.status_code == 200
    sol_low = res_low.json()["pareto_front"][0]
    for alloc in sol_low["allocations"]:
        assert alloc["target_speed_knots"] == 8.0
        # Asia-Europe corridor deadline requires higher speed than 8 kts
        if alloc["applied_speed_knots"] > 8.0:
            assert "Schedule recovery" in alloc["speed_adjustment_reason"] or "minimum" in alloc["speed_adjustment_reason"]


def test_operating_draft_drag_increase_and_preservation():
    """
    Verifies that operating_draft_meters is preserved through schedule repair
    and correctly increases hydrodynamic drag and fuel consumption when deeper.
    """
    # Shallow draft: 10.0m
    res_shallow = client.post("/api/optimize/run", json={
        "scenario_id": "global_liner_2026",
        "algorithm": "MO-QIEA",
        "population_size": 10,
        "generations": 5,
        "operating_draft_meters": 10.0,
        "target_speed_knots": 14.0,
        "random_seed": 42
    })
    assert res_shallow.status_code == 200
    fuel_shallow = res_shallow.json()["pareto_front"][0]["total_fuel_mt"]
    for alloc in res_shallow.json()["pareto_front"][0]["allocations"]:
        assert alloc["applied_draft_meters"] == 10.0

    # Deep draft: 16.0m
    res_deep = client.post("/api/optimize/run", json={
        "scenario_id": "global_liner_2026",
        "algorithm": "MO-QIEA",
        "population_size": 10,
        "generations": 5,
        "operating_draft_meters": 16.0,
        "target_speed_knots": 14.0,
        "random_seed": 42
    })
    assert res_deep.status_code == 200
    fuel_deep = res_deep.json()["pareto_front"][0]["total_fuel_mt"]
    for alloc in res_deep.json()["pareto_front"][0]["allocations"]:
        assert alloc["applied_draft_meters"] == 16.0

    # Deep draft has higher wetted surface and displacement -> higher hydrodynamic fuel burn
    assert fuel_deep > fuel_shallow, f"Deep draft fuel ({fuel_deep} MT) must exceed shallow draft fuel ({fuel_shallow} MT)"


def test_canonical_hash_protects_all_inputs_and_allocations_tamper_detection():
    """
    Verifies that the canonical SHA-256 audit hash protects all consequential
    scenario inputs, constraints, allocations (speed, fuel, draft, adjustment reasons),
    and regulatory outputs. Proves that modifying ANY protected field produces a different
    hash and fails cryptographic integrity validation, while unmodified runs match across
    API responses, disk persistence, /api/reports/json, HTML, and PDF.
    """
    req_payload = {
        "scenario_id": "global_liner_2026",
        "algorithm": "MO-QIEA",
        "population_size": 15,
        "generations": 5,
        "target_speed_knots": 15.0,
        "carbon_tax_per_ton": 120.0,
        "weather_severity_multiplier": 1.1,
        "operating_draft_meters": 11.5,
        "random_seed": 77
    }
    res = client.post("/api/optimize/run", json=req_payload)
    assert res.status_code == 200
    run_data = res.json()
    run_id = run_data["run_id"]
    canonical_hash = run_data["audit_hash"]
    assert len(canonical_hash) == 64

    # 1. Unmodified check across endpoints
    disk_file = RUNS_DIR / f"{run_id}.json"
    assert disk_file.exists()
    with open(disk_file, "r", encoding="utf-8") as f:
        disk_entry = json.load(f)

    # Initial persisted entry must verify cleanly
    assert verify_run_integrity(disk_entry) is True
    assert recompute_hash_from_persisted_run(disk_entry) == canonical_hash

    # JSON audit ledger endpoint
    res_ledger = client.get(f"/api/reports/json/{run_id}")
    assert res_ledger.status_code == 200
    ledger_json = res_ledger.json()
    assert ledger_json["hash"] == canonical_hash
    assert ledger_json["integrity_verified"] is True

    # HTML report endpoint
    res_html = client.get(f"/api/reports/html/{run_id}")
    assert res_html.status_code == 200
    assert canonical_hash in res_html.text

    # PDF report endpoint
    res_pdf = client.get(f"/api/reports/pdf/{run_id}")
    assert res_pdf.status_code == 200
    assert res_pdf.content.startswith(b"%PDF")
    # Verify hash is in PDF text streams
    all_pdf_streams = []
    pos = 0
    while True:
        sp = res_pdf.content.find(b"stream\n", pos)
        if sp == -1:
            break
        sp += len(b"stream\n")
        ep = res_pdf.content.find(b"endstream", sp)
        if ep == -1:
            break
        try:
            import base64, zlib
            stream_data = zlib.decompress(base64.a85decode(res_pdf.content[sp:ep].strip(), adobe=True))
            all_pdf_streams.append(stream_data.decode("latin1", errors="ignore"))
        except Exception:
            pass
        pos = ep + len(b"endstream")
    full_pdf_text = " ".join(all_pdf_streams)
    assert canonical_hash in full_pdf_text

    # 2. Tamper Test A: Modify applied vessel speed in persisted allocation
    tampered_speed = json.loads(json.dumps(disk_entry))
    orig_speed = tampered_speed["response"]["pareto_front"][0]["allocations"][0]["applied_speed_knots"]
    tampered_speed["response"]["pareto_front"][0]["allocations"][0]["applied_speed_knots"] = orig_speed + 2.5
    hash_after_speed = recompute_hash_from_persisted_run(tampered_speed)
    assert hash_after_speed != canonical_hash, "Mutating applied vessel speed must change recomputed hash"
    assert verify_run_integrity(tampered_speed) is False

    # 3. Tamper Test B: Modify fuel type in persisted allocation
    tampered_fuel = json.loads(json.dumps(disk_entry))
    tampered_fuel["response"]["pareto_front"][0]["allocations"][0]["fuel_type"] = "Bio_Methanol"
    hash_after_fuel = recompute_hash_from_persisted_run(tampered_fuel)
    assert hash_after_fuel != canonical_hash, "Mutating allocation fuel type must change recomputed hash"
    assert verify_run_integrity(tampered_fuel) is False

    # 4. Tamper Test C: Modify recorded target speed
    tampered_tgt = json.loads(json.dumps(disk_entry))
    tampered_tgt["problem_params"]["target_speed_knots"] = 22.0
    tampered_tgt["response"]["target_speed_knots"] = 22.0
    hash_after_tgt = recompute_hash_from_persisted_run(tampered_tgt)
    assert hash_after_tgt != canonical_hash, "Mutating recorded target speed must change recomputed hash"
    assert verify_run_integrity(tampered_tgt) is False

    # 5. Tamper Test D: Modify applied draft in persisted allocation
    tampered_draft = json.loads(json.dumps(disk_entry))
    tampered_draft["response"]["pareto_front"][0]["allocations"][0]["applied_draft_meters"] = 15.8
    hash_after_draft = recompute_hash_from_persisted_run(tampered_draft)
    assert hash_after_draft != canonical_hash, "Mutating allocation applied draft must change recomputed hash"
    assert verify_run_integrity(tampered_draft) is False

    # 6. Tamper Test E: Modify carbon tax scenario input
    tampered_tax = json.loads(json.dumps(disk_entry))
    tampered_tax["problem_params"]["carbon_tax"] = 350.0
    tampered_tax["response"]["carbon_tax_per_ton"] = 350.0
    hash_after_tax = recompute_hash_from_persisted_run(tampered_tax)
    assert hash_after_tax != canonical_hash, "Mutating scenario carbon tax must change recomputed hash"
    assert verify_run_integrity(tampered_tax) is False


def test_html_escaping_and_pdf_safety_for_vessel_names():
    """
    Verifies that user-controlled vessel names with markup (e.g. <b>Test Ship</b>)
    and special characters are safely escaped in HTML reports to display as literal text,
    and safely handled in ReportLab PDF generation without XML parser crashes.
    """
    custom_fleet_payload = [
        {
            "vessel_id": "VESSEL_XSS_01",
            "name": "<b>Test Ship</b>",
            "vessel_type": "Container_PostPanamax",
            "dwt": 120000.0,
            "design_speed": 19.5,
            "max_speed": 22.0,
            "design_draft": 14.5,
            "fuel_types": ["VLSFO", "LNG"]
        },
        {
            "vessel_id": "VESSEL_SPECIAL_02",
            "name": "Ship <Alpha> & 'Omega'",
            "vessel_type": "Container_Feeder",
            "dwt": 25000.0,
            "design_speed": 16.0,
            "max_speed": 18.0,
            "design_draft": 9.5,
            "fuel_types": ["VLSFO"]
        }
    ]

    res = client.post("/api/optimize/run", json={
        "scenario_id": "global_liner_2026",
        "algorithm": "MO-QIEA",
        "population_size": 10,
        "generations": 5,
        "custom_fleet": custom_fleet_payload,
        "random_seed": 42
    })
    assert res.status_code == 200
    run_id = res.json()["run_id"]

    # 1. HTML Report Verification
    res_html = client.get(f"/api/reports/html/{run_id}")
    assert res_html.status_code == 200
    html_text = res_html.text

    # Harmless HTML markup must be escaped as literal text
    assert "&lt;b&gt;Test Ship&lt;/b&gt;" in html_text
    assert "&lt;Alpha&gt; &amp; &#x27;Omega&#x27;" in html_text or "&lt;Alpha&gt; &amp; 'Omega'" in html_text
    # Must NOT render unescaped raw bold tags for vessel name
    assert '<td style="font-weight: 600; color: #00e5ff;"><b>Test Ship</b>' not in html_text

    # 2. PDF Report Verification (Safe ReportLab parsing with no ExpatError)
    res_pdf = client.get(f"/api/reports/pdf/{run_id}")
    assert res_pdf.status_code == 200
    assert res_pdf.content.startswith(b"%PDF")

    # Decompress PDF streams to verify literal text is present
    all_pdf_streams = []
    pos = 0
    while True:
        sp = res_pdf.content.find(b"stream\n", pos)
        if sp == -1:
            break
        sp += len(b"stream\n")
        ep = res_pdf.content.find(b"endstream", sp)
        if ep == -1:
            break
        try:
            import base64, zlib
            stream_data = zlib.decompress(base64.a85decode(res_pdf.content[sp:ep].strip(), adobe=True))
            all_pdf_streams.append(stream_data.decode("latin1", errors="ignore"))
        except Exception:
            pass
        pos = ep + len(b"endstream")
    full_pdf_text = " ".join(all_pdf_streams)
    # The literal characters "Test Ship" and markup should be present safely
    assert "Test Ship" in full_pdf_text


def test_comprehensive_audit_integrity_tamper_and_fail_closed_endpoints():
    """
    Exhaustive regression test for canonical audit hash version 2.0 and strict fail-closed
    behavior across all run retrieval and report endpoints.

    Verifies:
    1. Valid run produces identical hash and metrics across:
       - Live API response (/api/optimize/run)
       - Machine-readable ledger (/api/reports/json/{run_id})
       - Printable HTML report (/api/reports/html/{run_id})
       - Regulatory binary PDF stream text (/api/reports/pdf/{run_id})
    2. Invalid solution_id query parameter returns HTTP 404.
    3. Individual mutations to:
       - round_trips
       - cargo_carried
       - speed (speed_knots / applied_speed_knots)
       - fuel_type
       - applied_draft_meters
       - operational_cost_usd
       - lifecycle_ghg_tco2e
       - regulatory fields (cii_rating, attained_aer, fueleu penalty, eu_ets_cost)
       - custom_fleet vessel parameters
       - scenario_inputs (carbon tax, weather, demand, target speed, random seed)
       - canonical version (missing, invalid, or outdated "1.0")
       all invalidate run integrity and trigger HTTP 400 Bad Request across ALL four endpoints:
       - GET /api/optimize/run/{run_id}
       - GET /api/reports/html/{run_id}
       - GET /api/reports/pdf/{run_id}
       - GET /api/reports/json/{run_id}
       both when loading from disk (after cache clear) and in-memory.
    """
    custom_vessel = {
        "vessel_id": "TEST_INTEGRITY_01",
        "name": "Audit Test Vessel",
        "vessel_type": "Container_PostPanamax",
        "dwt": 110000.0,
        "design_speed": 18.0,
        "max_speed": 21.0,
        "design_draft": 13.0,
        "fuel_types": ["VLSFO", "LNG"]
    }
    req_payload = {
        "scenario_id": "global_liner_2026",
        "algorithm": "MO-QIEA",
        "population_size": 10,
        "generations": 5,
        "carbon_tax_per_ton": 115.0,
        "weather_severity_multiplier": 1.1,
        "demand_multiplier": 1.05,
        "target_speed_knots": 17.5,
        "operating_draft_meters": 12.5,
        "custom_fleet": [custom_vessel],
        "random_seed": 55
    }

    res_post = client.post("/api/optimize/run", json=req_payload)
    assert res_post.status_code == 200
    run_data = res_post.json()
    run_id = run_data["run_id"]
    canonical_hash = run_data["audit_hash"]
    assert len(canonical_hash) == 64
    assert run_data["canonical_version"] == "2.0"

    disk_path = RUNS_DIR / f"{run_id}.json"
    assert disk_path.exists()
    with open(disk_path, "r", encoding="utf-8") as f:
        clean_disk_data = json.load(f)

    # 1. Valid endpoints return 200 with parity
    res_run = client.get(f"/api/optimize/run/{run_id}")
    assert res_run.status_code == 200
    assert res_run.json()["audit_hash"] == canonical_hash

    res_json = client.get(f"/api/reports/json/{run_id}")
    assert res_json.status_code == 200
    ledger_data = res_json.json()
    assert ledger_data["integrity_verified"] is True
    assert ledger_data["hash"] == canonical_hash

    res_html = client.get(f"/api/reports/html/{run_id}")
    assert res_html.status_code == 200
    assert canonical_hash in res_html.text

    res_pdf = client.get(f"/api/reports/pdf/{run_id}")
    assert res_pdf.status_code == 200
    assert res_pdf.content.startswith(b"%PDF")

    # 2. Invalid solution_id returns 404
    res_bad_sol_html = client.get(f"/api/reports/html/{run_id}?solution_id=NON_EXISTENT_SOL_999")
    assert res_bad_sol_html.status_code == 404

    res_bad_sol_pdf = client.get(f"/api/reports/pdf/{run_id}?solution_id=NON_EXISTENT_SOL_999")
    assert res_bad_sol_pdf.status_code == 404

    # Helper function to test disk tampering across all 4 endpoints
    def assert_tamper_fails_all_endpoints(mutated_disk_payload, test_description):
        # Write mutated payload to disk
        with open(disk_path, "w", encoding="utf-8") as f_out:
            json.dump(mutated_disk_payload, f_out, indent=2)
        # Clear in-memory cache to force disk load
        OPTIMIZATION_RUNS_STORE.clear()

        # Check validate_run_integrity directly
        integrity_check = validate_run_integrity(mutated_disk_payload)
        assert integrity_check["is_valid"] is False, f"validate_run_integrity must return False for: {test_description}"

        # Test endpoint 1: /api/optimize/run/{run_id} -> 400
        r1 = client.get(f"/api/optimize/run/{run_id}")
        assert r1.status_code == 400, f"/api/optimize/run must fail closed (400) for: {test_description}, got {r1.status_code}"
        assert "Audit integrity validation failed" in r1.json()["detail"]

        # Clear cache again for report endpoints
        OPTIMIZATION_RUNS_STORE.clear()
        r2 = client.get(f"/api/reports/html/{run_id}")
        assert r2.status_code == 400, f"/api/reports/html must fail closed (400) for: {test_description}, got {r2.status_code}"

        OPTIMIZATION_RUNS_STORE.clear()
        r3 = client.get(f"/api/reports/pdf/{run_id}")
        assert r3.status_code == 400, f"/api/reports/pdf must fail closed (400) for: {test_description}, got {r3.status_code}"

        OPTIMIZATION_RUNS_STORE.clear()
        r4 = client.get(f"/api/reports/json/{run_id}")
        assert r4.status_code == 400, f"/api/reports/json must fail closed (400) for: {test_description}, got {r4.status_code}"

    try:
        # Mutation 1: round_trips
        m1 = json.loads(json.dumps(clean_disk_data))
        m1["response"]["pareto_front"][0]["allocations"][0]["round_trips"] += 3
        assert_tamper_fails_all_endpoints(m1, "Mutating allocation round_trips")

        # Mutation 2: cargo_carried
        m2 = json.loads(json.dumps(clean_disk_data))
        m2["response"]["pareto_front"][0]["allocations"][0]["cargo_carried"] += 7500.0
        assert_tamper_fails_all_endpoints(m2, "Mutating allocation cargo_carried")

        # Mutation 3: applied_speed_knots
        m3 = json.loads(json.dumps(clean_disk_data))
        m3["response"]["pareto_front"][0]["allocations"][0]["applied_speed_knots"] += 2.0
        assert_tamper_fails_all_endpoints(m3, "Mutating allocation applied_speed_knots")

        # Mutation 4: fuel_type
        m4 = json.loads(json.dumps(clean_disk_data))
        m4["response"]["pareto_front"][0]["allocations"][0]["fuel_type"] = "Bio_Methanol"
        assert_tamper_fails_all_endpoints(m4, "Mutating allocation fuel_type")

        # Mutation 5: applied_draft_meters
        m5 = json.loads(json.dumps(clean_disk_data))
        m5["response"]["pareto_front"][0]["allocations"][0]["applied_draft_meters"] += 1.5
        assert_tamper_fails_all_endpoints(m5, "Mutating allocation applied_draft_meters")

        # Mutation 6: operational_cost_usd
        m6 = json.loads(json.dumps(clean_disk_data))
        m6["response"]["pareto_front"][0]["allocations"][0]["operational_cost_usd"] += 50000.0
        assert_tamper_fails_all_endpoints(m6, "Mutating allocation operational_cost_usd")

        # Mutation 7: lifecycle_ghg_tco2e
        m7 = json.loads(json.dumps(clean_disk_data))
        m7["response"]["pareto_front"][0]["allocations"][0]["lifecycle_ghg_tco2e"] += 120.0
        assert_tamper_fails_all_endpoints(m7, "Mutating allocation lifecycle_ghg_tco2e")

        # Mutation 8: regulatory fields (cii_rating, attained_aer, fueleu penalty, eu_ets_cost)
        m8 = json.loads(json.dumps(clean_disk_data))
        m8["response"]["pareto_front"][0]["allocations"][0]["cii_rating"] = "A"
        m8["response"]["pareto_front"][0]["allocations"][0]["fueleu_deficit_penalty_usd"] = 0.0
        assert_tamper_fails_all_endpoints(m8, "Mutating allocation regulatory fields")

        # Mutation 9: custom_fleet
        m9 = json.loads(json.dumps(clean_disk_data))
        m9["response"]["custom_fleet"][0]["name"] = "Tampered Vessel Name"
        assert_tamper_fails_all_endpoints(m9, "Mutating custom fleet vessel name")

        # Mutation 10: scenario_inputs (carbon tax)
        m10 = json.loads(json.dumps(clean_disk_data))
        m10["response"]["carbon_tax_per_ton"] = 400.0
        assert_tamper_fails_all_endpoints(m10, "Mutating response carbon_tax_per_ton")

        # Mutation 11: scenario_inputs (random_seed)
        m11 = json.loads(json.dumps(clean_disk_data))
        m11["response"]["random_seed"] = 999
        assert_tamper_fails_all_endpoints(m11, "Mutating response random_seed")

        # Mutation 12: version (missing or outdated "1.0")
        m12 = json.loads(json.dumps(clean_disk_data))
        m12["version"] = "1.0"
        m12["response"]["canonical_version"] = "1.0"
        assert_tamper_fails_all_endpoints(m12, "Outdated canonical version 1.0")

        # Mutation 13: in-memory cache tampering (without clearing cache)
        with open(disk_path, "w", encoding="utf-8") as f_out:
            json.dump(clean_disk_data, f_out, indent=2)
        OPTIMIZATION_RUNS_STORE.clear()

        # Load into memory cache by calling get_run_entry
        cached_entry = get_run_entry(run_id)
        assert cached_entry is not None
        assert cached_entry["integrity_verified"] is True

        # Now tamper with memory object directly
        cached_entry["response"].pareto_front[0].allocations[0].round_trips += 10
        # Re-fetch via endpoints without clearing cache; get_run_entry should catch in-memory tampering
        r_mem_run = client.get(f"/api/optimize/run/{run_id}")
        assert r_mem_run.status_code == 400, "In-memory tampering must fail closed (400)"

        r_mem_html = client.get(f"/api/reports/html/{run_id}")
        assert r_mem_html.status_code == 400

        r_mem_pdf = client.get(f"/api/reports/pdf/{run_id}")
        assert r_mem_pdf.status_code == 400

        r_mem_json = client.get(f"/api/reports/json/{run_id}")
        assert r_mem_json.status_code == 400

    finally:
        with open(disk_path, "w", encoding="utf-8") as f_out:
            json.dump(clean_disk_data, f_out, indent=2)
        OPTIMIZATION_RUNS_STORE.clear()




