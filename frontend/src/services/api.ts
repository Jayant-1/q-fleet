import {
  CorridorInfo,
  VesselInfo,
  FuelSpecification,
  OptimizeRunResponse,
  BenchmarkComparisonResponse,
  PredictFuelResponse,
  FuelType,
  MRVPaginatedResponse,
  UNLOCODEPaginatedResponse,
  ValidateCSVResponse,
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
  selected_route_id?: string;
  custom_fleet?: any[];
  algorithm?: string;
  population_size?: number;
  generations?: number;
  carbon_tax_per_ton?: number;
  weather_severity_multiplier?: number;
  fuel_price_multipliers?: Record<string, number>;
  demand_multiplier?: number;
  random_seed?: number;
  target_speed_knots?: number;
  preferred_fuel_type?: string;
  operating_draft_meters?: number;
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

export async function predictMRVAnnual(payload: {
  ship_type: string;
  gross_tonnage: number;
  time_at_sea_hours: number;
  annual_distance_travelled_nm: number;
  avg_speed_knots: number;
  efficiency_val_gco2_per_tnm: number;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/predict/annual-mrv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('MRV annual prediction failed');
  return res.json();
}

export async function fetchMRVVessels(
  query: string = '',
  page: number = 1,
  pageSize: number = 50
): Promise<MRVPaginatedResponse> {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  params.append('page', String(page));
  params.append('page_size', String(pageSize));
  const res = await fetch(`${BASE_URL}/scenarios/mrv-vessels?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load MRV vessels');
  return res.json();
}

export async function fetchUNLOCODEPorts(
  query: string = '',
  country: string = '',
  page: number = 1,
  pageSize: number = 50
): Promise<UNLOCODEPaginatedResponse> {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (country) params.append('country', country);
  params.append('page', String(page));
  params.append('page_size', String(pageSize));
  const res = await fetch(`${BASE_URL}/scenarios/ports/unlocode?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load UN/LOCODE ports');
  return res.json();
}

export async function validateCustomVesselCSV(csvContent: string): Promise<ValidateCSVResponse> {
  const res = await fetch(`${BASE_URL}/scenarios/vessels/validate-csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv_content: csvContent }),
  });
  if (!res.ok) throw new Error('CSV validation failed');
  return res.json();
}

export async function fetchDataProvenanceManifest(): Promise<any> {
  const res = await fetch(`${BASE_URL}/scenarios/provenance`);
  if (!res.ok) throw new Error('Failed to load provenance manifest');
  return res.json();
}

export function getReportHtmlUrl(runId: string, solutionId?: string): string {
  let url = `${BASE_URL}/reports/html/${runId}`;
  if (solutionId) url += `?solution_id=${solutionId}`;
  return url;
}

export function getReportPdfUrl(runId: string, solutionId?: string): string {
  let url = `${BASE_URL}/reports/pdf/${runId}`;
  if (solutionId) url += `?solution_id=${solutionId}`;
  return url;
}

export function getReportJsonUrl(runId: string): string {
  return `${BASE_URL}/reports/json/${runId}`;
}
