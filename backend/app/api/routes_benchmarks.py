"""
FastAPI Routes for Optimization Benchmarks (MO-QIEA vs NSGA-II vs MO-PSO).
"""

from fastapi import APIRouter, HTTPException
from backend.app.domain.schemas import (
    BenchmarkComparisonRequest,
    BenchmarkComparisonResponse,
    AlgorithmBenchmarkMetric
)
from backend.app.optimization.benchmarks import run_fleet_optimization_benchmark

router = APIRouter(prefix="/api/benchmarks", tags=["Benchmarks"])

# Cached benchmark results
_LATEST_BENCHMARK = None


@router.post("/compare", response_model=BenchmarkComparisonResponse)
def run_benchmark_comparison(req: BenchmarkComparisonRequest):
    """
    Executes a matched computational budget benchmark across MO-QIEA, NSGA-II, and MO-PSO.
    """
    global _LATEST_BENCHMARK
    try:
        res = run_fleet_optimization_benchmark(
            pop_size=req.population_size,
            generations=req.generations,
            carbon_tax=req.carbon_tax_per_ton,
            seed=req.random_seed
        )
        response_model = BenchmarkComparisonResponse(
            benchmark_id=res["benchmark_id"],
            scenario_id=req.scenario_id,
            budget_evaluations=res["budget_evaluations_per_algorithm"],
            algorithms_compared=[
                AlgorithmBenchmarkMetric(
                    algorithm=a["algorithm"],
                    total_evaluations=a["total_evaluations"],
                    execution_time_seconds=a["execution_time_seconds"],
                    pareto_front_size=a["pareto_front_size"],
                    hypervolume=a["hypervolume"],
                    spacing_spread=a["spacing_spread"],
                    min_fuel_mt=a["min_fuel_mt"],
                    min_cost_usd=a["min_cost_usd"],
                    min_lifecycle_ghg_tco2e=a["min_lifecycle_ghg_tco2e"],
                    feasibility_rate_pct=a["feasibility_rate_pct"],
                    convergence_curve=a["convergence_curve"]
                )
                for a in res["algorithms_compared"]
            ],
            winner_hypervolume=res["winner_hypervolume"],
            winner_solution_quality=res["winner_solution_quality"],
            methodology_notes=res["methodology_notes"]
        )
        _LATEST_BENCHMARK = response_model
        return response_model
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark comparison failed: {str(e)}")


@router.get("/latest", response_model=BenchmarkComparisonResponse)
def get_latest_benchmark():
    """Returns the most recent benchmark run or executes a default baseline run."""
    global _LATEST_BENCHMARK
    if _LATEST_BENCHMARK is None:
        default_req = BenchmarkComparisonRequest(population_size=25, generations=20, random_seed=42)
        return run_benchmark_comparison(default_req)
    return _LATEST_BENCHMARK
