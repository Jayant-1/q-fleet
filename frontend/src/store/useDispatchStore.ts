import { useState, useEffect, useRef } from 'react';
import {
  CorridorInfo,
  VesselInfo,
  FuelSpecification,
  OptimizeRunResponse,
  ParetoSolution,
  BenchmarkComparisonResponse,
  FuelType,
} from '../types';
import {
  fetchCorridors,
  fetchFleet,
  fetchFuels,
  runOptimization,
  fetchBenchmarks,
  getReportHtmlUrl,
  getReportPdfUrl,
} from '../services/api';

export interface HydrodynamicCalculation {
  speedKnots: number;
  froudeNumber: number;
  frictionalResistanceKn: number;
  waveMakingResistanceKn: number;
  kwonAddedResistanceKn: number;
  totalResistanceKn: number;
  brakePowerKw: number;
  dailyFuelConsumptionMt: number;
}

// Local first-principles Holtrop-Mennen & Kwon naval approximation for instant (<5ms) slider feedback
export function computeLocalHydrodynamics(
  speedKnots: number,
  draftMeters: number,
  waveHeightMeters: number,
  lbpMeters: number = 366.0,
  beamMeters: number = 48.2,
  cb: number = 0.65
): HydrodynamicCalculation {
  const vMs = speedKnots * 0.514444;
  const g = 9.80665;
  const fn = vMs / Math.sqrt(g * lbpMeters);
  
  // Wetted surface S approx (Mumford-Holtrop)
  const displacement = lbpMeters * beamMeters * draftMeters * cb;
  const s = 1.02 * (1.7 * lbpMeters * draftMeters + (displacement / draftMeters));
  
  // ITTC-1957 friction coefficient
  const nu = 1.188e-6; // seawater kinematic viscosity
  const re = Math.max(1e6, (vMs * lbpMeters) / nu);
  const cf = 0.075 / Math.pow(Math.log10(re) - 2, 2);
  const formFactor = 1 + 0.18; // (1 + k1)
  const rf = 0.5 * 1025 * (vMs * vMs) * s * cf * formFactor / 1000.0; // kN
  
  // Wave-making resistance surge at higher Froude numbers (Holtrop non-linear wave surge)
  const c4 = 0.04;
  const rw = (c4 * 1025 * g * displacement * Math.pow(fn, 4.2)) / 1000.0;
  
  // Kwon (1987) added resistance in irregular head seas
  // Raw = 0.5 * rho * g * H_s^2 * B * C_wave
  const kwonCoeff = Math.min(0.65, 0.08 + 0.03 * waveHeightMeters + 0.15 * Math.pow(fn, 1.5));
  const raw = (0.5 * 1025 * g * Math.pow(waveHeightMeters, 2) * (beamMeters * 0.4) * kwonCoeff) / 1000.0;
  
  const rTotal = Math.max(10.0, rf + rw + raw);
  
  // Quasi-propulsive efficiency eta_D
  const etaD = 0.68;
  const pbKw = Math.max(500, (rTotal * vMs) / etaD);
  
  // Daily fuel consumption based on modern dual-fuel 2-stroke SFOC (~165 g/kWh)
  const sfocGPerKwh = 165.0;
  const dailyFuelMt = (pbKw * 24.0 * sfocGPerKwh) / 1e6;

  return {
    speedKnots,
    froudeNumber: Number(fn.toFixed(3)),
    frictionalResistanceKn: Number(rf.toFixed(1)),
    waveMakingResistanceKn: Number(rw.toFixed(1)),
    kwonAddedResistanceKn: Number(raw.toFixed(1)),
    totalResistanceKn: Number(rTotal.toFixed(1)),
    brakePowerKw: Math.round(pbKw),
    dailyFuelConsumptionMt: Number(dailyFuelMt.toFixed(1)),
  };
}

