import React, { useState, useMemo } from 'react';
import {
  Compass,
  Layers,
  Activity,
  Cpu,
  Flame,
  FileText,
  Sliders,
  Zap,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Anchor,
  Wind,
  Waves,
  Gauge,
  Terminal,
  ExternalLink,
  Lock,
  Scale,
  RefreshCw,
  Play,
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';
import { TabKey } from './HeaderNav';

interface LandingPageProps {
  onLaunchConsole: (tab?: TabKey) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchConsole }) => {
  // --------------------------------------------------------------------------
  // Interactive Demo 1: Voyage Dispatcher State
  // --------------------------------------------------------------------------
  const vesselProfiles = [
    {
      id: 'ultra_large',
      name: 'Oceanic Apex',
      type: 'Ultra Large Container',
      capacity: '24,000 TEU',
      dwt: 220000,
      mcrKw: 65000,
      designSpeed: 19.5,
      designDraft: 16.0,
      beam: 61.5,
      length: 400.0,
      dailyCharter: 48000,
    },
    {
      id: 'post_panamax',
      name: 'Titan Horizon',
      type: 'Post-Panamax Container',
      capacity: '14,000 TEU',
      dwt: 140000,
      mcrKw: 42000,
      designSpeed: 18.5,
      designDraft: 14.5,
      beam: 51.2,
      length: 366.0,
      dailyCharter: 35000,
    },
    {
      id: 'feeder',
      name: 'Nordic Voyager',
      type: 'Feeder Container',
      capacity: '2,500 TEU',
      dwt: 34000,
      mcrKw: 14000,
      designSpeed: 16.0,
      designDraft: 9.5,
      beam: 29.8,
      length: 195.0,
      dailyCharter: 14000,
    },
    {
      id: 'capesize',
      name: 'Mineral Titan',
      type: 'Capesize Bulk Carrier',
      capacity: '180,000 DWT',
      dwt: 180000,
      mcrKw: 18000,
      designSpeed: 14.5,
      designDraft: 18.2,
      beam: 45.0,
      length: 292.0,
      dailyCharter: 22000,
    },
    {
      id: 'vlcc',
      name: 'Poseidon Monarch',
      type: 'VLCC Crude Tanker',
      capacity: '300,000 DWT',
      dwt: 300000,
      mcrKw: 28000,
      designSpeed: 15.0,
      designDraft: 22.0,
      beam: 60.0,
      length: 333.0,
      dailyCharter: 38000,
    },
  ];

  const corridorProfiles = [
    {
      id: 'asia_europe',
      name: 'Asia-Europe Express',
      origin: 'Shanghai (CNSHG)',
      dest: 'Rotterdam (NLRTM)',
      distanceNm: 10500,
      dwellDays: 2.5,
      isEca: true,
      maxDays: 28.5,
    },
    {
      id: 'transpacific',
      name: 'Transpacific Pioneer',
      origin: 'Los Angeles (USLAX)',
      dest: 'Tokyo (JPTYO)',
      distanceNm: 5400,
      dwellDays: 2.0,
      isEca: true,
      maxDays: 17.5,
    },
    {
      id: 'intra_europe',
      name: 'Intra-Europe Feeder ECA',
      origin: 'Rotterdam (NLRTM)',
      dest: 'Gdansk (PLGDN)',
      distanceNm: 850,
      dwellDays: 1.0,
      isEca: true,
      maxDays: 3.8,
    },
    {
      id: 'transatlantic',
      name: 'Transatlantic Loop',
      origin: 'New York (USNYC)',
      dest: 'Antwerp (BEANR)',
      distanceNm: 3400,
      dwellDays: 1.5,
      isEca: true,
      maxDays: 11.0,
    },
    {
      id: 'indian_ocean',
      name: 'Indian Ocean Arc',
      origin: 'Singapore (SGSIN)',
      dest: 'Mumbai (INBOM)',
      distanceNm: 2450,
      dwellDays: 1.5,
      isEca: false,
      maxDays: 9.5,
    },
  ];

  const fuelProfiles: Record<string, { name: string; costPerMt: number; lhvMjKg: number; wttGco2eMj: number; ttwGco2eG: number; description: string }> = {
    VLSFO: {
      name: 'Very Low Sulfur Fuel Oil (0.50% S)',
      costPerMt: 620,
      lhvMjKg: 40.5,
      wttGco2eMj: 14.5,
      ttwGco2eG: 3.151,
      description: 'Fossil baseline with high lifecycle GHG footprint.',
    },
    MGO: {
      name: 'Marine Gas Oil (0.10% S)',
      costPerMt: 840,
      lhvMjKg: 42.7,
      wttGco2eMj: 15.0,
      ttwGco2eG: 3.206,
      description: 'Low-sulfur distillate mandatory in emission control zones.',
    },
    LNG: {
      name: 'Liquefied Natural Gas (Methane)',
      costPerMt: 710,
      lhvMjKg: 49.1,
      wttGco2eMj: 18.5,
      ttwGco2eG: 2.750,
      description: 'Cryogenic fossil fuel reducing SOx/NOx with moderate methane slip.',
    },
    BIO_METHANOL: {
      name: 'Biogenic e-Methanol',
      costPerMt: 1150,
      lhvMjKg: 19.9,
      wttGco2eMj: 12.0,
      ttwGco2eG: 1.375,
      description: 'Renewable biofuel drastically reducing Well-to-Wake GHG emissions.',
    },
    GREEN_NH3: {
      name: 'Green e-Ammonia',
      costPerMt: 1380,
      lhvMjKg: 18.6,
      wttGco2eMj: 8.5,
      ttwGco2eG: 0.0,
      description: 'Zero Tank-to-Wake carbon; requires toxic bunkering protocols.',
    },
  };

  const [selectedVessel, setSelectedVessel] = useState(vesselProfiles[0]);
  const [selectedCorridor, setSelectedCorridor] = useState(corridorProfiles[0]);
  const [speedKnots, setSpeedKnots] = useState(17.5);
  const [waveHeightMeters, setWaveHeightMeters] = useState(2.0);
  const [selectedFuelKey, setSelectedFuelKey] = useState('VLSFO');
  const [shorePowerEnabled, setShorePowerEnabled] = useState(true);

  // Live Naval Hydrodynamics Simulation
  const liveDispatchResult = useMemo(() => {
    const fuel = fuelProfiles[selectedFuelKey];
    const v_ms = speedKnots * 0.514444;

    // Calm water resistance (Holtrop-Mennen approximation)
    const displacement = selectedVessel.dwt * 0.85;
    const wettedSurface = 1.025 * Math.sqrt(displacement * selectedVessel.length);
    const cf = 0.075 / Math.pow(Math.log10((v_ms * selectedVessel.length) / 1.19e-6) - 2, 2);
    const ct = cf * 1.25;
    const rCalmKn = 0.5 * 1025.0 * Math.pow(v_ms, 2) * wettedSurface * ct / 1000.0;

    // Kwon wave resistance
    const rWaveKn = (1.0 / 16.0) * 1025.0 * 9.81 * Math.pow(waveHeightMeters, 2) * Math.pow(selectedVessel.beam, 2) / selectedVessel.length / 1000.0 * 0.25;

    // Total Propulsion Power
    const totalResistanceKn = rCalmKn + rWaveKn;
    const rawPowerKw = (totalResistanceKn * v_ms) / (0.68 * 0.98);
    const brakePowerKw = Math.min(selectedVessel.mcrKw * 0.95, Math.max(2000, rawPowerKw));

    // SFOC and Daily Burn Rate
    const mcrRatio = brakePowerKw / selectedVessel.mcrKw;
    const sfocBaseline = 175.0 + 40.0 * Math.pow(mcrRatio - 0.75, 2);
    const sfocEnergyAdjusted = sfocBaseline * (40.5 / fuel.lhvMjKg);
    const dailyFuelBurnMt = (brakePowerKw * sfocEnergyAdjusted * 24.0) / 1000000.0;

    // Voyage Durations
    const seaHours = selectedCorridor.distanceNm / speedKnots;
    const seaDays = seaHours / 24.0;
    const totalVoyageDays = seaDays + selectedCorridor.dwellDays;

    // Voyage Fuel & Financials
    const voyageSeaFuelMt = dailyFuelBurnMt * seaDays;
    const portDailyBurnMt = 3.5;
    const portFuelMt = shorePowerEnabled ? 0.0 : portDailyBurnMt * selectedCorridor.dwellDays;
    const totalVoyageFuelMt = voyageSeaFuelMt + portFuelMt;
    const bunkeringCostUsd = totalVoyageFuelMt * fuel.costPerMt;
    const charterCostUsd = totalVoyageDays * selectedVessel.dailyCharter;
    const shorePowerElectricityUsd = shorePowerEnabled ? (selectedCorridor.dwellDays * 24.0 * 1200 * 0.16) : 0.0;
    const totalVoyageCostUsd = bunkeringCostUsd + charterCostUsd + shorePowerElectricityUsd;

    // Well-to-Wake Lifecycle GHG
    const fuelMassGrams = totalVoyageFuelMt * 1e6;
    const fuelEnergyMj = (fuelMassGrams / 1000.0) * fuel.lhvMjKg;
    const wttGhgTonnes = (fuelEnergyMj * fuel.wttGco2eMj) / 1e6;
    const ttwGhgTonnes = (fuelMassGrams * fuel.ttwGco2eG) / 1e6;
    const shorePowerGhgTonnes = shorePowerEnabled ? (selectedCorridor.dwellDays * 24.0 * 1.2 * 0.28) : 0.0;
    const totalWtwGhgTonnes = wttGhgTonnes + ttwGhgTonnes + shorePowerGhgTonnes;

    // Schedule Reliability Check
    const isScheduleFeasible = totalVoyageDays <= selectedCorridor.maxDays;

    return {
      rCalmKn: rCalmKn.toFixed(1),
      rWaveKn: rWaveKn.toFixed(1),
      brakePowerKw: Math.round(brakePowerKw).toLocaleString(),
      mcrPercent: (mcrRatio * 100).toFixed(1),
      dailyFuelBurnMt: dailyFuelBurnMt.toFixed(1),
      seaDays: seaDays.toFixed(1),
      totalVoyageDays: totalVoyageDays.toFixed(1),
      totalVoyageFuelMt: Math.round(totalVoyageFuelMt).toLocaleString(),
      totalVoyageCostUsd: Math.round(totalVoyageCostUsd).toLocaleString(),
      totalWtwGhgTonnes: Math.round(totalWtwGhgTonnes).toLocaleString(),
      wttGhgTonnes: Math.round(wttGhgTonnes).toLocaleString(),
      ttwGhgTonnes: Math.round(ttwGhgTonnes).toLocaleString(),
      isScheduleFeasible,
      scheduleMarginDays: (selectedCorridor.maxDays - totalVoyageDays).toFixed(1),
    };
  }, [selectedVessel, selectedCorridor, speedKnots, waveHeightMeters, selectedFuelKey, shorePowerEnabled]);

  // --------------------------------------------------------------------------
  // Interactive Demo 2: Quantum Feature Mask Matrix
  // --------------------------------------------------------------------------
  const allFeatures = [
    { name: 'speed_knots', qBitState: '|1⟩', prob: 0.98, selected: true, reason: 'Cubic power driver (P ∝ V³)' },
    { name: 'dwt', qBitState: '|1⟩', prob: 0.95, selected: true, reason: 'Wetted hull displacement scaling' },
    { name: 'cargo_load_ratio', qBitState: '|1⟩', prob: 0.92, selected: true, reason: 'Direct draft & block coefficient' },
    { name: 'draft_meters', qBitState: '|0⟩', prob: 0.12, selected: false, reason: 'Collinear with load ratio; pruned' },
    { name: 'wind_speed_knots', qBitState: '|1⟩', prob: 0.89, selected: true, reason: 'Aerodynamic superstructure drag' },
    { name: 'wave_height_meters', qBitState: '|0⟩', prob: 0.28, selected: false, reason: 'Partially absorbed in current vector' },
    { name: 'current_knots', qBitState: '|1⟩', prob: 0.86, selected: true, reason: 'Effective ground speed vector' },
    { name: 'vessel_type_encoded', qBitState: '|0⟩', prob: 0.18, selected: false, reason: 'Redundant with DWT/beam metrics' },
    { name: 'hull_fouling_factor', qBitState: '|0⟩', prob: 0.31, selected: false, reason: 'Slow-drift quarterly variable' },
    { name: 'sea_water_temp_c', qBitState: '|0⟩', prob: 0.08, selected: false, reason: 'Sub-1% kinematic viscosity shift' },
    { name: 'water_depth_meters', qBitState: '|0⟩', prob: 0.05, selected: false, reason: 'Deep-sea open liner routes' },
    { name: 'engine_mcr_ratio', qBitState: '|0⟩', prob: 0.22, selected: false, reason: 'Dependent output variable' },
  ];

  const [featureSelectionMode, setFeatureSelectionMode] = useState<'qiea' | 'full'>('qiea');

  // --------------------------------------------------------------------------
  // Interactive Demo 3: Strategic Pareto Frontier Trade-Off
  // --------------------------------------------------------------------------
  const paretoPlans = [
    {
      id: 'plan_speed',
      title: 'Plan Alpha: Speed & Reliability',
      badge: 'HIGH SPEED',
      badgeColor: 'border-telemetry-amber/50 text-telemetry-amber bg-telemetry-amber/10',
      speed: '20.2 kt',
      costMillion: 20.8,
      ghgKt: 42.5,
      fuelMt: 12450,
      description: 'Prioritizes tight supply chain ETA delivery. High power demand and elevated bunker burn.',
      fleetFuelType: 'MGO / VLSFO Dual',
      color: '#f59e0b',
    },
    {
      id: 'plan_knee',
      title: 'Plan Knee: Golden Compromise',
      badge: 'RECOMMENDED (QIEA)',
      badgeColor: 'border-telemetry-cyan/50 text-telemetry-cyan bg-telemetry-cyan/10 glow-cyan',
      speed: '17.2 kt',
      costMillion: 16.7,
      ghgKt: 34.6,
      fuelMt: 9593,
      description: 'Calculated mathematical knee point. Optimal marginal abatement cost with 100% demand fulfillment.',
      fleetFuelType: 'VLSFO + Bio-MeOH + Shore Power',
      color: '#00e5ff',
      isKnee: true,
    },
    {
      id: 'plan_green',
      title: 'Plan Gamma: Zero-Carbon Transition',
      badge: 'DECARBONIZATION',
      badgeColor: 'border-telemetry-seafoam/50 text-telemetry-seafoam bg-telemetry-seafoam/10',
      speed: '15.8 kt',
      costMillion: 21.2,
      ghgKt: 28.1,
      fuelMt: 8850,
      description: 'Maximum FuelEU Maritime compliance through aggressive bio-methanol adoption and electrified berths.',
      fleetFuelType: 'Bio-Methanol + Green Ammonia',
      color: '#10b981',
    },
    {
      id: 'plan_cost',
      title: 'Plan Delta: Minimum Capex',
      badge: 'MIN OPEX',
      badgeColor: 'border-slate-500 text-slate-300 bg-slate-800/40',
      speed: '15.1 kt',
      costMillion: 14.2,
      ghgKt: 46.8,
      fuelMt: 8620,
      description: 'Lowest upfront fuel expenditure using heavy fossil bunkering; incurs heavy future carbon tax penalties.',
      fleetFuelType: '100% VLSFO Baseline',
      color: '#94a3b8',
    },
  ];

  const [activeParetoPlanId, setActiveParetoPlanId] = useState('plan_knee');
  const activePlan = paretoPlans.find(p => p.id === activeParetoPlanId) || paretoPlans[1];

  // --------------------------------------------------------------------------
  // Interactive Demo 4: Carbon Tax Policy Sandbox
  // --------------------------------------------------------------------------
  const [carbonTaxRate, setCarbonTaxRate] = useState(120);

  const policyComparison = useMemo(() => {
    // VLSFO baseline: high carbon emissions
    const baselineGhg = 46800; // tCO2e
    const baselineBunkerCost = 14200000;
    const baselineCarbonTax = baselineGhg * carbonTaxRate;
    const baselineTotal = baselineBunkerCost + baselineCarbonTax;

    // Green QIEA Plan: low carbon emissions
    const greenGhg = 34600; // tCO2e
    const greenBunkerCost = 16700000;
    const greenCarbonTax = greenGhg * carbonTaxRate;
    const greenTotal = greenBunkerCost + greenCarbonTax;

    const netSavings = baselineTotal - greenTotal;
    const isGreenCheaper = netSavings > 0;

    return {
      baselineTotal: (baselineTotal / 1e6).toFixed(2),
      greenTotal: (greenTotal / 1e6).toFixed(2),
      taxPenaltyAvoided: ((baselineCarbonTax - greenCarbonTax) / 1e6).toFixed(2),
      netSavings: (Math.abs(netSavings) / 1e6).toFixed(2),
      isGreenCheaper,
      crossoverTaxRate: 165,
    };
  }, [carbonTaxRate]);

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 selection:bg-telemetry-cyan selection:text-black">
      {/* =====================================================================
          ACT I — THE CINEMATIC OPENING & MARITIME MANDATE
      ===================================================================== */}
      <section className="relative min-h-[92vh] flex flex-col justify-between pt-16 pb-20 px-4 sm:px-6 lg:px-12 border-b border-oceanic-border overflow-hidden">
        {/* Subtle Ambient Radar Grid & Bathymetric Glow */}
        <div className="absolute inset-0 bg-radar-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-telemetry-cyan/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[300px] bg-telemetry-violet/5 blur-[140px] rounded-full pointer-events-none" />

        {/* Cinematic Header Coordinate Readout */}
        <div className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between text-xs font-mono text-slate-400 tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-telemetry-cyan animate-pulse" />
            <span>GLOBAL MARITIME OPTIMIZATION PLATFORM // SIH26138</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-500">
            <span>LAT 01°17'N LON 103°50'E</span>
            <span>•</span>
            <span>IMO MEPC.376(80) & FUELEU COMPLIANT</span>
          </div>
        </div>

        {/* Hero Title Composition */}
        <div className="relative z-10 max-w-7xl mx-auto w-full my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-telemetry-cyan/30 bg-telemetry-cyan/5 text-telemetry-cyan text-xs font-mono uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Smart India Hackathon 2024 • Problem Statement 2</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.08] mb-8">
            Quantum-Inspired Green Fleet Optimization & Fuel Intelligence.
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl leading-relaxed font-sans mb-10">
            Fusing Holtrop-Mennen naval hydrodynamics, quantum Givens rotation feature selection, and multi-objective Pareto metaheuristics to decarbonize container shipping across global corridors.
          </p>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onLaunchConsole('operations')}
              className="px-8 py-4 rounded-xl bg-telemetry-cyan text-black font-bold text-sm tracking-wide flex items-center gap-3 hover:bg-cyan-300 transition-all glow-cyan"
            >
              <span>LAUNCH OPERATIONS CONSOLE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#interactive-dispatcher"
              className="px-7 py-4 rounded-xl border border-oceanic-border hover:border-slate-400 text-slate-200 font-semibold text-sm tracking-wide bg-oceanic-hull/60 hover:bg-oceanic-hull transition-all flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-telemetry-cyan" />
              <span>TEST LIVE DISPATCHER</span>
            </a>

            <button
              onClick={() => onLaunchConsole('reports')}
              className="px-6 py-4 rounded-xl border border-oceanic-border/70 hover:border-slate-400 text-slate-400 hover:text-slate-200 text-sm font-mono tracking-tight flex items-center gap-2 transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-telemetry-seafoam" />
              <span>SHA-256 AUDIT LEDGER</span>
            </button>
          </div>
        </div>

        {/* Live Operational Metrics Horizon Strip */}
        <div className="relative z-10 max-w-7xl mx-auto w-full pt-8 border-t border-oceanic-border/70 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-1">
              Global Shipping Carbon
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              1,076M <span className="text-xs font-sans text-slate-400 font-normal">tCO₂ / yr</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">3% of total worldwide GHG emissions</div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-1">
              WTW Decarbonization
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-telemetry-seafoam font-mono tracking-tight tabular-nums">
              -26.1% <span className="text-xs font-sans text-slate-400 font-normal">abatement</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Achieved via Multi-Objective QIEA</div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-1">
              Quantum Feature Pruning
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-telemetry-cyan font-mono tracking-tight tabular-nums">
              5 <span className="text-xs font-sans text-slate-400 font-normal">of 12 features</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Preserves R² = 0.9752 at 0.003ms latency</div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-1">
              Schedule Reliability
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              100.0% <span className="text-xs font-sans text-telemetry-seafoam font-normal">feasible</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Zero cargo shortfall or deadline slips</div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT II — THE REGULATORY SQUEEZE & COMBINATORIAL CLIFF
      ===================================================================== */}
      <section className="py-28 px-4 sm:px-6 lg:px-12 border-b border-oceanic-border bg-[#09101e]/60">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <div className="text-xs font-mono uppercase text-telemetry-amber tracking-widest mb-3">
              ACT II • THE DECARBONIZATION CLIFF
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              A $40 Billion Regulatory Squeeze.
            </h2>
            <p className="text-slate-300 mt-4 text-base sm:text-lg leading-relaxed font-sans">
              Global maritime shipping cannot simply "switch off" fossil fuel without breaking world trade. The transition requires mathematical precision to avoid catastrophic compliance fines.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Regulatory Squeeze Panel */}
            <div className="p-8 rounded-2xl bg-oceanic-hull/60 border border-oceanic-border flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-telemetry-amber/10 border border-telemetry-amber/30 flex items-center justify-center text-telemetry-amber mb-6">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">FuelEU Maritime Mandates</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Regulation (EU) 2023/1805 enforces progressive Well-to-Wake GHG intensity reductions (-2% in 2025, -6% in 2030, -80% by 2050). Non-compliant voyages incur punitive penalties of €2,400 per ton of VLSFO energy deficit.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-oceanic-border/70 text-xs font-mono text-telemetry-amber">
                ENFORCEMENT ACTIVE • 2025/2026 CYCLE
              </div>
            </div>

            {/* The Combinatorial Complexity */}
            <div className="p-8 rounded-2xl bg-oceanic-hull/60 border border-oceanic-border flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-telemetry-violet/10 border border-telemetry-violet/30 flex items-center justify-center text-telemetry-violet mb-6">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">The NP-Hard Fleet Dilemma</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Allocating 15 to 100 containerships across 5 global liner corridors with variable speeds (12–22 kt), 7 fuel choices, port dwell times, and shore power connections generates over <span className="text-telemetry-violet font-mono font-bold">10²⁷ discrete combinations</span>. Classical brute-force search fails.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-oceanic-border/70 text-xs font-mono text-telemetry-violet">
                NON-LINEAR COMBINATORIAL SEARCH
              </div>
            </div>

            {/* The Physics Reality */}
            <div className="p-8 rounded-2xl bg-oceanic-hull/60 border border-oceanic-border flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-telemetry-cyan/10 border border-telemetry-cyan/30 flex items-center justify-center text-telemetry-cyan mb-6">
                  <Waves className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Cubic Hydrodynamics Law</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Propulsion brake power scales cubically with vessel velocity: <span className="font-mono text-telemetry-cyan">P ∝ V³</span>. Dropping from 20 knots to 16 knots slashes daily fuel by nearly 48%, but risks missing strict contractual cargo delivery deadlines and terminal berth windows.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-oceanic-border/70 text-xs font-mono text-telemetry-cyan">
                HOLTROP-MENNEN + KWON RESISTANCE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT III — THE QUANTUM-INSPIRED ENGINE (DATA AS ART)
      ===================================================================== */}
      <section className="py-28 px-4 sm:px-6 lg:px-12 border-b border-oceanic-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-7">
              <div className="text-xs font-mono uppercase text-telemetry-cyan tracking-widest mb-3">
                ACT III • DEEP-TECH ARCHITECTURE
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Quantum-Inspired Evolutionary Algorithms (QIEA).
              </h2>
              <p className="text-slate-300 mt-4 text-base sm:text-lg leading-relaxed font-sans">
                Borrowing quantum mechanical principles—probability superposition, Givens rotation gates, and catastrophe phase dispersion—to navigate multimodal Pareto surfaces without premature genetic collapse.
              </p>
            </div>

            <div className="lg:col-span-5 flex justify-end">
              <div className="p-6 rounded-2xl bg-oceanic-hull/70 border border-oceanic-border w-full max-w-md">
                <div className="text-xs font-mono text-slate-400 mb-2">GIVENS ROTATION OPERATOR</div>
                <div className="p-4 rounded-xl bg-oceanic-void font-mono text-sm text-telemetry-cyan border border-oceanic-border/80">
                  U(Δθ) = [ cos(Δθ) &nbsp;-sin(Δθ) ]<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ sin(Δθ) &nbsp;&nbsp;cos(Δθ) ]
                </div>
                <div className="text-xs text-slate-400 mt-3">
                  Rotates state vectors toward the non-dominated Pareto archive with catastrophe mutation when population diversity &lt; 0.005.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Quantum Feature Selector Playground */}
          <div className="p-8 rounded-3xl bg-oceanic-hull/40 border border-oceanic-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-telemetry-cyan" />
                  <span>Quantum Feature Pruning Simulator (QIEA-FS)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  12 candidate sensor features pared to the 5 critical hydrodynamic drivers.
                </p>
              </div>

              <div className="flex items-center gap-2 p-1 rounded-xl bg-oceanic-void border border-oceanic-border text-xs font-mono">
                <button
                  onClick={() => setFeatureSelectionMode('qiea')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    featureSelectionMode === 'qiea'
                      ? 'bg-telemetry-cyan text-black font-bold glow-cyan'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  QIEA-FS (Proposed • 5 Features)
                </button>
                <button
                  onClick={() => setFeatureSelectionMode('full')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    featureSelectionMode === 'full'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Classical Full (All 12 Features)
                </button>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allFeatures.map((feat, idx) => {
                const isActive = featureSelectionMode === 'full' || feat.selected;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-oceanic-panel/80 border-telemetry-cyan/40 shadow-sm'
                        : 'bg-oceanic-void/40 border-oceanic-border/50 opacity-40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className={isActive ? 'text-white font-bold' : 'text-slate-500'}>
                        {feat.name}
                      </span>
                      <span className={isActive ? 'text-telemetry-cyan' : 'text-slate-600'}>
                        {feat.qBitState}
                      </span>
                    </div>
                    <div className="w-full bg-oceanic-void h-1.5 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isActive ? 'bg-telemetry-cyan' : 'bg-slate-700'
                        }`}
                        style={{ width: `${feat.prob * 100}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      {feat.reason}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Performance Benchmark Callout */}
            <div className="mt-8 p-6 rounded-2xl bg-oceanic-void border border-oceanic-border/80 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-telemetry-seafoam/10 border border-telemetry-seafoam/30 flex items-center justify-center text-telemetry-seafoam">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {featureSelectionMode === 'qiea'
                      ? 'Quantum-Inspired QIEA-GBM: 5 Features Retained'
                      : 'Classical Full 12-Feature Model'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {featureSelectionMode === 'qiea'
                      ? 'Prunes collinear draft and fouling noise without losing predictive accuracy.'
                      : 'Higher collinearity and sensor latency with zero statistical gain.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-center">
                <div>
                  <div className="text-xs text-slate-500 uppercase">R² Fit</div>
                  <div className="text-lg font-bold text-telemetry-cyan">
                    {featureSelectionMode === 'qiea' ? '0.9752' : '0.9631'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase">MAE Error</div>
                  <div className="text-lg font-bold text-white">
                    {featureSelectionMode === 'qiea' ? '6.51 MT/d' : '7.25 MT/d'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase">Latency</div>
                  <div className="text-lg font-bold text-telemetry-seafoam">
                    {featureSelectionMode === 'qiea' ? '0.003 ms' : '0.083 ms'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT IV — INTERACTIVE PRODUCT DEMO 1: THE REAL-TIME DISPATCHER
      ===================================================================== */}
      <section id="interactive-dispatcher" className="py-28 px-4 sm:px-6 lg:px-12 border-b border-oceanic-border bg-[#09101e]/60">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono uppercase text-telemetry-cyan tracking-widest mb-3">
              ACT IV • INTERACTIVE PRODUCT DEMO
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Direct the Fleet. Experience the Physics.
            </h2>
            <p className="text-slate-300 mt-4 text-base sm:text-lg leading-relaxed font-sans">
              Test real naval hydrodynamics and Well-to-Wake lifecycle calculations in real time. Adjust vessel class, speed, sea state, and fuel pathway to observe immediate impact.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Control Panel: Selectors and Sliders */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-oceanic-hull/80 border border-oceanic-border space-y-6">
              <div className="text-xs font-mono uppercase text-telemetry-cyan tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Voyage Dispatch Parameters</span>
              </div>

              {/* Vessel Selector */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                  Vessel Class & Capacity
                </label>
                <select
                  value={selectedVessel.id}
                  onChange={e => setSelectedVessel(vesselProfiles.find(v => v.id === e.target.value) || vesselProfiles[0])}
                  className="w-full px-4 py-3 rounded-xl bg-oceanic-void border border-oceanic-border text-white text-sm focus:outline-none focus:border-telemetry-cyan"
                >
                  {vesselProfiles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type} • {v.capacity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Corridor Selector */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                  Global Trade Corridor
                </label>
                <select
                  value={selectedCorridor.id}
                  onChange={e => setSelectedCorridor(corridorProfiles.find(c => c.id === e.target.value) || corridorProfiles[0])}
                  className="w-full px-4 py-3 rounded-xl bg-oceanic-void border border-oceanic-border text-white text-sm focus:outline-none focus:border-telemetry-cyan"
                >
                  {corridorProfiles.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.distanceNm} NM • {c.origin} → {c.dest})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">Voyage Speed:</span>
                  <span className="text-telemetry-cyan font-bold text-sm tabular-nums">
                    {speedKnots.toFixed(1)} knots
                  </span>
                </div>
                <input
                  type="range"
                  min="12.0"
                  max="22.0"
                  step="0.1"
                  value={speedKnots}
                  onChange={e => setSpeedKnots(parseFloat(e.target.value))}
                  className="w-full h-2 bg-oceanic-void rounded-lg appearance-none cursor-pointer accent-telemetry-cyan"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>12.0 kt (Slow Steaming)</span>
                  <span>17.5 kt (Optimum)</span>
                  <span>22.0 kt (Sprint)</span>
                </div>
              </div>

              {/* Significant Wave Height Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">Wave Height (Hs):</span>
                  <span className="text-telemetry-amber font-bold text-sm tabular-nums">
                    {waveHeightMeters.toFixed(1)} meters
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={waveHeightMeters}
                  onChange={e => setWaveHeightMeters(parseFloat(e.target.value))}
                  className="w-full h-2 bg-oceanic-void rounded-lg appearance-none cursor-pointer accent-telemetry-amber"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>0.5m (Calm Sea)</span>
                  <span>2.0m (Moderate)</span>
                  <span>5.0m (Heavy Storm)</span>
                </div>
              </div>

              {/* Fuel Pathway Selector */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                  Fuel Pathway & Combustion Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(fuelProfiles).map(([key, f]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedFuelKey(key)}
                      className={`p-3 rounded-xl text-left border transition-all text-xs ${
                        selectedFuelKey === key
                          ? 'bg-telemetry-cyan/10 border-telemetry-cyan text-white'
                          : 'bg-oceanic-void border-oceanic-border text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold">{key}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">${f.costPerMt}/MT</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shore Power Cold-Ironing Toggle */}
              <div className="p-4 rounded-2xl bg-oceanic-void border border-oceanic-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-telemetry-seafoam" />
                    <span>Port Shore Power (Cold-Ironing)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Zero port auxiliary emissions during berth dwell
                  </div>
                </div>
                <button
                  onClick={() => setShorePowerEnabled(!shorePowerEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    shorePowerEnabled ? 'bg-telemetry-seafoam' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-black transition-transform ${
                      shorePowerEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Right Display Panel: Live Physics & Telemetry Output */}
            <div className="lg:col-span-7 p-8 rounded-3xl bg-oceanic-hull/80 border border-oceanic-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-oceanic-border">
                  <div>
                    <div className="text-xs font-mono uppercase text-slate-400">
                      Calculated Physical Response
                    </div>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {selectedVessel.name} on {selectedCorridor.name}
                    </h3>
                  </div>

                  <div
                    className={`px-3 py-1.5 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 ${
                      liveDispatchResult.isScheduleFeasible
                        ? 'border-telemetry-seafoam/40 text-telemetry-seafoam bg-telemetry-seafoam/10'
                        : 'border-red-500/40 text-red-400 bg-red-500/10'
                    }`}
                  >
                    {liveDispatchResult.isScheduleFeasible ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SCHEDULE COMPLIANT</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>DEADLINE EXCEEDED</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Primary Metric Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-8">
                  <div className="p-4 rounded-2xl bg-oceanic-void border border-oceanic-border/70">
                    <div className="text-xs font-mono text-slate-400 uppercase">Daily Fuel Burn</div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1 tabular-nums">
                      {liveDispatchResult.dailyFuelBurnMt} <span className="text-xs text-slate-400 font-normal">MT/d</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      SFOC load-calibrated
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-oceanic-void border border-oceanic-border/70">
                    <div className="text-xs font-mono text-slate-400 uppercase">Voyage Transit</div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-telemetry-cyan font-mono mt-1 tabular-nums">
                      {liveDispatchResult.totalVoyageDays} <span className="text-xs text-slate-400 font-normal">days</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      {liveDispatchResult.seaDays}d sea + {selectedCorridor.dwellDays}d port
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-oceanic-void border border-oceanic-border/70">
                    <div className="text-xs font-mono text-slate-400 uppercase">Lifecycle GHG (WTW)</div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-telemetry-seafoam font-mono mt-1 tabular-nums">
                      {liveDispatchResult.totalWtwGhgTonnes} <span className="text-xs text-slate-400 font-normal">tCO₂e</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      {liveDispatchResult.wttGhgTonnes}t WTT / {liveDispatchResult.ttwGhgTonnes}t TTW
                    </div>
                  </div>
                </div>

                {/* Hydrodynamic Force Breakdown */}
                <div className="p-6 rounded-2xl bg-oceanic-void border border-oceanic-border/70 space-y-4">
                  <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                    Hydrodynamic Resistance & Power Breakdown
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <div className="text-slate-500">Calm Water R</div>
                      <div className="text-white font-bold mt-0.5">{liveDispatchResult.rCalmKn} kN</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Wave Added R</div>
                      <div className="text-telemetry-amber font-bold mt-0.5">{liveDispatchResult.rWaveKn} kN</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Shaft Brake Power</div>
                      <div className="text-telemetry-cyan font-bold mt-0.5">{liveDispatchResult.brakePowerKw} kW</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Engine MCR Load</div>
                      <div className="text-white font-bold mt-0.5">{liveDispatchResult.mcrPercent}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Financial Summary Bottom Bar */}
              <div className="mt-8 pt-6 border-t border-oceanic-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Estimated Total Voyage Cost</div>
                  <div className="text-3xl font-extrabold text-white font-mono mt-1">
                    ${liveDispatchResult.totalVoyageCostUsd}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Includes bunkering, charter capital, and shore electricity
                  </div>
                </div>

                <button
                  onClick={() => onLaunchConsole('prediction')}
                  className="px-6 py-3 rounded-xl bg-oceanic-panel hover:bg-slate-800 border border-oceanic-border text-white text-xs font-mono tracking-wider flex items-center gap-2 transition-all"
                >
                  <span>ADVANCED HYDRO LAB</span>
                  <ExternalLink className="w-3.5 h-3.5 text-telemetry-cyan" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT V — INTERACTIVE DEMO 2: PARETO FRONTIER EXPLORER (DATA AS ART)
      ===================================================================== */}
      <section className="py-28 px-4 sm:px-6 lg:px-12 border-b border-oceanic-border">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono uppercase text-telemetry-violet tracking-widest mb-3">
              ACT V • MULTI-OBJECTIVE PARETO FRONTIER
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Resolving the Three-Way Trade-off.
            </h2>
            <p className="text-slate-300 mt-4 text-base sm:text-lg leading-relaxed font-sans">
              There is no single "best" solution. The MO-QIEA engine identifies the exact non-dominated Pareto frontier between Total Fuel Burn, Operating Cost, and Lifecycle GHG Emissions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Vector Scatter Coordinate Canvas */}
            <div className="lg:col-span-7 p-8 rounded-3xl bg-oceanic-hull/60 border border-oceanic-border relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs font-mono uppercase text-slate-400">
                  Pareto Trade-off Plane: Cost vs. Lifecycle GHG
                </div>
                <div className="text-xs font-mono text-telemetry-cyan">
                  25 GENERATIONS • 100% FEASIBLE
                </div>
              </div>

              {/* Vector 2D Scatter Chart Representation */}
              <div className="relative w-full h-[320px] bg-oceanic-void rounded-2xl border border-oceanic-border/70 p-6 flex flex-col justify-between">
                {/* Axes Labels */}
                <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>← LOW GHG (28k t)</span>
                  <span>HIGH GHG (48k t) →</span>
                </div>

                {/* Plot Area */}
                <div className="relative w-full h-full my-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 border-b border-l border-slate-800" />
                  <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-slate-800/60" />
                  <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-slate-800/60" />

                  {/* Interactive Pareto Points */}
                  {paretoPlans.map(plan => {
                    // Coordinate Mapping (Normalized)
                    // X: Cost ($14M - $22M) -> 10% to 90%
                    // Y: GHG (28k - 48k) -> 80% to 20%
                    const xPct = ((plan.costMillion - 13.5) / (22.5 - 13.5)) * 80 + 10;
                    const yPct = 90 - ((plan.ghgKt - 26) / (50 - 26)) * 80;
                    const isSelected = plan.id === activeParetoPlanId;

                    return (
                      <button
                        key={plan.id}
                        onClick={() => setActiveParetoPlanId(plan.id)}
                        style={{ left: `${xPct}%`, top: `${yPct}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition-all group ${
                          isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-white border-telemetry-cyan shadow-[0_0_15px_rgba(0,229,255,0.8)]'
                              : 'bg-oceanic-hull border-slate-400 group-hover:border-white'
                          }`}
                        >
                          {plan.isKnee && (
                            <span className="w-1.5 h-1.5 rounded-full bg-telemetry-cyan animate-ping" />
                          )}
                        </div>
                        <span className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 border border-slate-700 text-slate-300">
                          {plan.id === 'plan_knee' ? '★ KNEE' : plan.id.replace('plan_', '').toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>$14M (MIN COST)</span>
                  <span>$22M (MAX CAPITAL)</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 mt-4 text-center">
                Click any point to inspect fleet-wide operational telemetry and fuel composition.
              </div>
            </div>

            {/* Right Detailed Plan Inspection Card */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-oceanic-hull/80 border border-oceanic-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full border text-xs font-mono font-bold ${activePlan.badgeColor}`}>
                    {activePlan.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">PLAN ID: {activePlan.id}</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{activePlan.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-sans">
                  {activePlan.description}
                </p>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="p-4 rounded-2xl bg-oceanic-void border border-oceanic-border">
                    <div className="text-xs font-mono text-slate-400">Total Operating Cost</div>
                    <div className="text-2xl font-extrabold text-white font-mono mt-1">
                      ${activePlan.costMillion}M
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-oceanic-void border border-oceanic-border">
                    <div className="text-xs font-mono text-slate-400">Lifecycle GHG</div>
                    <div className="text-2xl font-extrabold text-telemetry-seafoam font-mono mt-1">
                      {activePlan.ghgKt}k <span className="text-xs font-normal text-slate-400">tCO₂e</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-oceanic-void border border-oceanic-border">
                    <div className="text-xs font-mono text-slate-400">Fleet Average Speed</div>
                    <div className="text-xl font-bold text-telemetry-cyan font-mono mt-1">
                      {activePlan.speed}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-oceanic-void border border-oceanic-border">
                    <div className="text-xs font-mono text-slate-400">Fleet Fuel Volume</div>
                    <div className="text-xl font-bold text-white font-mono mt-1">
                      {activePlan.fuelMt} MT
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-oceanic-void border border-oceanic-border/70 text-xs font-mono">
                  <span className="text-slate-400">Fuel Allocation Strategy: </span>
                  <span className="text-telemetry-cyan font-bold">{activePlan.fleetFuelType}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-oceanic-border">
                <button
                  onClick={() => onLaunchConsole('pareto')}
                  className="w-full py-3.5 rounded-xl bg-telemetry-cyan/10 hover:bg-telemetry-cyan/20 border border-telemetry-cyan/40 text-telemetry-cyan font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <span>INSPECT FULL PARETO IN CONSOLE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT VI — INTERACTIVE DEMO 3: CARBON TAX POLICY SANDBOX
      ===================================================================== */}
      <section className="py-28 px-4 sm:px-6 lg:px-12 border-b border-oceanic-border bg-[#09101e]/60">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono uppercase text-telemetry-seafoam tracking-widest mb-3">
              ACT VI • POLICY & CARBON TAX SIMULATION
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              The Economic Tipping Point.
            </h2>
            <p className="text-slate-300 mt-4 text-base sm:text-lg leading-relaxed font-sans">
              Alternative fuels currently carry a green premium. Scrub the carbon tax slider below to discover the exact economic crossover point where green fleet deployment becomes strictly cheaper than fossil bunkering.
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-3xl bg-oceanic-hull/80 border border-oceanic-border">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <label className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Simulated Carbon Tax Levy ($ USD / ton CO₂e)
              </label>
              <div className="text-5xl font-extrabold text-white font-mono my-3 tabular-nums">
                ${carbonTaxRate} <span className="text-lg font-normal text-slate-400">/ tCO₂e</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="5"
                value={carbonTaxRate}
                onChange={e => setCarbonTaxRate(parseInt(e.target.value))}
                className="w-full h-3 bg-oceanic-void rounded-lg appearance-none cursor-pointer accent-telemetry-seafoam"
              />
              <div className="flex justify-between text-xs font-mono text-slate-500 mt-2">
                <span>$0 (Current Status Quo)</span>
                <span className="text-telemetry-cyan font-bold">$165 (Economic Parity Crossover)</span>
                <span>$250 (Future Net-Zero Target)</span>
              </div>
            </div>

            {/* Comparison Bar Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-oceanic-border">
              {/* Baseline Fossil Plan */}
              <div className="p-6 rounded-2xl bg-oceanic-void border border-oceanic-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold text-white">Status Quo (100% Fossil VLSFO)</div>
                  <span className="text-xs font-mono text-slate-400">46,800 tCO₂e</span>
                </div>
                <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  ${policyComparison.baselineTotal}M
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  $14.2M Bunkering + ${(46800 * carbonTaxRate / 1e6).toFixed(2)}M Carbon Tax
                </div>
              </div>

              {/* Proposed QIEA Green Plan */}
              <div className={`p-6 rounded-2xl border transition-all ${
                policyComparison.isGreenCheaper
                  ? 'bg-telemetry-seafoam/10 border-telemetry-seafoam shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'bg-oceanic-void border-oceanic-border'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold text-telemetry-seafoam flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Proposed QIEA Green Plan</span>
                  </div>
                  <span className="text-xs font-mono text-telemetry-seafoam">34,600 tCO₂e</span>
                </div>
                <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  ${policyComparison.greenTotal}M
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  $16.7M Bunkering + ${(34600 * carbonTaxRate / 1e6).toFixed(2)}M Carbon Tax
                </div>
              </div>
            </div>

            {/* Net Savings Verdict */}
            <div className="mt-8 p-6 rounded-2xl bg-oceanic-void border border-oceanic-border/70 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  policyComparison.isGreenCheaper
                    ? 'bg-telemetry-seafoam/20 text-telemetry-seafoam'
                    : 'bg-telemetry-amber/20 text-telemetry-amber'
                }`}>
                  $
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {policyComparison.isGreenCheaper
                      ? `Green Fleet Saves $${policyComparison.netSavings}M Net Every Year`
                      : `Fossil is temporarily $${policyComparison.netSavings}M cheaper before crossover`}
                  </div>
                  <div className="text-xs text-slate-400">
                    Avoids ${policyComparison.taxPenaltyAvoided}M in direct regulatory carbon tax liabilities.
                  </div>
                </div>
              </div>

              <button
                onClick={() => onLaunchConsole('fuels')}
                className="px-6 py-2.5 rounded-xl bg-oceanic-panel hover:bg-slate-800 border border-oceanic-border text-white text-xs font-mono tracking-wider flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <span>TEST POLICY IN CONSOLE</span>
                <ArrowRight className="w-3.5 h-3.5 text-telemetry-seafoam" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT VII — AUDIT-GRADE COMPLIANCE & TAMPER-EVIDENT LEDGER
      ===================================================================== */}
      <section className="py-28 px-4 sm:px-6 lg:px-12 border-b border-oceanic-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="text-xs font-mono uppercase text-telemetry-cyan tracking-widest mb-3">
                ACT VII • INSTITUTIONAL VERIFICATION
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Cryptographic ESG Compliance Ledger.
              </h2>
              <p className="text-slate-300 mt-4 text-base sm:text-lg leading-relaxed font-sans">
                Every optimization run generates an immutable, tamper-evident SHA-256 verification hash certifying compliance with IMO Resolution MEPC.376(80) and FuelEU Maritime standards.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-telemetry-seafoam/20 text-telemetry-seafoam flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-slate-300">
                    <strong className="text-white">IMO MEPC.376(80) Methodological Alignment:</strong> Well-to-Tank and Tank-to-Wake emission factors indexed from certified regulatory databases.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-telemetry-seafoam/20 text-telemetry-seafoam flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-slate-300">
                    <strong className="text-white">FuelEU Maritime Mandates:</strong> Automatic accounting of zero-emission cold-ironing shore power connections at European container berths.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-telemetry-seafoam/20 text-telemetry-seafoam flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-slate-300">
                    <strong className="text-white">Audit Export Options:</strong> Printable HTML certificates, verified JSON ledgers, and live REST API endpoints.
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Ledger Card */}
            <div className="lg:col-span-6 p-8 rounded-3xl bg-oceanic-hull/80 border border-oceanic-border">
              <div className="flex items-center justify-between pb-6 border-b border-oceanic-border">
                <div className="flex items-center gap-2 text-xs font-mono text-telemetry-cyan">
                  <Lock className="w-4 h-4" />
                  <span>IMMUTABLE AUDIT CERTIFICATE</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-telemetry-seafoam/10 text-telemetry-seafoam border border-telemetry-seafoam/30 text-xs font-mono font-bold">
                  VERIFIED FEASIBLE
                </span>
              </div>

              <div className="my-6 space-y-4 font-mono text-xs">
                <div>
                  <div className="text-slate-500 uppercase">Cryptographic Run Signature</div>
                  <div className="p-3 rounded-xl bg-oceanic-void border border-oceanic-border text-telemetry-cyan break-all mt-1">
                    a4d339247bf2bc7e5c6a1cf88c946e3923d5733f1ff4f53c9e376834b6bdfbf6
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-oceanic-void border border-oceanic-border">
                    <div className="text-slate-500">Run ID</div>
                    <div className="text-white font-bold mt-0.5">run_1790982234_mo_qiea</div>
                  </div>
                  <div className="p-3 rounded-xl bg-oceanic-void border border-oceanic-border">
                    <div className="text-slate-500">Solution Plan</div>
                    <div className="text-white font-bold mt-0.5">moqiea_g19_i28</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-oceanic-border flex items-center justify-between">
                <button
                  onClick={() => onLaunchConsole('reports')}
                  className="px-6 py-3 rounded-xl bg-telemetry-cyan text-black font-bold text-xs tracking-wider flex items-center gap-2 hover:bg-cyan-300 transition-all glow-cyan"
                >
                  <FileText className="w-4 h-4" />
                  <span>VIEW AUDIT REPORT</span>
                </button>

                <a
                  href="/api/reports/json/run_1790982234_mo_qiea"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>EXPORT RAW JSON</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT VIII — FINAL CINEMATIC CALL TO ACTION
      ===================================================================== */}
      <section className="py-32 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#070d18] to-[#040810] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-telemetry-cyan/10 border border-telemetry-cyan/40 flex items-center justify-center text-telemetry-cyan mx-auto mb-8 glow-cyan">
            <Compass className="w-8 h-8" />
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Empower Your Fleet with Quantum Intelligence.
          </h2>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-sans">
            Ready to deploy? Launch the live decision support console to simulate real corridor deployments, inspect Pareto frontiers, and download certified ESG compliance ledgers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onLaunchConsole('operations')}
              className="px-10 py-5 rounded-2xl bg-telemetry-cyan text-black font-extrabold text-sm tracking-wide flex items-center gap-3 hover:bg-cyan-300 transition-all glow-cyan"
            >
              <span>ENTER FLEET OPERATIONS CONSOLE</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-5 rounded-2xl border border-oceanic-border hover:border-slate-400 text-slate-300 font-semibold text-sm tracking-wide bg-oceanic-hull/60 hover:bg-oceanic-hull transition-all flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 text-telemetry-cyan" />
              <span>EXPLORE API DOCS</span>
            </a>
          </div>
        </div>
      </section>

      {/* Persistent Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-12 border-t border-oceanic-border text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          SMART INDIA HACKATHON 2024 • PROBLEM STATEMENT 2 (SIH26138)
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => onLaunchConsole('benchmarks')} className="hover:text-slate-300 transition-colors">
            BENCHMARKS
          </button>
          <button onClick={() => onLaunchConsole('reports')} className="hover:text-slate-300 transition-colors">
            AUDIT
          </button>
          <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">
            SWAGGER API
          </a>
        </div>
      </footer>
    </div>
  );
};
