"""
Pydantic V2 Request and Response Schemas for Decision Support Platform.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, field_validator
from backend.app.domain.fuels import FuelType
from backend.app.domain.models import VesselType


class PredictFuelRequest(BaseModel):
    vessel_type: VesselType = Field(default=VesselType.CONTAINER_ULTRALARGE, description="Vessel classification category")
    dwt: float = Field(default=195000.0, ge=5000.0, le=450000.0, description="Deadweight Tonnage (metric tons)")
    speed_knots: float = Field(default=18.5, ge=8.0, le=26.0, description="Speed Over Ground in knots")
    cargo_load_ratio: float = Field(default=0.85, ge=0.0, le=1.0, description="Cargo utilization ratio (0 to 1)")
    draft_meters: float = Field(default=15.0, ge=4.0, le=25.0, description="Vessel current draft in meters")
    wind_speed_knots: float = Field(default=15.0, ge=0.0, le=60.0, description="Wind velocity in knots")
    wave_height_meters: float = Field(default=2.0, ge=0.0, le=12.0, description="Significant wave height Hs in meters")
    current_knots: float = Field(default=0.5, ge=-5.0, le=5.0, description="Current velocity (positive = head, negative = following)")
    fuel_type: FuelType = Field(default=FuelType.VLSFO, description="Marine fuel type utilized")
    use_quantum_feature_selector: bool = Field(default=True, description="Enable QIEA feature-selected sparse regression pipeline")


class PredictFuelResponse(BaseModel):
    predicted_fuel_mt_per_day: float
    specific_fuel_oil_consumption_g_per_kwh: float
    estimated_shaft_power_kw: float
    calm_water_power_kw: float
    added_weather_resistance_kw: float
    fuel_type: FuelType
    lhv_adjusted_daily_mt: float
    feature_importance_mask: List[int]
    feature_names_used: List[str]
    model_version: str
    inference_latency_ms: float
    is_synthetic_model: bool = True
    data_provenance_label: str = "[SYNTHETIC-SIMULATED: Hydrodynamic Holtrop-Mennen Power Scaling + QIEA-FS]"


class VesselAllocationItem(BaseModel):
    vessel_id: str
    vessel_name: str
    vessel_type: str
    route_id: str
    route_name: str
    speed_knots: float
    fuel_type: FuelType
    shore_power_used: bool
    round_trips: int
    fuel_consumed_sea_mt: float
    fuel_consumed_berth_mt: float
    total_fuel_mt: float
    operational_cost_usd: float
    lifecycle_ghg_tco2e: float
    transit_time_days: float
    cargo_carried: float
    is_feasible: bool
    violation_reasons: List[str] = []


class ParetoSolutionSchema(BaseModel):
    solution_id: str
    algorithm: str
    total_fuel_mt: float
    total_cost_usd: float
    total_lifecycle_ghg_tco2e: float
    total_cargo_delivered: float
    demand_satisfaction_pct: float
    schedule_reliability_pct: float
    is_feasible: bool
    pareto_rank: int
    crowding_distance: float
    allocations: List[VesselAllocationItem]


class GenerationConvergenceItem(BaseModel):
    generation: int
    best_fuel_mt: float
    best_cost_usd: float
    best_ghg_tco2e: float
    hypervolume: float
    population_diversity: float


class OptimizeRunRequest(BaseModel):
    scenario_id: str = Field(default="global_liner_2026", description="Identifier of scenario configuration")
    algorithm: str = Field(default="MO-QIEA", description="Optimization algorithm: 'MO-QIEA', 'NSGA-II', or 'MO-PSO'")
    population_size: int = Field(default=40, ge=10, le=100, description="Candidate population size")
    generations: int = Field(default=50, ge=10, le=200, description="Generations budget")
    carbon_tax_per_ton: float = Field(default=100.0, ge=0.0, le=500.0, description="Carbon tax levy ($/ton CO2e WTW)")
    weather_severity_multiplier: float = Field(default=1.0, ge=0.5, le=2.0, description="Sea state severity scalar")
    fuel_price_multipliers: Dict[str, float] = Field(default_factory=dict, description="Fuel cost price multipliers")
    demand_multiplier: float = Field(default=1.0, ge=0.5, le=2.0, description="Cargo volume demand scalar")
    random_seed: int = Field(default=42, description="Pseudorandom generator seed for reproducibility")


class OptimizeRunResponse(BaseModel):
    run_id: str
    scenario_id: str
    algorithm: str
    population_size: int
    generations: int
    total_evaluations: int
    execution_time_seconds: float
    pareto_solutions_count: int
    pareto_front: List[ParetoSolutionSchema]
    convergence_history: List[GenerationConvergenceItem]
    compromise_solution_id: str
    random_seed: int
    timestamp: str


class BenchmarkComparisonRequest(BaseModel):
    scenario_id: str = Field(default="global_liner_2026")
    population_size: int = Field(default=40)
    generations: int = Field(default=50)
    carbon_tax_per_ton: float = Field(default=100.0)
    random_seed: int = Field(default=42)


class AlgorithmBenchmarkMetric(BaseModel):
    algorithm: str
    total_evaluations: int
    execution_time_seconds: float
    pareto_front_size: int
    hypervolume: float
    spacing_spread: float
    min_fuel_mt: float
    min_cost_usd: float
    min_lifecycle_ghg_tco2e: float
    feasibility_rate_pct: float
    convergence_curve: List[Dict[str, Any]]


class BenchmarkComparisonResponse(BaseModel):
    benchmark_id: str
    scenario_id: str
    budget_evaluations: int
    algorithms_compared: List[AlgorithmBenchmarkMetric]
    winner_hypervolume: str
    winner_solution_quality: str
    methodology_notes: str
    data_provenance: str = "[SYNTHETIC-SIMULATED: Strict Budget Parity Benchmark]"


class ScenarioSummarySchema(BaseModel):
    scenario_id: str
    name: str
    description: str
    corridors_count: int
    vessels_count: int
    total_demand_teu: float
    default_carbon_tax: float
    routes: List[Dict[str, Any]]
    fleet: List[Dict[str, Any]]
