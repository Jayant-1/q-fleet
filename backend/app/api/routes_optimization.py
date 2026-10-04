import json
import time
import uuid
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from backend.app.domain.schemas import (
    OptimizeRunRequest,
    OptimizeRunResponse,
    ParetoSolutionSchema,
    VesselAllocationItem,
    GenerationConvergenceItem
)
from backend.app.domain.models import FleetDeploymentSolution, VesselSpecification, VesselType
from backend.app.domain.fuels import FuelType
from backend.app.optimization.problem import FleetDeploymentProblem
from backend.app.optimization.qiea_engine import MultiObjectiveQIEA
from backend.app.optimization.nsga2_baseline import ClassicalNSGA2Optimizer
from backend.app.optimization.mopso_baseline import ClassicalMOPSOOptimizer
from backend.app.reports.hashing import (
    CANONICAL_HASH_VERSION,
    compute_run_audit_hash,
    validate_run_integrity,
    recompute_hash_from_persisted_run
)

router = APIRouter(prefix="/api/optimize", tags=["Optimization"])

# Global Run Results Store (run_id -> run_data)
OPTIMIZATION_RUNS_STORE: Dict[str, Dict[str, Any]] = {}
RUNS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "runs"
RUNS_DIR.mkdir(parents=True, exist_ok=True)


def parse_custom_vessel(d: Dict[str, Any]) -> VesselSpecification:
    """Parses a user-supplied custom vessel definition into a VesselSpecification."""
    vt_str = str(d.get("vessel_type", "Container_PostPanamax"))
    matched_vt = None
    for vt in VesselType:
        if vt.value.lower() == vt_str.lower() or vt.name.lower() == vt_str.lower():
            matched_vt = vt
            break
    if not matched_vt:
        matched_vt = VesselType.CONTAINER_POSTPANAMAX

    fuels_raw = d.get("compatible_fuels", ["VLSFO", "MGO"])
    comp_fuels = []
    for f in fuels_raw:
        for ft in FuelType:
            if ft.value.lower() == str(f).lower() or ft.name.lower() == str(f).lower():
                comp_fuels.append(ft)
                break
    if not comp_fuels:
        comp_fuels = [FuelType.VLSFO, FuelType.MGO]

    dwt_val = float(d.get("dwt", 80000.0))
    gt_val = d.get("gross_tonnage")
    if gt_val is not None:
        gross_tonnage = float(gt_val)
    else:
        is_container = "container" in matched_vt.value.lower()
        gross_tonnage = round(dwt_val * (0.85 if is_container else 0.55), 1)

    return VesselSpecification(
        vessel_id=str(d.get("vessel_id", f"CUSTOM_{d.get('name', 'VESSEL')}")),
        name=str(d.get("name", "Custom Vessel")),
        vessel_type=matched_vt,
        dwt=dwt_val,
        gross_tonnage=gross_tonnage,
        capacity_teu_or_dwt=float(d.get("capacity_teu_or_dwt", 8000.0)),
        design_speed_knots=float(d.get("design_speed_knots", 18.0)),
        min_speed_knots=float(d.get("min_speed_knots", 10.0)),
        max_speed_knots=float(d.get("max_speed_knots", 21.0)),
        design_draft_meters=float(d.get("design_draft_meters", 12.0)),
        beam_meters=float(d.get("beam_meters", 32.0)),
        length_overall_meters=float(d.get("length_overall_meters", 260.0)),
        main_engine_mcr_kw=float(d.get("main_engine_mcr_kw", 30000.0)),
        auxiliary_power_kw=float(d.get("auxiliary_power_kw", 2000.0)),
        berth_aux_power_kw=float(d.get("berth_aux_power_kw", 800.0)),
        compatible_fuels=comp_fuels,
        has_shore_power_connection=bool(d.get("has_shore_power_connection", True)),
        daily_capital_cost_usd=float(d.get("daily_capital_cost_usd", 25000.0)),
        cii_rating_baseline=str(d.get("cii_rating_baseline", "C"))
    )


