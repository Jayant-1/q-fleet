export type FuelType =
  | "VLSFO"
  | "MGO"
  | "LNG"
  | "BIO_METHANOL"
  | "GREEN_H2"
  | "GREEN_NH3"
  | "SHORE_POWER";

export interface FuelSpecification {
  code: FuelType;
  display_name: string;
  lhv_mj_per_kg: number;
  density_kg_per_m3: number;
  wtt_factor_gco2e_per_mj: number;
  ttw_factor_gco2_per_g: number;
  total_wtw_gco2e_per_mj: number;
  default_cost_usd_per_mt: number;
  carbon_content_mass_fraction: number;
  regulatory_source: string;
  description: string;
  is_cryogenic: boolean;
  requires_specialized_bunkering: boolean;
}

export interface PortInfo {
  port_id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  has_cold_ironing: boolean;
  grid_ci: number;
}

export interface CorridorInfo {
  route_id: string;
  name: string;
  origin_port: PortInfo;
  destination_port: PortInfo;
  distance_nm: number;
  cargo_demand: number;
  max_transit_time_days: number;
  port_turnaround_days: number;
  is_eca_corridor: boolean;
  weather_severity_index: number;
  coordinates: [number, number][];
}

export interface VesselInfo {
  vessel_id: string;
  name: string;
  vessel_type: string;
  dwt: number;
  capacity_teu_or_dwt: number;
  design_speed_knots: number;
  min_speed_knots: number;
  max_speed_knots: number;
  design_draft_meters: number;
  beam_meters: number;
  length_overall_meters: number;
  main_engine_mcr_kw: number;
  berth_aux_power_kw: number;
  compatible_fuels: FuelType[];
  has_shore_power_connection: boolean;
  daily_capital_cost_usd: number;
  cii_rating_baseline: string;
}

export interface VesselAllocationItem {
  vessel_id: string;
  vessel_name: string;
  vessel_type: string;
  route_id: string;
  route_name: string;
  speed_knots: number;
  fuel_type: FuelType;
  shore_power_used: boolean;
  round_trips: number;
  fuel_consumed_sea_mt: number;
  fuel_consumed_berth_mt: number;
  total_fuel_mt: number;
  operational_cost_usd: number;
  lifecycle_ghg_tco2e: number;
  transit_time_days: number;
  cargo_carried: number;
  is_feasible: boolean;
  violation_reasons: string[];
}

export interface ParetoSolution {
  solution_id: string;
  algorithm: string;
  total_fuel_mt: number;
  total_cost_usd: number;
  total_lifecycle_ghg_tco2e: number;
  total_cargo_delivered: number;
  demand_satisfaction_pct: number;
  schedule_reliability_pct: number;
  is_feasible: boolean;
  pareto_rank: number;
  crowding_distance: number;
  allocations: VesselAllocationItem[];
}

export interface GenerationConvergenceItem {
  generation: number;
  best_fuel_mt: number;
  best_cost_usd: number;
  best_ghg_tco2e: number;
  hypervolume: number;
  population_diversity: number;
}

export interface OptimizeRunResponse {
  run_id: string;
  scenario_id: string;
  algorithm: string;
  population_size: number;
  generations: number;
  total_evaluations: number;
  execution_time_seconds: number;
  pareto_solutions_count: number;
  pareto_front: ParetoSolution[];
  convergence_history: GenerationConvergenceItem[];
  compromise_solution_id: string;
  random_seed: number;
  timestamp: string;
}

export interface AlgorithmBenchmarkMetric {
  algorithm: string;
  total_evaluations: number;
  execution_time_seconds: number;
  pareto_front_size: number;
  hypervolume: number;
  spacing_spread: number;
  min_fuel_mt: number;
  min_cost_usd: number;
  min_lifecycle_ghg_tco2e: number;
  feasibility_rate_pct: number;
  convergence_curve: {
    generation: number;
    best_fuel_mt: number;
    best_cost_usd: number;
    best_ghg_tco2e: number;
    hypervolume: number;
  }[];
}

export interface BenchmarkComparisonResponse {
  benchmark_id: string;
  scenario_id: string;
  budget_evaluations: number;
  algorithms_compared: AlgorithmBenchmarkMetric[];
  winner_hypervolume: string;
  winner_solution_quality: string;
  methodology_notes: string;
  data_provenance: string;
}

export interface PredictFuelResponse {
  predicted_fuel_mt_per_day: number;
  specific_fuel_oil_consumption_g_per_kwh: number;
  estimated_shaft_power_kw: number;
  calm_water_power_kw: number;
  added_weather_resistance_kw: number;
  fuel_type: FuelType;
  lhv_adjusted_daily_mt: number;
  feature_importance_mask: number[];
  feature_names_used: string[];
  model_version: string;
  inference_latency_ms: number;
  is_synthetic_model: boolean;
  data_provenance_label: string;
}
