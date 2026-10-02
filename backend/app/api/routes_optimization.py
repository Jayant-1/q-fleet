"""
FastAPI Routes for Multi-Objective Fleet Deployment Optimization.
Supports MO-QIEA, NSGA-II, and MO-PSO execution with scenario policy levers.
"""

import time
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from backend.app.domain.schemas import (
    OptimizeRunRequest,
    OptimizeRunResponse,
    ParetoSolutionSchema,
    VesselAllocationItem,
    GenerationConvergenceItem
)
from backend.app.domain.models import FleetDeploymentSolution
from backend.app.optimization.problem import FleetDeploymentProblem
from backend.app.optimization.qiea_engine import MultiObjectiveQIEA
from backend.app.optimization.nsga2_baseline import ClassicalNSGA2Optimizer
from backend.app.optimization.mopso_baseline import ClassicalMOPSOOptimizer

router = APIRouter(prefix="/api/optimize", tags=["Optimization"])

# Global Run Results Store (run_id -> run_data)
OPTIMIZATION_RUNS_STORE: Dict[str, Dict[str, Any]] = {}


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
            violation_reasons=a.violation_reasons
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
        allocations=alloc_items
    )


@router.post("/run", response_model=OptimizeRunResponse)
def run_fleet_optimization(req: OptimizeRunRequest):
    """
    Executes multi-objective fleet deployment optimization under chosen algorithm.
    Returns the non-dominated Pareto frontier, convergence telemetry, and knee compromise solution.
    """
    try:
        problem = FleetDeploymentProblem(
            carbon_tax_per_ton=req.carbon_tax_per_ton,
            weather_severity_multiplier=req.weather_severity_multiplier,
            fuel_price_multipliers=req.fuel_price_multipliers,
            demand_multiplier=req.demand_multiplier
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
        run_id = f"run_{int(time.time())}_{algo_name.lower().replace('-', '_')}"

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
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        )

        # Store in-memory for subsequent report queries
        OPTIMIZATION_RUNS_STORE[run_id] = {
            "response": response_data,
            "raw_solutions": {s.solution_id: s for s in res["pareto_front"]},
            "problem_params": {
                "carbon_tax": req.carbon_tax_per_ton,
                "weather": req.weather_severity_multiplier,
                "demand": req.demand_multiplier
            }
        }

        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


@router.get("/run/{run_id}", response_model=OptimizeRunResponse)
def get_run_details(run_id: str):
    """Retrieves cached results of a prior optimization run."""
    if run_id not in OPTIMIZATION_RUNS_STORE:
        raise HTTPException(status_code=404, detail="Run ID not found")
    return OPTIMIZATION_RUNS_STORE[run_id]["response"]