def _solution_to_schema(sol: FleetDeploymentSolution) -> ParetoSolutionSchema:
    alloc_items = [
        VesselAllocationItem(
            vessel_id=a.vessel_id,
            vessel_name=a.vessel_name,
            vessel_type=a.vessel_type,
            route_id=a.route_id,
            route_name=a.route_name,
            speed_knots=a.speed_knots,
            fuel_type=a.fuel_type,
            shore_power_used=a.shore_power_used,
            round_trips=a.round_trips,
            fuel_consumed_sea_mt=a.fuel_consumed_sea_mt,
            fuel_consumed_berth_mt=a.fuel_consumed_berth_mt,
            total_fuel_mt=a.total_fuel_mt,
            operational_cost_usd=a.operational_cost_usd,
            lifecycle_ghg_tco2e=a.lifecycle_ghg_tco2e,
            transit_time_days=a.transit_time_days,
            cargo_carried=a.cargo_carried,
            is_feasible=a.is_feasible,
            violation_reasons=a.violation_reasons,
            cii_rating=getattr(a, "cii_rating", "C"),
            attained_aer=getattr(a, "attained_aer", 0.0),
            fueleu_deficit_penalty_usd=getattr(a, "fueleu_deficit_penalty_usd", 0.0),
            eu_ets_cost_usd=getattr(a, "eu_ets_cost_usd", 0.0),
            target_speed_knots=getattr(a, "target_speed_knots", None),
            applied_speed_knots=getattr(a, "applied_speed_knots", a.speed_knots),
            speed_adjustment_reason=getattr(a, "speed_adjustment_reason", ""),
            fuel_adjustment_reason=getattr(a, "fuel_adjustment_reason", ""),
            applied_draft_meters=getattr(a, "applied_draft_meters", 0.0)
        )
        for a in sol.allocations
    ]

    return ParetoSolutionSchema(
        solution_id=sol.solution_id,
        algorithm=sol.algorithm,
        total_fuel_mt=sol.total_fuel_mt,
        total_cost_usd=sol.total_cost_usd,
        total_lifecycle_ghg_tco2e=sol.total_lifecycle_ghg_tco2e,
        total_cargo_delivered=sol.total_cargo_delivered,
        demand_satisfaction_pct=sol.demand_satisfaction_pct,
        schedule_reliability_pct=sol.schedule_reliability_pct,
        is_feasible=sol.is_feasible,
        pareto_rank=sol.pareto_rank,
        crowding_distance=sol.crowding_distance,
        allocations=alloc_items,
        fleet_average_cii_rating=getattr(sol, "fleet_average_cii_rating", "C"),
        total_fueleu_penalty_usd=getattr(sol, "total_fueleu_penalty_usd", 0.0),
        total_eu_ets_cost_usd=getattr(sol, "total_eu_ets_cost_usd", 0.0),
        cii_grade_counts=getattr(sol, "cii_grade_counts", {})
    )


