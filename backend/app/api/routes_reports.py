"""
FastAPI Routes for Scenario Report Generation and Audit Ledger Exports.
"""

from fastapi import APIRouter, HTTPException, Response
from typing import Optional
from backend.app.api.routes_optimization import OPTIMIZATION_RUNS_STORE
from backend.app.reports.generator import AuditReportGenerator

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/html/{run_id}", response_class=Response)
def get_html_report(run_id: str, solution_id: Optional[str] = None):
    """
    Renders and streams a complete, audit-grade printable HTML report
    for the selected optimization run and compromise solution.
    """
    if run_id not in OPTIMIZATION_RUNS_STORE:
        raise HTTPException(status_code=404, detail="Run ID not found. Execute an optimization first.")

    run_entry = OPTIMIZATION_RUNS_STORE[run_id]
    raw_solutions = run_entry["raw_solutions"]
    response_obj = run_entry["response"]

    # Select solution
    target_sol = None
    if solution_id and solution_id in raw_solutions:
        target_sol = raw_solutions[solution_id]
    elif response_obj.compromise_solution_id and response_obj.compromise_solution_id in raw_solutions:
        target_sol = raw_solutions[response_obj.compromise_solution_id]
    elif raw_solutions:
        target_sol = list(raw_solutions.values())[0]

    if not target_sol:
        raise HTTPException(status_code=400, detail="No valid solution found in run archive")

    html_content = AuditReportGenerator.generate_html_report(
        scenario_name=response_obj.scenario_id,
        solution=target_sol,
        problem_params=run_entry["problem_params"]
    )

    return Response(content=html_content, media_type="text/html")


@router.get("/json/{run_id}")
def get_json_audit_ledger(run_id: str):
    """Downloads machine-readable JSON compliance ledger."""
    if run_id not in OPTIMIZATION_RUNS_STORE:
        raise HTTPException(status_code=404, detail="Run ID not found")
    entry = OPTIMIZATION_RUNS_STORE[run_id]
    return {
        "run_id": run_id,
        "hash": AuditReportGenerator.compute_audit_hash(entry["response"].model_dump()),
        "data": entry["response"]
    }
