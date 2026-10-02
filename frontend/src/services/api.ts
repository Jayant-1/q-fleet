import {
  CorridorInfo,
  VesselInfo,
  FuelSpecification,
  OptimizeRunResponse,
  BenchmarkComparisonResponse,
  PredictFuelResponse,
  FuelType
} from '../types';

const BASE_URL = '/api';

export async function fetchHealth(): Promise<{ status: string; engines: any }> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function fetchCorridors(): Promise<CorridorInfo[]> {
  const res = await fetch(`${BASE_URL}/scenarios/corridors/list`);
  if (!res.ok) throw new Error('Failed to load corridors');
  return res.json();
}

export async function fetchFleet(): Promise<VesselInfo[]> {
  const res = await fetch(`${BASE_URL}/scenarios/fleet/list`);
  if (!res.ok) throw new Error('Failed to load fleet');
  return res.json();
}

export async function fetchFuels(): Promise<FuelSpecification[]> {
  const res = await fetch(`${BASE_URL}/scenarios/fuels/registry`);
  if (!res.ok) throw new Error('Failed to load fuel registry');
  return res.json();
}

export async function runOptimization(payload: {
  scenario_id?: string;
  algorithm?: string;
  population_size?: number;
  generations?: number;
  carbon_tax_per_ton?: number;
  weather_severity_multiplier?: number;
  fuel_price_multipliers?: Record<string, number>;
  demand_multiplier?: number;
  random_seed?: number;
}): Promise<OptimizeRunResponse> {
  const res = await fetch(`${BASE_URL}/optimize/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Optimization request failed' }));
    throw new Error(err.detail || 'Optimization failed');
  }
  return res.json();
}

export async function fetchBenchmarks(payload?: {
  population_size?: number;
  generations?: number;
  carbon_tax_per_ton?: number;
  random_seed?: number;
}): Promise<BenchmarkComparisonResponse> {
  if (payload) {
    const res = await fetch(`${BASE_URL}/benchmarks/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Benchmark run failed');
    return res.json();
  }
  const res = await fetch(`${BASE_URL}/benchmarks/latest`);
  if (!res.ok) throw new Error('Failed to load latest benchmark');
  return res.json();
}

export async function predictFuelConsumption(payload: {
  vessel_type: string;
  dwt: number;
  speed_knots: number;
  cargo_load_ratio: number;
  draft_meters: number;
  wind_speed_knots: number;
  wave_height_meters: number;
  current_knots: number;
  fuel_type: FuelType;
  use_quantum_feature_selector?: boolean;
}): Promise<PredictFuelResponse> {
  const res = await fetch(`${BASE_URL}/predict/fuel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Fuel prediction failed');
  return res.json();
}

export function getReportHtmlUrl(runId: string, solutionId?: string): string {
  let url = `${BASE_URL}/reports/html/${runId}`;
  if (solutionId) url += `?solution_id=${solutionId}`;
  return url;
}

export function getReportJsonUrl(runId: string): string {
  return `${BASE_URL}/reports/json/${runId}`;
}