def get_run_entry(run_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves run entry from in-memory cache or disk storage with cryptographic audit integrity check."""
    entry = OPTIMIZATION_RUNS_STORE.get(run_id)
    if entry is not None:
        integrity_info = validate_run_integrity(entry)
        entry["integrity_verified"] = integrity_info["is_valid"]
        entry["recomputed_hash"] = integrity_info["recomputed_hash"]
        entry["recorded_hash"] = integrity_info["recorded_hash"]
        entry["integrity_error"] = integrity_info.get("error")
        return entry

    disk_path = RUNS_DIR / f"{run_id}.json"
    if disk_path.exists():
        try:
            with open(disk_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            return {
                "version": "unknown",
                "response": None,
                "raw_solutions": {},
                "problem_params": {},
                "integrity_verified": False,
                "recomputed_hash": "",
                "recorded_hash": "",
                "integrity_error": f"Failed to parse run file: {str(e)}"
            }

        integrity_info = validate_run_integrity(data)
        try:
            response_obj = OptimizeRunResponse(**data.get("response", {}))
        except Exception as e:
            return {
                "version": data.get("version", "unknown"),
                "response": None,
                "raw_solutions": {},
                "problem_params": data.get("problem_params", {}),
                "integrity_verified": False,
                "recomputed_hash": integrity_info.get("recomputed_hash", ""),
                "recorded_hash": integrity_info.get("recorded_hash", ""),
                "integrity_error": f"Schema validation error on persisted run: {str(e)}"
            }

        entry = {
            "version": data.get("version", response_obj.canonical_version),
            "response": response_obj,
            "raw_solutions": {},
            "problem_params": data.get("problem_params", {}),
            "integrity_verified": integrity_info["is_valid"],
            "recomputed_hash": integrity_info["recomputed_hash"],
            "recorded_hash": integrity_info["recorded_hash"],
            "integrity_error": integrity_info.get("error"),
        }
        OPTIMIZATION_RUNS_STORE[run_id] = entry
        return entry
    return None


@router.post("/run", response_model=OptimizeRunResponse)
def run_fleet_optimization(req: OptimizeRunRequest):
    """
    Executes multi-objective fleet deployment optimization under chosen algorithm.
    Returns the non-dominated Pareto frontier, convergence telemetry, and knee compromise solution.
    """
    try:
        custom_fleet = None
        if req.custom_fleet:
            custom_fleet = [parse_custom_vessel(v) for v in req.custom_fleet]

        problem = FleetDeploymentProblem(
            fleet=custom_fleet,
            carbon_tax_per_ton=req.carbon_tax_per_ton,
            weather_severity_multiplier=req.weather_severity_multiplier,
            fuel_price_multipliers=req.fuel_price_multipliers,
            demand_multiplier=req.demand_multiplier,
            scenario_id=req.scenario_id,
            selected_route_id=req.selected_route_id,
            target_speed_knots=req.target_speed_knots,
            preferred_fuel_type=req.preferred_fuel_type,
            operating_draft_meters=req.operating_draft_meters
        )

        algo_name = req.algorithm.upper()
        if "QIEA" in algo_name:
            solver = MultiObjectiveQIEA(
                problem=problem,
                pop_size=req.population_size,
                generations=req.generations,
                seed=req.random_seed
            )
        elif "NSGA" in algo_name:
            solver = ClassicalNSGA2Optimizer(
                problem=problem,
                pop_size=req.population_size,
                generations=req.generations,
                seed=req.random_seed
            )
        elif "PSO" in algo_name:
            solver = ClassicalMOPSOOptimizer(
                problem=problem,
                swarm_size=req.population_size,
                iterations=req.generations,
                seed=req.random_seed
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported algorithm '{req.algorithm}'. Use 'MO-QIEA', 'NSGA-II', or 'MO-PSO'.")

        res = solver.solve()
        unique_suffix = uuid.uuid4().hex[:8]
        run_id = f"run_{int(time.time())}_{unique_suffix}_{algo_name.lower().replace('-', '_')}"

        pareto_schemas = [_solution_to_schema(s) for s in res["pareto_front"]]
        conv_items = [
            GenerationConvergenceItem(
                generation=c["generation"],
                best_fuel_mt=c["best_fuel_mt"],
                best_cost_usd=c["best_cost_usd"],
                best_ghg_tco2e=c["best_ghg_tco2e"],
                hypervolume=c["hypervolume"],
                population_diversity=c.get("population_diversity", 0.5)
            )
            for c in res["convergence_history"]
        ]

        compromise_id = res.get("compromise_solution_id", "")
        if not compromise_id and pareto_schemas:
            compromise_id = pareto_schemas[0].solution_id

        fleet_size = len(problem.fleet)
        audit_hash = compute_run_audit_hash(
            run_id=run_id,
            scenario_id=req.scenario_id,
            selected_route_id=req.selected_route_id,
            algorithm=req.algorithm,
            fleet_size=fleet_size,
            total_evaluations=res["total_evaluations"],
            pareto_solutions_count=len(pareto_schemas),
            compromise_solution_id=compromise_id,
            pareto_front=pareto_schemas,
            random_seed=req.random_seed,
            carbon_tax_per_ton=req.carbon_tax_per_ton,
            weather_severity_multiplier=req.weather_severity_multiplier,
            fuel_price_multipliers=req.fuel_price_multipliers,
            demand_multiplier=req.demand_multiplier,
            target_speed_knots=req.target_speed_knots,
            preferred_fuel_type=req.preferred_fuel_type,
            operating_draft_meters=req.operating_draft_meters,
            custom_fleet=req.custom_fleet
        )

        response_data = OptimizeRunResponse(
            run_id=run_id,
            scenario_id=req.scenario_id,
            algorithm=req.algorithm,
            population_size=req.population_size,
            generations=req.generations,
            total_evaluations=res["total_evaluations"],
            execution_time_seconds=res["execution_time_seconds"],
            pareto_solutions_count=len(pareto_schemas),
            pareto_front=pareto_schemas,
            convergence_history=conv_items,
            compromise_solution_id=compromise_id,
            random_seed=req.random_seed,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            selected_route_id=req.selected_route_id,
            fleet_size=fleet_size,
            audit_hash=audit_hash,
            carbon_tax_per_ton=req.carbon_tax_per_ton,
            weather_severity_multiplier=req.weather_severity_multiplier,
            fuel_price_multipliers=req.fuel_price_multipliers or {},
            demand_multiplier=req.demand_multiplier,
            target_speed_knots=req.target_speed_knots,
            preferred_fuel_type=req.preferred_fuel_type,
            operating_draft_meters=req.operating_draft_meters,
            custom_fleet=req.custom_fleet
        )

        entry = {
            "version": CANONICAL_HASH_VERSION,
            "response": response_data,
            "raw_solutions": {s.solution_id: s for s in res["pareto_front"]},
            "problem_params": {
                "version": CANONICAL_HASH_VERSION,
                "carbon_tax": req.carbon_tax_per_ton,
                "carbon_tax_per_ton": req.carbon_tax_per_ton,
                "weather": req.weather_severity_multiplier,
                "weather_severity_multiplier": req.weather_severity_multiplier,
                "demand": req.demand_multiplier,
                "demand_multiplier": req.demand_multiplier,
                "fuel_price_multipliers": req.fuel_price_multipliers or {},
                "selected_route_id": req.selected_route_id,
                "target_speed_knots": req.target_speed_knots,
                "preferred_fuel_type": req.preferred_fuel_type,
                "operating_draft_meters": req.operating_draft_meters,
                "custom_fleet": req.custom_fleet,
                "fleet_size": fleet_size,
                "random_seed": req.random_seed,
                "audit_hash": audit_hash
            },
            "integrity_verified": True,
            "recomputed_hash": audit_hash,
            "recorded_hash": audit_hash,
            "integrity_error": None
        }
        OPTIMIZATION_RUNS_STORE[run_id] = entry

        # Durable disk storage
        disk_payload = {
            "run_id": run_id,
            "version": CANONICAL_HASH_VERSION,
            "response": response_data.model_dump(),
            "problem_params": entry["problem_params"]
        }
        with open(RUNS_DIR / f"{run_id}.json", "w", encoding="utf-8") as f:
            json.dump(disk_payload, f, indent=2, default=str)

        return response_data
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


@router.get("/run/{run_id}", response_model=OptimizeRunResponse)
def get_run_details(run_id: str):
    """Retrieves cached or persisted results of a prior optimization run with strict audit integrity enforcement."""
    entry = get_run_entry(run_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Run ID not found")
    if not entry.get("integrity_verified", False):
        err = entry.get("integrity_error") or "Persisted run data has been modified or corrupted."
        raise HTTPException(status_code=400, detail=f"Audit integrity validation failed: {err}")
    return entry["response"]
