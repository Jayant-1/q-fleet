"""
FastAPI Routes for Scenario Report Generation and Audit Ledger Exports.
"""

from fastapi import APIRouter, HTTPException, Response
from typing import Optional
from backend.app.api.routes_optimization import get_run_entry
from backend.app.domain.models import FleetDeploymentSolution, VesselDeploymentAllocation
from backend.app.domain.schemas import ParetoSolutionSchema
from backend.app.reports.generator import AuditReportGenerator
from backend.app.reports.hashing import recompute_hash_from_persisted_run

router = APIRouter(prefix="/api/reports", tags=["Reports"])


def _schema_to_domain_solution(s: ParetoSolutionSchema) -> FleetDeploymentSolution:
    """Converts a ParetoSolutionSchema into a FleetDeploymentSolution domain model."""
    allocs = [
        VesselDeploymentAllocation(
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
            cii_rating=a.cii_rating,
            attained_aer=a.attained_aer,
            fueleu_deficit_penalty_usd=a.fueleu_deficit_penalty_usd,
            eu_ets_cost_usd=a.eu_ets_cost_usd,
            target_speed_knots=getattr(a, "target_speed_knots", None),
            applied_speed_knots=getattr(a, "applied_speed_knots", a.speed_knots),
            speed_adjustment_reason=getattr(a, "speed_adjustment_reason", ""),
            fuel_adjustment_reason=getattr(a, "fuel_adjustment_reason", ""),
            applied_draft_meters=getattr(a, "applied_draft_meters", 0.0)
        )
        for a in s.allocations
    ]
    return FleetDeploymentSolution(
        solution_id=s.solution_id,
        algorithm=s.algorithm,
        total_fuel_mt=s.total_fuel_mt,
        total_cost_usd=s.total_cost_usd,
        total_lifecycle_ghg_tco2e=s.total_lifecycle_ghg_tco2e,
        total_cargo_delivered=s.total_cargo_delivered,
        demand_satisfaction_pct=s.demand_satisfaction_pct,
        schedule_reliability_pct=s.schedule_reliability_pct,
        is_feasible=s.is_feasible,
        allocations=allocs,
        pareto_rank=s.pareto_rank,
        crowding_distance=s.crowding_distance,
        fleet_average_cii_rating=s.fleet_average_cii_rating,
        total_fueleu_penalty_usd=s.total_fueleu_penalty_usd,
        total_eu_ets_cost_usd=s.total_eu_ets_cost_usd,
        cii_grade_counts=s.cii_grade_counts
    )


def _resolve_solution(run_entry: dict, solution_id: Optional[str] = None) -> FleetDeploymentSolution:
    """Finds or reconstructs the target FleetDeploymentSolution from run entry."""
    raw_sols = run_entry.get("raw_solutions", {})
    response_obj = run_entry["response"]

    if solution_id:
        if solution_id in raw_sols:
            return raw_sols[solution_id]
        target_schema = next((s for s in response_obj.pareto_front if s.solution_id == solution_id), None)
        if target_schema:
            return _schema_to_domain_solution(target_schema)
        available = [s.solution_id for s in response_obj.pareto_front]
        raise HTTPException(
            status_code=404,
            detail=f"Solution ID '{solution_id}' not found in run '{response_obj.run_id}'. Available solutions: {available}"
        )

    # When no explicit solution_id requested, resolve compromise or premier front member
    if response_obj.compromise_solution_id in raw_sols:
        return raw_sols[response_obj.compromise_solution_id]
    if raw_sols:
        return list(raw_sols.values())[0]

    target_schema = None
    if response_obj.compromise_solution_id:
        target_schema = next((s for s in response_obj.pareto_front if s.solution_id == response_obj.compromise_solution_id), None)
    
    if not target_schema and response_obj.pareto_front:
        target_schema = response_obj.pareto_front[0]

    if not target_schema:
        raise HTTPException(status_code=404, detail=f"No valid solutions found in run '{response_obj.run_id}'")

    return _schema_to_domain_solution(target_schema)


@router.get("/html/{run_id}", response_class=Response)
def get_html_report(run_id: str, solution_id: Optional[str] = None):
    """
    Renders and streams a complete, audit-grade printable HTML report
    for the selected optimization run and compromise solution.
    """
    run_entry = get_run_entry(run_id)
    if not run_entry:
        raise HTTPException(status_code=404, detail="Run ID not found. Execute an optimization first.")
    if not run_entry.get("integrity_verified", False):
        err = run_entry.get("integrity_error") or "Persisted run data has been modified or corrupted."
        raise HTTPException(status_code=400, detail=f"Audit integrity validation failed: {err}")

    target_sol = _resolve_solution(run_entry, solution_id)
    response_obj = run_entry["response"]
    # Recompute hash directly from the run entry to ensure audit integrity
    audit_hash = run_entry.get("recomputed_hash") or recompute_hash_from_persisted_run(run_entry)

    scenario_name = getattr(response_obj, "scenario_id", "") or (response_obj.get("scenario_id", "scenario") if isinstance(response_obj, dict) else "scenario")

    html_content = AuditReportGenerator.generate_html_report(
        scenario_name=scenario_name,
        solution=target_sol,
        problem_params=run_entry["problem_params"],
        audit_hash=audit_hash
    )

    return Response(content=html_content, media_type="text/html")


@router.get("/pdf/{run_id}", response_class=Response)
def get_pdf_report(run_id: str, solution_id: Optional[str] = None):
    """
    Generates and streams an audit-grade binary PDF report
    with cryptographic SHA-256 fingerprint, IMO CII ratings, and FuelEU compliance ledger.
    """
    run_entry = get_run_entry(run_id)
    if not run_entry:
        raise HTTPException(status_code=404, detail="Run ID not found. Execute an optimization first.")
    if not run_entry.get("integrity_verified", False):
        err = run_entry.get("integrity_error") or "Persisted run data has been modified or corrupted."
        raise HTTPException(status_code=400, detail=f"Audit integrity validation failed: {err}")

    target_sol = _resolve_solution(run_entry, solution_id)
    response_obj = run_entry["response"]
    # Recompute hash directly from the run entry to ensure audit integrity
    audit_hash = run_entry.get("recomputed_hash") or recompute_hash_from_persisted_run(run_entry)

    scenario_name = getattr(response_obj, "scenario_id", "") or (response_obj.get("scenario_id", "scenario") if isinstance(response_obj, dict) else "scenario")

    pdf_bytes = AuditReportGenerator.generate_pdf_report(
        scenario_name=scenario_name,
        solution=target_sol,
        problem_params=run_entry["problem_params"],
        audit_hash=audit_hash
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=QFLEET_Audit_{run_id[:8]}.pdf"}
    )


@router.get("/json/{run_id}")
def get_json_audit_ledger(run_id: str):
    """Downloads machine-readable JSON compliance ledger with cryptographic integrity verification."""
    run_entry = get_run_entry(run_id)
    if not run_entry:
        raise HTTPException(status_code=404, detail="Run ID not found")
    if not run_entry.get("integrity_verified", False):
        err = run_entry.get("integrity_error") or "Persisted run data has been modified or corrupted."
        raise HTTPException(status_code=400, detail=f"Audit integrity validation failed: {err}")

    response_obj = run_entry["response"]
    return {
        "run_id": run_id,
        "hash": run_entry["recomputed_hash"],
        "recorded_hash": run_entry["recorded_hash"],
        "integrity_verified": True,
        "data": response_obj
    }
