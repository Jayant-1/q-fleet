"""
Canonical cryptographic audit hashing module for SIH26138 Green Fleet Maritime Optimization.

Establishes a single, versioned canonical payload and SHA-256 hashing procedure
shared identically across:
1. Live /api/optimize/run API responses
2. Persisted runs in data/runs/{run_id}.json
3. The machine-readable JSON ledger at /api/reports/json/{run_id}
4. Printable HTML compliance reports at /api/reports/html/{run_id}
5. Regulatory-grade PDF audit reports at /api/reports/pdf/{run_id}

NOTE ON REGULATORY STATUS:
This SHA-256 hash documents mathematical input/output simulation determinism under
the specified random seed and configuration; it does NOT constitute statutory
third-party verifier certification.
"""

import hashlib
import json
from typing import Any, Dict, List, Optional, Union

CANONICAL_HASH_VERSION: str = "2.0"
HASH_DISCLAIMER: str = (
    "Mathematical input/output simulation determinism hash (SHA-256, version 2.0). "
    "Documents reproducible computational state under specified inputs, constraints, allocations, and random seed; "
    "does NOT constitute statutory third-party verifier certification."
)


def build_canonical_run_payload(
    run_id: str,
    scenario_id: str,
    selected_route_id: Optional[str],
    algorithm: str,
    fleet_size: int,
    total_evaluations: int,
    pareto_solutions_count: int,
    compromise_solution_id: str,
    pareto_front: List[Any],
    random_seed: Optional[int] = 42,
    carbon_tax_per_ton: Optional[float] = 100.0,
    weather_severity_multiplier: Optional[float] = 1.0,
    fuel_price_multipliers: Optional[Dict[str, float]] = None,
    demand_multiplier: Optional[float] = 1.0,
    target_speed_knots: Optional[float] = None,
    preferred_fuel_type: Optional[str] = None,
    operating_draft_meters: Optional[float] = None,
    custom_fleet: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Constructs a deterministic, versioned canonical dictionary representing
    the core optimization inputs, constraints, fleet allocations, convergence bounds,
    and Pareto frontier solutions.
    """
    norm_fuel_mults: Dict[str, float] = {}
    if fuel_price_multipliers:
        for k, v in sorted(fuel_price_multipliers.items()):
            try:
                norm_fuel_mults[str(k)] = round(float(v), 4)
            except (TypeError, ValueError):
                continue

    norm_custom_fleet: Optional[List[Dict[str, Any]]] = None
    if custom_fleet:
        norm_custom_fleet = []
        for v in custom_fleet:
            if isinstance(v, dict):
                norm_custom_fleet.append({
                    "name": str(v.get("name", v.get("vessel_name", ""))),
                    "vessel_type": str(v.get("vessel_type", "")),
                    "dwt": round(float(v.get("dwt", 0.0)), 2),
                    "design_speed": round(float(v.get("design_speed", 0.0)), 2),
                    "max_speed": round(float(v.get("max_speed", 0.0)), 2),
                    "design_draft": round(float(v.get("design_draft", 0.0)), 2)
                })
        norm_custom_fleet.sort(key=lambda x: (x["name"], x["dwt"]))

    scenario_inputs: Dict[str, Any] = {
        "scenario_id": str(scenario_id),
        "selected_route_id": str(selected_route_id) if selected_route_id is not None else None,
        "carbon_tax_per_ton": round(float(carbon_tax_per_ton), 4) if carbon_tax_per_ton is not None else 100.0,
        "weather_severity_multiplier": round(float(weather_severity_multiplier), 4) if weather_severity_multiplier is not None else 1.0,
        "fuel_price_multipliers": norm_fuel_mults,
        "demand_multiplier": round(float(demand_multiplier), 4) if demand_multiplier is not None else 1.0,
        "target_speed_knots": round(float(target_speed_knots), 4) if target_speed_knots is not None else None,
        "preferred_fuel_type": str(preferred_fuel_type) if preferred_fuel_type is not None else None,
        "operating_draft_meters": round(float(operating_draft_meters), 4) if operating_draft_meters is not None else None,
        "custom_fleet": norm_custom_fleet,
        "random_seed": int(random_seed) if random_seed is not None else 42,
    }

    solutions_list: List[Dict[str, Any]] = []
    for s in pareto_front:
        if hasattr(s, "model_dump"):
            s_dict = s.model_dump()
        elif hasattr(s, "__dict__"):
            s_dict = s.__dict__
        elif isinstance(s, dict):
            s_dict = s
        else:
            s_dict = {}

        raw_allocs = s_dict.get("allocations", [])
        norm_allocs: List[Dict[str, Any]] = []
        for a in raw_allocs:
            if hasattr(a, "model_dump"):
                a_dict = a.model_dump()
            elif hasattr(a, "__dict__"):
                a_dict = a.__dict__
            elif isinstance(a, dict):
                a_dict = a
            else:
                a_dict = {}

            ft = a_dict.get("fuel_type", "")
            ft_str = ft.value if hasattr(ft, "value") else str(ft)

            norm_allocs.append({
                "vessel_id": str(a_dict.get("vessel_id", "")),
                "vessel_name": str(a_dict.get("vessel_name", "")),
                "vessel_type": str(a_dict.get("vessel_type", "")),
                "route_id": str(a_dict.get("route_id", "")),
                "route_name": str(a_dict.get("route_name", "")),
                "speed_knots": round(float(a_dict.get("speed_knots", 0.0)), 4),
                "target_speed_knots": round(float(a_dict["target_speed_knots"]), 4) if a_dict.get("target_speed_knots") is not None else None,
                "applied_speed_knots": round(float(a_dict.get("applied_speed_knots", a_dict.get("speed_knots", 0.0))), 4),
                "speed_adjustment_reason": str(a_dict.get("speed_adjustment_reason", "")),
                "fuel_type": ft_str,
                "fuel_adjustment_reason": str(a_dict.get("fuel_adjustment_reason", "")),
                "round_trips": int(round(float(a_dict.get("round_trips", 1)))),
                "cargo_carried": round(float(a_dict.get("cargo_carried", 0.0)), 2),
                "applied_draft_meters": round(float(a_dict.get("applied_draft_meters", 0.0)), 4),
                "fuel_consumed_sea_mt": round(float(a_dict.get("fuel_consumed_sea_mt", 0.0)), 4),
                "fuel_consumed_berth_mt": round(float(a_dict.get("fuel_consumed_berth_mt", 0.0)), 4),
                "total_fuel_mt": round(float(a_dict.get("total_fuel_mt", 0.0)), 4),
                "operational_cost_usd": round(float(a_dict.get("operational_cost_usd", 0.0)), 2),
                "lifecycle_ghg_tco2e": round(float(a_dict.get("lifecycle_ghg_tco2e", 0.0)), 4),
                "transit_time_days": round(float(a_dict.get("transit_time_days", 0.0)), 4),
                "is_feasible": bool(a_dict.get("is_feasible", True)),
                "cii_rating": str(a_dict.get("cii_rating", "C")),
                "attained_aer": round(float(a_dict.get("attained_aer", 0.0)), 4),
                "fueleu_deficit_penalty_usd": round(float(a_dict.get("fueleu_deficit_penalty_usd", 0.0)), 2),
                "eu_ets_cost_usd": round(float(a_dict.get("eu_ets_cost_usd", 0.0)), 2),
                "shore_power_used": bool(a_dict.get("shore_power_used", False)),
                "is_eca_compliant": bool(a_dict.get("is_eca_compliant", True)),
            })

        norm_allocs.sort(key=lambda x: (x["vessel_id"], x["route_id"]))

        raw_grades = s_dict.get("cii_grade_counts", {})
        norm_grades = {str(k): int(v) for k, v in sorted(raw_grades.items())} if isinstance(raw_grades, dict) else {}

        solutions_list.append({
            "solution_id": str(s_dict.get("solution_id", "")),
            "pareto_rank": int(s_dict.get("pareto_rank", 1)),
            "crowding_distance": round(float(s_dict.get("crowding_distance", 0.0)), 4),
            "total_fuel_mt": round(float(s_dict.get("total_fuel_mt", 0.0)), 4),
            "total_cost_usd": round(float(s_dict.get("total_cost_usd", 0.0)), 2),
            "total_lifecycle_ghg_tco2e": round(float(s_dict.get("total_lifecycle_ghg_tco2e", 0.0)), 4),
            "total_cargo_delivered": round(float(s_dict.get("total_cargo_delivered", 0.0)), 2),
            "demand_satisfaction_pct": round(float(s_dict.get("demand_satisfaction_pct", 100.0)), 2),
            "schedule_reliability_pct": round(float(s_dict.get("schedule_reliability_pct", 100.0)), 2),
            "is_feasible": bool(s_dict.get("is_feasible", True)),
            "fleet_average_cii_rating": str(s_dict.get("fleet_average_cii_rating", "C")),
            "total_fueleu_penalty_usd": round(float(s_dict.get("total_fueleu_penalty_usd", 0.0)), 2),
            "total_eu_ets_cost_usd": round(float(s_dict.get("total_eu_ets_cost_usd", 0.0)), 2),
            "cii_grade_counts": norm_grades,
            "allocations": norm_allocs,
        })

    solutions_list.sort(key=lambda x: x["solution_id"])

    return {
        "version": CANONICAL_HASH_VERSION,
        "run_id": str(run_id),
        "algorithm": str(algorithm),
        "fleet_size": int(fleet_size),
        "total_evaluations": int(total_evaluations),
        "pareto_solutions_count": int(pareto_solutions_count),
        "compromise_solution_id": str(compromise_solution_id),
        "scenario_inputs": scenario_inputs,
        "pareto_front": solutions_list
    }


def compute_canonical_run_hash(payload: Dict[str, Any]) -> str:
    """
    Computes a canonical SHA-256 fingerprint over the versioned optimization run payload.
    Uses strict key ordering and compact separators to ensure cross-platform bit-for-bit determinism.
    """
    canonical_bytes = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(canonical_bytes).hexdigest()


def compute_run_audit_hash(
    run_id: str,
    scenario_id: str,
    selected_route_id: Optional[str],
    algorithm: str,
    fleet_size: int,
    total_evaluations: int,
    pareto_solutions_count: int,
    compromise_solution_id: str,
    pareto_front: List[Any],
    random_seed: Optional[int] = 42,
    carbon_tax_per_ton: Optional[float] = 100.0,
    weather_severity_multiplier: Optional[float] = 1.0,
    fuel_price_multipliers: Optional[Dict[str, float]] = None,
    demand_multiplier: Optional[float] = 1.0,
    target_speed_knots: Optional[float] = None,
    preferred_fuel_type: Optional[str] = None,
    operating_draft_meters: Optional[float] = None,
    custom_fleet: Optional[List[Dict[str, Any]]] = None
) -> str:
    """Convenience helper to build payload and compute canonical hash in one call."""
    payload = build_canonical_run_payload(
        run_id=run_id,
        scenario_id=scenario_id,
        selected_route_id=selected_route_id,
        algorithm=algorithm,
        fleet_size=fleet_size,
        total_evaluations=total_evaluations,
        pareto_solutions_count=pareto_solutions_count,
        compromise_solution_id=compromise_solution_id,
        pareto_front=pareto_front,
        random_seed=random_seed,
        carbon_tax_per_ton=carbon_tax_per_ton,
        weather_severity_multiplier=weather_severity_multiplier,
        fuel_price_multipliers=fuel_price_multipliers,
        demand_multiplier=demand_multiplier,
        target_speed_knots=target_speed_knots,
        preferred_fuel_type=preferred_fuel_type,
        operating_draft_meters=operating_draft_meters,
        custom_fleet=custom_fleet
    )
    return compute_canonical_run_hash(payload)


def recompute_hash_from_persisted_run(persisted_entry: Dict[str, Any]) -> str:
    """
    Recomputes the canonical SHA-256 audit hash directly from disk or in-memory run entry,
    enabling independent audit re-verification.
    Protects all consequential inputs, custom fleet, constraints, allocations (speeds, fuels, reasons, draft,
    round_trips, cargo_carried, transit_time, etc.), and regulatory outputs.
    """
    resp = persisted_entry.get("response", persisted_entry)
    if hasattr(resp, "model_dump"):
        resp_dict = resp.model_dump()
    elif hasattr(resp, "__dict__"):
        resp_dict = resp.__dict__
    elif isinstance(resp, dict):
        resp_dict = resp
    else:
        resp_dict = {}

    params = persisted_entry.get("problem_params", {}) if isinstance(persisted_entry, dict) else {}

    run_id = resp_dict.get("run_id", persisted_entry.get("run_id", "") if isinstance(persisted_entry, dict) else "")
    scenario_id = resp_dict.get("scenario_id", "")
    selected_route_id = resp_dict.get("selected_route_id")
    if selected_route_id is None and "selected_route_id" in params:
        selected_route_id = params.get("selected_route_id")

    algorithm = resp_dict.get("algorithm", "")
    fleet_size = resp_dict.get("fleet_size", params.get("fleet_size", 0))
    total_evaluations = resp_dict.get("total_evaluations", 0)
    pareto_front = resp_dict.get("pareto_front", [])
    pareto_solutions_count = resp_dict.get("pareto_solutions_count", len(pareto_front))
    compromise_id = resp_dict.get("compromise_solution_id", "")

    # Scenario inputs: prioritize values present on the response object, falling back to problem_params
    random_seed = resp_dict.get("random_seed")
    if random_seed is None:
        random_seed = params.get("random_seed", 42)

    carbon_tax = resp_dict.get("carbon_tax_per_ton")
    if carbon_tax is None:
        carbon_tax = params.get("carbon_tax_per_ton", params.get("carbon_tax", 100.0))

    weather = resp_dict.get("weather_severity_multiplier")
    if weather is None:
        weather = params.get("weather_severity_multiplier", params.get("weather", 1.0))

    demand = resp_dict.get("demand_multiplier")
    if demand is None:
        demand = params.get("demand_multiplier", params.get("demand", 1.0))

    fuel_mults = resp_dict.get("fuel_price_multipliers")
    if fuel_mults is None:
        fuel_mults = params.get("fuel_price_multipliers", {})

    target_speed = resp_dict.get("target_speed_knots")
    if target_speed is None:
        target_speed = params.get("target_speed_knots")

    preferred_fuel = resp_dict.get("preferred_fuel_type")
    if preferred_fuel is None:
        preferred_fuel = params.get("preferred_fuel_type")

    operating_draft = resp_dict.get("operating_draft_meters")
    if operating_draft is None:
        operating_draft = params.get("operating_draft_meters")

    custom_fleet = resp_dict.get("custom_fleet")
    if custom_fleet is None:
        custom_fleet = params.get("custom_fleet")

    return compute_run_audit_hash(
        run_id=run_id,
        scenario_id=scenario_id,
        selected_route_id=selected_route_id,
        algorithm=algorithm,
        fleet_size=fleet_size,
        total_evaluations=total_evaluations,
        pareto_solutions_count=pareto_solutions_count,
        compromise_solution_id=compromise_id,
        pareto_front=pareto_front,
        random_seed=random_seed,
        carbon_tax_per_ton=carbon_tax,
        weather_severity_multiplier=weather,
        fuel_price_multipliers=fuel_mults,
        demand_multiplier=demand,
        target_speed_knots=target_speed,
        preferred_fuel_type=preferred_fuel,
        operating_draft_meters=operating_draft,
        custom_fleet=custom_fleet
    )


def validate_run_integrity(persisted_entry: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates whether a persisted run or API payload has maintained audit integrity.
    Recomputes the canonical SHA-256 hash across all scenario inputs, constraints,
    allocations, and Pareto results, comparing against the recorded audit_hash.
    Enforces canonical payload version 2.0.
    """
    resp = persisted_entry.get("response", persisted_entry)
    params = persisted_entry.get("problem_params", {}) if isinstance(persisted_entry, dict) else {}
    resp_dict = resp.model_dump() if hasattr(resp, "model_dump") else (resp.__dict__ if hasattr(resp, "__dict__") else (resp if isinstance(resp, dict) else {}))

    # 1. Enforce canonical payload version "2.0"
    version = None
    if isinstance(persisted_entry, dict) and "version" in persisted_entry:
        version = persisted_entry.get("version")
    if not version and hasattr(resp, "canonical_version"):
        version = getattr(resp, "canonical_version", None)
    elif not version and isinstance(resp_dict, dict):
        version = resp_dict.get("canonical_version") or resp_dict.get("version")
    if not version and isinstance(params, dict):
        version = params.get("version")

    if not version or str(version) != CANONICAL_HASH_VERSION:
        return {
            "is_valid": False,
            "error": f"Unsupported or outdated canonical hash version '{version}'. Expected '{CANONICAL_HASH_VERSION}'.",
            "recorded_hash": "",
            "recomputed_hash": "",
            "version": str(version) if version else "unknown"
        }

    # 2. Check for recorded hash
    recorded_hash = ""
    if hasattr(resp, "audit_hash"):
        recorded_hash = getattr(resp, "audit_hash", "")
    elif isinstance(resp_dict, dict):
        recorded_hash = resp_dict.get("audit_hash", "")
    if not recorded_hash and isinstance(params, dict):
        recorded_hash = params.get("audit_hash", "")

    if not recorded_hash:
        return {
            "is_valid": False,
            "error": "Missing recorded audit_hash in run payload.",
            "recorded_hash": "",
            "recomputed_hash": "",
            "version": CANONICAL_HASH_VERSION
        }

    # 3. Detect scenario parameter tampering/desynchronization between problem_params and response
    if params and resp_dict:
        param_tax = params.get("carbon_tax_per_ton", params.get("carbon_tax"))
        resp_tax = resp_dict.get("carbon_tax_per_ton")
        if param_tax is not None and resp_tax is not None and round(float(param_tax), 4) != round(float(resp_tax), 4):
            return {
                "is_valid": False,
                "error": f"Scenario input mismatch: problem_params carbon_tax={param_tax} != response carbon_tax={resp_tax}.",
                "recorded_hash": recorded_hash,
                "recomputed_hash": "",
                "version": CANONICAL_HASH_VERSION
            }

        param_w = params.get("weather_severity_multiplier", params.get("weather"))
        resp_w = resp_dict.get("weather_severity_multiplier")
        if param_w is not None and resp_w is not None and round(float(param_w), 4) != round(float(resp_w), 4):
            return {
                "is_valid": False,
                "error": f"Scenario input mismatch: problem_params weather={param_w} != response weather={resp_w}.",
                "recorded_hash": recorded_hash,
                "recomputed_hash": "",
                "version": CANONICAL_HASH_VERSION
            }

        param_d = params.get("demand_multiplier", params.get("demand"))
        resp_d = resp_dict.get("demand_multiplier")
        if param_d is not None and resp_d is not None and round(float(param_d), 4) != round(float(resp_d), 4):
            return {
                "is_valid": False,
                "error": f"Scenario input mismatch: problem_params demand={param_d} != response demand={resp_d}.",
                "recorded_hash": recorded_hash,
                "recomputed_hash": "",
                "version": CANONICAL_HASH_VERSION
            }

        param_ts = params.get("target_speed_knots")
        resp_ts = resp_dict.get("target_speed_knots")
        if param_ts is not None and resp_ts is not None and round(float(param_ts), 4) != round(float(resp_ts), 4):
            return {
                "is_valid": False,
                "error": f"Scenario input mismatch: problem_params target_speed={param_ts} != response target_speed={resp_ts}.",
                "recorded_hash": recorded_hash,
                "recomputed_hash": "",
                "version": CANONICAL_HASH_VERSION
            }

        param_rs = params.get("random_seed")
        resp_rs = resp_dict.get("random_seed")
        if param_rs is not None and resp_rs is not None and int(param_rs) != int(resp_rs):
            return {
                "is_valid": False,
                "error": f"Scenario input mismatch: problem_params random_seed={param_rs} != response random_seed={resp_rs}.",
                "recorded_hash": recorded_hash,
                "recomputed_hash": "",
                "version": CANONICAL_HASH_VERSION
            }

    # 4. Recompute canonical SHA-256 hash
    try:
        recomputed_hash = recompute_hash_from_persisted_run(persisted_entry)
    except Exception as e:
        return {
            "is_valid": False,
            "error": f"Failed to recompute audit hash: {str(e)}",
            "recorded_hash": recorded_hash,
            "recomputed_hash": "",
            "version": CANONICAL_HASH_VERSION
        }

    if recomputed_hash != recorded_hash:
        return {
            "is_valid": False,
            "error": f"Audit hash mismatch: recorded={recorded_hash}, recomputed={recomputed_hash}",
            "recorded_hash": recorded_hash,
            "recomputed_hash": recomputed_hash,
            "version": CANONICAL_HASH_VERSION
        }

    return {
        "is_valid": True,
        "error": None,
        "recorded_hash": recorded_hash,
        "recomputed_hash": recomputed_hash,
        "version": CANONICAL_HASH_VERSION
    }


def verify_run_integrity(persisted_entry: Dict[str, Any]) -> bool:
    """Convenience boolean check for audit integrity."""
    return validate_run_integrity(persisted_entry)["is_valid"]
