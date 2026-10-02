"""Unit tests for Multi-Objective QIEA optimization engine and constraint enforcement."""

import pytest
import numpy as np
from backend.app.domain.fuels import FuelType
from backend.app.optimization.problem import FleetDeploymentProblem
from backend.app.optimization.qiea_engine import (
    MultiObjectiveQIEA,
    fast_non_dominated_sort,
    calculate_crowding_distance
)


def test_fast_non_dominated_sort_ranks():
    """Verifies Pareto dominance sorting logic."""
    # 3 points: p0 dominates p1; p0 and p2 are mutually non-dominated
    objs = np.array([
        [10.0, 100.0, 50.0],  # p0
        [12.0, 110.0, 55.0],  # p1 (dominated by p0)
        [8.0,  150.0, 45.0],  # p2 (non-dominated with p0)
    ])
    fronts = fast_non_dominated_sort(objs)
    assert 0 in fronts[0]
    assert 2 in fronts[0]
    assert 1 in fronts[1]


def test_moqiea_feasibility_and_cargo_demand():
    """Verifies MO-QIEA produces feasible fleet allocations with zero cargo shortfall."""
    problem = FleetDeploymentProblem(carbon_tax_per_ton=100.0)
    solver = MultiObjectiveQIEA(problem, pop_size=20, generations=15, seed=42)
    res = solver.solve()

    pareto = res["pareto_front"]
    assert len(pareto) >= 1
    for sol in pareto:
        assert sol.is_feasible
        assert sol.demand_satisfaction_pct >= 99.9
        assert sol.total_fuel_mt > 0
        assert sol.total_cost_usd > 0
        assert sol.total_lifecycle_ghg_tco2e > 0


def test_reproducibility_with_seed():
    """Verifies that fixed pseudorandom seed produces identical objectives within numeric precision."""
    problem1 = FleetDeploymentProblem(carbon_tax_per_ton=80.0)
    solver1 = MultiObjectiveQIEA(problem1, pop_size=15, generations=10, seed=123)
    res1 = solver1.solve()

    problem2 = FleetDeploymentProblem(carbon_tax_per_ton=80.0)
    solver2 = MultiObjectiveQIEA(problem2, pop_size=15, generations=10, seed=123)
    res2 = solver2.solve()

    assert len(res1["pareto_front"]) == len(res2["pareto_front"])
    for s1, s2 in zip(res1["pareto_front"], res2["pareto_front"]):
        assert s1.total_fuel_mt == pytest.approx(s2.total_fuel_mt, abs=1e-2)
        assert s1.total_cost_usd == pytest.approx(s2.total_cost_usd, abs=1e-2)
