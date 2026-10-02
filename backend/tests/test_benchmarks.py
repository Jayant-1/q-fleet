"""Unit tests for multi-objective optimization benchmarks."""

import pytest
from backend.app.optimization.benchmarks import run_fleet_optimization_benchmark


def test_matched_budget_benchmark():
    """Verifies that MO-QIEA, NSGA-II, and MO-PSO execute under exact budget parity."""
    pop_size = 15
    generations = 10
    res = run_fleet_optimization_benchmark(pop_size=pop_size, generations=generations, seed=42)

    assert len(res["algorithms_compared"]) == 3
    expected_budget = pop_size * generations

    for a in res["algorithms_compared"]:
        assert a["total_evaluations"] == expected_budget
        assert a["execution_time_seconds"] < 8.0  # NFR-PERF-02 target
        assert "min_fuel_mt" in a
        assert "min_lifecycle_ghg_tco2e" in a
        assert "min_cost_usd" in a
        assert len(a["convergence_curve"]) == generations