export function useGlobalDispatchState() {
  const [currentMode, setCurrentMode] = useState<'editorial' | 'cockpit'>('editorial');
  const [corridors, setCorridors] = useState<CorridorInfo[]>([]);
  const [activeCorridorId, setActiveCorridorIdState] = useState<string>('ROUTE_ASIA_EUR');
  const [fleet, setFleetState] = useState<VesselInfo[]>([]);
  const [fuels, setFuels] = useState<FuelSpecification[]>([]);
  const [selectedFuel, setSelectedFuelState] = useState<FuelType>('VLSFO');
  const [selectedVesselId, setSelectedVesselId] = useState<string>('V-001');

  // Operational Simulation Parameters
  const [speedKnots, setSpeedKnotsState] = useState<number>(14.6);
  const [draftMeters, setDraftMetersState] = useState<number>(15.5);
  const [waveHeight, setWaveHeightState] = useState<number>(2.4);
  const [carbonPriceEur, setCarbonPriceEurState] = useState<number>(85);
  const [isOptimizationStale, setIsOptimizationStale] = useState<boolean>(false);

  const setActiveCorridorId = (id: string) => {
    setActiveCorridorIdState(id);
    setIsOptimizationStale(true);
  };
  const setFleet = (f: VesselInfo[]) => {
    setFleetState(f);
    setIsOptimizationStale(true);
  };
  const setSelectedFuel = (f: FuelType) => {
    setSelectedFuelState(f);
    setIsOptimizationStale(true);
  };
  const setSpeedKnots = (v: number) => {
    setSpeedKnotsState(v);
    setIsOptimizationStale(true);
  };
  const setDraftMeters = (v: number) => {
    setDraftMetersState(v);
    setIsOptimizationStale(true);
  };
  const setWaveHeight = (v: number) => {
    setWaveHeightState(v);
    setIsOptimizationStale(true);
  };
  const setCarbonPriceEur = (v: number) => {
    setCarbonPriceEurState(v);
    setIsOptimizationStale(true);
  };

  // Solvers and benchmarks
  const [latestOptimization, setLatestOptimization] = useState<OptimizeRunResponse | null>(null);
  const [selectedParetoSolution, setSelectedParetoSolution] = useState<ParetoSolution | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkComparisonResponse | null>(null);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [solverLatencyMs, setSolverLatencyMs] = useState<number>(38);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState<number>(0);

  // Concurrency and race-condition guards
  const initialRunFiredRef = useRef<boolean>(false);
  const requestSeqRef = useRef<number>(0);

  // Load initial backend data
  useEffect(() => {
    async function init() {
      try {
        const [cList, fList, fuelsList, bench] = await Promise.all([
          fetchCorridors().catch(() => []),
          fetchFleet().catch(() => []),
          fetchFuels().catch(() => []),
          fetchBenchmarks().catch(() => null),
        ]);
        if (cList.length > 0) {
          setCorridors(cList);
          setActiveCorridorIdState(cList[0].route_id);
        }
        if (fList.length > 0) {
          setFleetState(fList);
          setSelectedVesselId(fList[0].vessel_id);
        }
        if (fuelsList.length > 0) {
          setFuels(fuelsList);
        }
        if (bench) {
          setBenchmarkData(bench);
        }
      } catch (err) {
        console.warn('Initial data load warning:', err);
      }
    }
    init();
  }, []);

  // Run optimization for the active scenario
  const executeQuantumSolver = async (algorithm: string = 'MO-QIEA') => {
    setIsSolving(true);
    const currentReqId = ++requestSeqRef.current;
    const start = performance.now();
    try {
      const isCustomFleet = fleet.some(v => v.vessel_id.startsWith('USR_') || v.vessel_id.startsWith('CUSTOM_'));
      const continuousWeather = Number((1.0 + Math.max(0, (waveHeight - 1.5) * 0.15)).toFixed(2));
      const res = await runOptimization({
        scenario_id: 'global_liner_2026',
        selected_route_id: activeCorridorId,
        algorithm,
        population_size: 24,
        generations: 30,
        carbon_tax_per_ton: carbonPriceEur,
        weather_severity_multiplier: continuousWeather,
        custom_fleet: isCustomFleet ? fleet : undefined,
        target_speed_knots: speedKnots,
        preferred_fuel_type: selectedFuel,
        operating_draft_meters: draftMeters,
      });

      // Discard response if a newer optimization run was dispatched
      if (currentReqId !== requestSeqRef.current) {
        return;
      }

      setLatestOptimization(res);
      setIsOptimizationStale(false);
      const latency = Math.round(performance.now() - start);
      setSolverLatencyMs(latency);

      // Select compromise/knee solution
      if (res.pareto_front && res.pareto_front.length > 0) {
        const knee =
          res.pareto_front.find((s) => s.solution_id === res.compromise_solution_id) ||
          res.pareto_front[0];
        setSelectedParetoSolution(knee);
      }
    } catch (err) {
      console.warn('Quantum optimization execution error:', err);
    } finally {
      if (currentReqId === requestSeqRef.current) {
        setIsSolving(false);
      }
    }
  };

  // Run once on initial load when corridors/data have resolved
  useEffect(() => {
    if (!initialRunFiredRef.current && corridors.length > 0 && activeCorridorId) {
      initialRunFiredRef.current = true;
      executeQuantumSolver();
    }
  }, [corridors, activeCorridorId]);

  // Active corridor helper
  const activeCorridor =
    corridors.find((c) => c.route_id === activeCorridorId) || corridors[0] || null;

  // Active vessel helper
  const activeVessel = fleet.find((v) => v.vessel_id === selectedVesselId) || fleet[0] || null;

  // Live hydrodynamics
  const hydrodynamics = computeLocalHydrodynamics(
    speedKnots,
    draftMeters,
    waveHeight,
    activeVessel?.length_overall_meters || 366.0,
    activeVessel?.beam_meters || 48.2,
    0.65
  );

  // Export PDF dispatch report
  const triggerPdfExport = () => {
    if (isOptimizationStale) {
      alert("Current simulation levers have changed. Please re-run optimization to export an up-to-date audit PDF.");
      return;
    }
    if (latestOptimization) {
      const url = getReportPdfUrl(
        latestOptimization.run_id,
        selectedParetoSolution?.solution_id
      );
      window.open(url, '_blank');
    } else {
      window.print();
    }
  };

  return {
    currentMode,
    setCurrentMode,
    corridors,
    activeCorridorId,
    setActiveCorridorId,
    activeCorridor,
    fleet,
    setFleet,
    selectedVesselId,
    setSelectedVesselId,
    activeVessel,
    fuels,
    selectedFuel,
    setSelectedFuel,
    speedKnots,
    setSpeedKnots,
    draftMeters,
    setDraftMeters,
    waveHeight,
    setWaveHeight,
    carbonPriceEur,
    setCarbonPriceEur,
    hydrodynamics,
    latestOptimization,
    selectedParetoSolution,
    setSelectedParetoSolution,
    benchmarkData,
    isSolving,
    isOptimizationStale,
    solverLatencyMs,
    activeWaypointIndex,
    setActiveWaypointIndex,
    executeQuantumSolver,
    triggerPdfExport,
  };
}
