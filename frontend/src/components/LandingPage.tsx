import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight
} from '@/components/icons';
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

  const fuelProfiles: Record<string, { name: string; costPerMt: number; lhvMjKg: number; wttGco2eMj: number; ttwGco2eG: number }> = {
    VLSFO: {
      name: 'Very Low Sulfur Fuel Oil (0.50% S)',
      costPerMt: 620,
      lhvMjKg: 40.5,
      wttGco2eMj: 14.5,
      ttwGco2eG: 3.151,
    },
    MGO: {
      name: 'Marine Gas Oil (0.10% S)',
      costPerMt: 840,
      lhvMjKg: 42.7,
      wttGco2eMj: 15.0,
      ttwGco2eG: 3.206,
    },
    LNG: {
      name: 'Liquefied Natural Gas (Methane)',
      costPerMt: 710,
      lhvMjKg: 49.1,
      wttGco2eMj: 18.5,
      ttwGco2eG: 2.750,
    },
    BIO_METHANOL: {
      name: 'Biogenic e-Methanol',
      costPerMt: 1150,
      lhvMjKg: 19.9,
      wttGco2eMj: 12.0,
      ttwGco2eG: 1.375,
    },
    GREEN_NH3: {
      name: 'Green e-Ammonia',
      costPerMt: 1380,
      lhvMjKg: 18.6,
      wttGco2eMj: 8.5,
      ttwGco2eG: 0.0,
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

    const displacement = selectedVessel.dwt * 0.85;
    const wettedSurface = 1.025 * Math.sqrt(displacement * selectedVessel.length);
    const cf = 0.075 / Math.pow(Math.log10((v_ms * selectedVessel.length) / 1.19e-6) - 2, 2);
    const ct = cf * 1.25;
    const rCalmKn = 0.5 * 1025.0 * Math.pow(v_ms, 2) * wettedSurface * ct / 1000.0;

    const rWaveKn = (1.0 / 16.0) * 1025.0 * 9.81 * Math.pow(waveHeightMeters, 2) * Math.pow(selectedVessel.beam, 2) / selectedVessel.length / 1000.0 * 0.25;

    const totalResistanceKn = rCalmKn + rWaveKn;
    const rawPowerKw = (totalResistanceKn * v_ms) / (0.68 * 0.98);
    const brakePowerKw = Math.min(selectedVessel.mcrKw * 0.95, Math.max(2000, rawPowerKw));

    const mcrRatio = brakePowerKw / selectedVessel.mcrKw;
    const sfocBaseline = 175.0 + 40.0 * Math.pow(mcrRatio - 0.75, 2);
    const sfocEnergyAdjusted = sfocBaseline * (40.5 / fuel.lhvMjKg);
    const dailyFuelBurnMt = (brakePowerKw * sfocEnergyAdjusted * 24.0) / 1000000.0;

    const seaHours = selectedCorridor.distanceNm / speedKnots;
    const seaDays = seaHours / 24.0;
    const totalVoyageDays = seaDays + selectedCorridor.dwellDays;

    const voyageSeaFuelMt = dailyFuelBurnMt * seaDays;
    const portDailyBurnMt = 3.5;
    const portFuelMt = shorePowerEnabled ? 0.0 : portDailyBurnMt * selectedCorridor.dwellDays;
    const totalVoyageFuelMt = voyageSeaFuelMt + portFuelMt;
    const bunkeringCostUsd = totalVoyageFuelMt * fuel.costPerMt;
    const charterCostUsd = totalVoyageDays * selectedVessel.dailyCharter;
    const shorePowerElectricityUsd = shorePowerEnabled ? (selectedCorridor.dwellDays * 24.0 * 1200 * 0.16) : 0.0;
    const totalVoyageCostUsd = bunkeringCostUsd + charterCostUsd + shorePowerElectricityUsd;

    const fuelMassGrams = totalVoyageFuelMt * 1e6;
    const fuelEnergyMj = (fuelMassGrams / 1000.0) * fuel.lhvMjKg;
    const wttGhgTonnes = (fuelEnergyMj * fuel.wttGco2eMj) / 1e6;
    const ttwGhgTonnes = (fuelMassGrams * fuel.ttwGco2eG) / 1e6;
    const shorePowerGhgTonnes = shorePowerEnabled ? (selectedCorridor.dwellDays * 24.0 * 1.2 * 0.28) : 0.0;
    const totalWtwGhgTonnes = wttGhgTonnes + ttwGhgTonnes + shorePowerGhgTonnes;

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
    };
  }, [selectedVessel, selectedCorridor, speedKnots, waveHeightMeters, selectedFuelKey, shorePowerEnabled]);

  // --------------------------------------------------------------------------
  // Interactive Demo 2: Quantum Feature Mask Matrix
  // --------------------------------------------------------------------------
  const [featureSelectionMode, setFeatureSelectionMode] = useState<'qiea' | 'full'>('qiea');
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

  // --------------------------------------------------------------------------
  // Interactive Demo 3: Strategic Pareto Frontier Trade-Off
  // --------------------------------------------------------------------------
  const paretoPlans = [
    {
      id: 'plan_speed',
      code: 'ALPHA',
      title: 'Plan Alpha: Maximum Velocity',
      tag: 'SPEED PRIORITY',
      speed: '20.2 kt',
      costMillion: 20.8,
      ghgKt: 42.5,
      fuelMt: 12450,
      description: 'Prioritizes tight supply chain ETA delivery. High power demand and elevated bunker burn.',
      fleetFuelType: 'MGO / VLSFO Dual',
      color: '#ffb703',
    },
    {
      id: 'plan_knee',
      code: 'KNEE',
      title: 'Plan Knee: The Golden Compromise',
      tag: 'RECOMMENDED (QIEA)',
      speed: '17.2 kt',
      costMillion: 16.7,
      ghgKt: 34.6,
      fuelMt: 9593,
      description: 'Calculated mathematical knee point. Optimal marginal abatement cost with 100% demand fulfillment.',
      fleetFuelType: 'VLSFO + Bio-MeOH + Shore Power',
      color: '#00f0ff',
      isKnee: true,
    },
    {
      id: 'plan_green',
      code: 'GAMMA',
      title: 'Plan Gamma: Deep Decarbonization',
      tag: 'ZERO EMISSION',
      speed: '15.8 kt',
      costMillion: 21.2,
      ghgKt: 28.1,
      fuelMt: 8850,
      description: 'Maximum FuelEU Maritime compliance through aggressive bio-methanol adoption and electrified berths.',
      fleetFuelType: 'Bio-Methanol + Green Ammonia',
      color: '#00ff9d',
    },
    {
      id: 'plan_cost',
      code: 'DELTA',
      title: 'Plan Delta: Minimum Capex',
      tag: 'MIN OPEX',
      speed: '15.1 kt',
      costMillion: 14.2,
      ghgKt: 46.8,
      fuelMt: 8620,
      description: 'Lowest upfront fuel expenditure using heavy fossil bunkering; incurs heavy future carbon tax penalties.',
      fleetFuelType: '100% VLSFO Baseline',
      color: '#64748b',
    },
  ];

  const [activeParetoPlanId, setActiveParetoPlanId] = useState('plan_knee');
  const activePlan = paretoPlans.find(p => p.id === activeParetoPlanId) || paretoPlans[1];

  // --------------------------------------------------------------------------
  // Interactive Demo 4: Carbon Tax Policy Sandbox
  // --------------------------------------------------------------------------
  const [carbonTaxRate, setCarbonTaxRate] = useState(120);
  const policyComparison = useMemo(() => {
    const baselineGhg = 46800;
    const baselineBunkerCost = 14200000;
    const baselineCarbonTax = baselineGhg * carbonTaxRate;
    const baselineTotal = baselineBunkerCost + baselineCarbonTax;

    const greenGhg = 34600;
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
    <div className="relative min-h-screen bg-[#050811] text-slate-100 font-sans selection:bg-[#00f0ff] selection:text-black overflow-x-hidden">
      {/* =====================================================================
          TEXTURE DIRECTIVE: SVG <feTurbulence> NOISE FILTER OVERLAY
      ===================================================================== */}
      <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.038] mix-blend-screen" aria-hidden="true">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Atmospheric Diagonal Razor Lines (No safe radial gradients) */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(135deg,#050811_0%,#081021_45%,#04070e_100%)] opacity-90" />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent" />

      {/* =====================================================================
          ACT I: ASYMMETRICAL HERO WITH OVERSIZED GRID-BREAKING TYPOGRAPHY
      ===================================================================== */}
      <section className="relative z-10 pt-20 pb-32 px-6 sm:px-12 lg:px-20 border-b border-white/[0.08] min-h-[95vh] flex flex-col justify-between">
        {/* Top Mechanical Coordinate Bar */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono tracking-widest text-slate-400 uppercase gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#00f0ff] shadow-[0_0_12px_#00f0ff]" />
            <span>GLOBAL MARITIME OPTIMIZATION // SIH26138</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span>LAT 01°17'N LON 103°50'E</span>
            <span className="text-white/20">/</span>
            <span>IMO MEPC.376(80) & FUELEU COMPLIANT</span>
          </div>
        </div>

        {/* Hero Central Asymmetric Composition */}
        <div className="my-auto py-12">
          {/* Overlapping Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-[#0b1426] border border-[#00f0ff]/40 text-[#00f0ff] text-xs font-mono tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d]" />
            <span>QUANTUM-INSPIRED EVOLUTIONARY PLATFORM • IMO MEPC.376 MODELED</span>
          </div>

          {/* Extreme Grid-Breaking Headline */}
          <div className="relative">
            <h1 className="text-5xl sm:text-7xl lg:text-[7.5rem] font-display font-extrabold uppercase tracking-tight text-white leading-[0.88] select-none">
              QUANTUM
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                OCEANIC.
              </span>
            </h1>

            {/* Overlapping Raw HTML Coordinate Badge */}
            <div className="sm:absolute sm:right-0 sm:bottom-4 mt-6 sm:mt-0 p-4 rounded-sm bg-[#0a101f]/95 border border-white/10 backdrop-blur-md max-w-sm">
              <div className="text-[10px] font-mono text-[#00f0ff] tracking-widest uppercase mb-1">
                SYSTEM VERDICT • LIVE
              </div>
              <div className="text-sm font-mono text-slate-200 leading-snug">
                Eliminating 1,000,000,000 metric tons of maritime carbon through naval hydrodynamics and quantum Givens rotations.
              </div>
            </div>
          </div>

          {/* Asymmetric Sub-Lead & Action Triggers */}
          <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-sans leading-relaxed">
              Fusing Holtrop-Mennen naval hull resistance, multi-state Q-qudit superposition, and multi-objective Pareto metaheuristics to schedule container fleets across 5 global trade corridors.
            </p>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onLaunchConsole('operations')}
                className="px-8 py-4 rounded-sm bg-[#00f0ff] text-black font-mono font-bold text-xs tracking-widest uppercase flex items-center gap-3 shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:bg-cyan-300 transition-colors"
              >
                <span>LAUNCH CONSOLE</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#dispatcher-section"
                className="px-6 py-4 rounded-sm border border-white/20 hover:border-[#00f0ff] text-white font-mono text-xs tracking-wider uppercase bg-[#091122]/60 transition-colors flex items-center gap-2"
              >
                <Sliders className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>TEST DISPATCHER</span>
              </motion.a>
            </div>
          </div>
        </div>

        {/* Asymmetrical Horizon Telemetry Strip */}
        <div className="pt-8 border-t border-white/[0.08] grid grid-cols-2 lg:grid-cols-4 gap-8 font-mono">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">Global Maritime Burn</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tabular-nums">
              1,076M <span className="text-xs font-normal text-slate-400">tCO₂/yr</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">3.0% of planetary GHG</div>
          </div>

          <div>
            <div className="text-[10px] text-[#00ff9d] uppercase tracking-widest">WTW Abatement</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#00ff9d] mt-1 tabular-nums">
              -26.1%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Via Multi-Objective QIEA</div>
          </div>

          <div>
            <div className="text-[10px] text-[#00f0ff] uppercase tracking-widest">Quantum Feature Pruning</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#00f0ff] mt-1 tabular-nums">
              5 <span className="text-xs font-normal text-slate-400">of 12</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Preserves R² = 0.9752 (0.003ms)</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">Schedule Reliability</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tabular-nums">
              100%
            </div>
            <div className="text-[11px] text-[#00ff9d] mt-1">Zero ETA deadline breaches</div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT II: THE REGULATORY SQUEEZE (ASYMMETRICAL DIAGONAL FRACTURE)
      ===================================================================== */}
      <section className="relative z-10 py-32 px-6 sm:px-12 lg:px-20 border-b border-white/[0.08] bg-[#070c1a]/90">
        <div className="max-w-7xl mx-auto">
          {/* Asymmetric Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
            <div className="lg:col-span-8">
              <span className="text-xs font-mono text-[#ffb703] uppercase tracking-widest block mb-3">
                02 // THE DECARBONIZATION CLIFF
              </span>
              <h2 className="text-4xl sm:text-6xl font-display font-extrabold uppercase text-white tracking-tight leading-[0.92]">
                A $40 Billion Regulatory Squeeze.
              </h2>
            </div>
            <div className="lg:col-span-4 lg:pt-8 text-sm text-slate-300 font-sans leading-relaxed">
              Global maritime shipping cannot simply shut off fossil bunkering without triggering worldwide port congestion. The transition requires mathematical precision to avoid catastrophic compliance fines.
            </div>
          </div>

          {/* Asymmetric Offset Data Stream (No safe 3-column cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Wide 7-column primary feature panel */}
            <div className="lg:col-span-7 p-8 sm:p-12 rounded-sm bg-[#091122] border border-white/10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 font-mono text-xs text-[#ffb703] border-b border-l border-white/10">
                REGULATION (EU) 2023/1805
              </div>
              <div>
                <div className="w-12 h-12 rounded-sm bg-[#ffb703]/10 border border-[#ffb703]/30 flex items-center justify-center text-[#ffb703] mb-8">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4 uppercase">
                  FuelEU Maritime Mandates
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  Enforces strict Well-to-Wake GHG intensity reductions (-2% in 2025, -6% in 2030, -80% by 2050). Non-compliant voyages incur punitive penalties of <span className="text-[#ffb703] font-mono font-bold">€2,400 per metric ton</span> of VLSFO energy deficit.
                </p>
              </div>

              <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>ENFORCEMENT ACTIVE • 2025/2026 CYCLE</span>
                <span className="text-[#ffb703]">€2,400 / TON DEFICIT</span>
              </div>
            </div>

            {/* Narrow 5-column stacked secondary panels */}
            <div className="lg:col-span-5 flex flex-col gap-8 justify-between">
              <div className="p-8 rounded-sm bg-[#091122] border border-white/10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-[#00f0ff]">COMBINATORIAL SEARCH SPACE</span>
                    <Cpu className="w-4 h-4 text-[#00f0ff]" />
                  </div>
                  <h4 className="text-lg font-display font-bold text-white uppercase mb-2">The NP-Hard Fleet Dilemma</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Deploying 15 to 100 containerships across 5 major liner corridors with variable speeds (12–22 kt), 7 fuel pathways, port dwell schedules, and cold-ironing berths spans over <span className="text-[#00f0ff] font-mono font-bold">10²⁷ discrete combinations</span>.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-4 pt-4 border-t border-white/10">
                  CLASSICAL BRUTE-FORCE COLLAPSES
                </div>
              </div>

              <div className="p-8 rounded-sm bg-[#091122] border border-white/10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-[#00ff9d]">PHYSICS FORMULATION</span>
                    <Waves className="w-4 h-4 text-[#00ff9d]" />
                  </div>
                  <h4 className="text-lg font-display font-bold text-white uppercase mb-2">Cubic Hydrodynamics Law</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Propulsion brake power scales cubically with vessel velocity: <span className="font-mono text-[#00ff9d]">P ∝ V³</span>. Dropping from 20 to 16 knots cuts daily fuel by 48%, but risks missing tight cargo deadlines.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-4 pt-4 border-t border-white/10">
                  HOLTROP-MENNEN + KWON ADDED WAVE RESISTANCE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT III: THE QUANTUM-INSPIRED ENGINE (QIEA-FS)
      ===================================================================== */}
      <section className="relative z-10 py-32 px-6 sm:px-12 lg:px-20 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-7">
              <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest block mb-3">
                03 // QUANTUM EVOLUTIONARY DYNAMICS
              </span>
              <h2 className="text-4xl sm:text-6xl font-display font-extrabold uppercase text-white tracking-tight leading-[0.92]">
                Givens Rotation Feature Pruning.
              </h2>
              <p className="text-slate-300 mt-4 text-base sm:text-lg font-sans leading-relaxed">
                Rather than blind genetic mutation, QIEA represents feature selection probabilities on a continuous quantum Bloch sphere, using Givens rotation gates to iteratively converge on the non-dominated Pareto front.
              </p>
            </div>

            <div className="lg:col-span-5 flex justify-end">
              <div className="p-6 rounded-sm bg-[#091122] border border-white/10 w-full font-mono text-xs">
                <div className="text-slate-400 mb-2 uppercase tracking-wider">Givens Rotation Operator</div>
                <div className="p-4 rounded-sm bg-[#050811] text-[#00f0ff] border border-white/10 leading-relaxed">
                  U(Δθ) = [ cos(Δθ) &nbsp;-sin(Δθ) ]<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ sin(Δθ) &nbsp;&nbsp;cos(Δθ) ]
                </div>
                <div className="text-[11px] text-slate-400 mt-3">
                  Rotates state amplitudes toward the Pareto archive with catastrophe dispersion when diversity &lt; 0.005.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Feature Matrix */}
          <div className="p-8 sm:p-12 rounded-sm bg-[#080f1e] border border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-display font-bold uppercase text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#00f0ff]" />
                  <span>Interactive Q-Bit Telemetry Mask</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  12 candidate sensor features pared down to the 5 pure hydrodynamic drivers.
                </p>
              </div>

              <div className="flex items-center gap-2 p-1 bg-[#050811] border border-white/10 text-xs font-mono">
                <button
                  onClick={() => setFeatureSelectionMode('qiea')}
                  className={`px-4 py-2 transition-all ${
                    featureSelectionMode === 'qiea'
                      ? 'bg-[#00f0ff] text-black font-bold shadow-[0_0_15px_#00f0ff]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  QIEA-FS (5 Features)
                </button>
                <button
                  onClick={() => setFeatureSelectionMode('full')}
                  className={`px-4 py-2 transition-all ${
                    featureSelectionMode === 'full'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Classical Full (12 Features)
                </button>
              </div>
            </div>

            {/* Feature Cards Array */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allFeatures.map((feat, idx) => {
                const isActive = featureSelectionMode === 'full' || feat.selected;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className={`p-4 rounded-sm border transition-all ${
                      isActive
                        ? 'bg-[#0b1426] border-[#00f0ff]/50'
                        : 'bg-[#050811]/40 border-white/[0.05] opacity-35'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className={isActive ? 'text-white font-bold' : 'text-slate-500'}>
                        {feat.name}
                      </span>
                      <span className={isActive ? 'text-[#00f0ff]' : 'text-slate-600'}>
                        {feat.qBitState}
                      </span>
                    </div>
                    <div className="w-full bg-[#050811] h-1.5 rounded-none overflow-hidden mb-2">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isActive ? 'bg-[#00f0ff]' : 'bg-slate-700'
                        }`}
                        style={{ width: `${feat.prob * 100}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {feat.reason}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Performance Ledger Callout */}
            <div className="mt-8 p-6 rounded-sm bg-[#050811] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 font-mono">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#00ff9d]/10 border border-[#00ff9d]/30 flex items-center justify-center text-[#00ff9d]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {featureSelectionMode === 'qiea'
                      ? 'Quantum QIEA-GBM: 5 Core Hydrodynamic Drivers'
                      : 'Classical Full 12-Feature Dataset'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {featureSelectionMode === 'qiea'
                      ? 'Erases sensor collinearity and latency with zero accuracy drop.'
                      : 'Higher inference latency and over-parameterization.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 text-center text-xs">
                <div>
                  <div className="text-slate-400 uppercase">R² Fit</div>
                  <div className="text-xl font-bold text-[#00f0ff] mt-0.5">
                    {featureSelectionMode === 'qiea' ? '0.9752' : '0.9631'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase">MAE Error</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {featureSelectionMode === 'qiea' ? '6.51 MT/d' : '7.25 MT/d'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase">Inference</div>
                  <div className="text-xl font-bold text-[#00ff9d] mt-0.5">
                    {featureSelectionMode === 'qiea' ? '0.003 ms' : '0.083 ms'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT IV: THE INTERACTIVE VOYAGE DISPATCHER (PRODUCT-AS-HERO)
      ===================================================================== */}
      <section id="dispatcher-section" className="relative z-10 py-32 px-6 sm:px-12 lg:px-20 border-b border-white/[0.08] bg-[#070c1a]/90">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest block mb-3">
              04 // INTERACTIVE PRODUCT DEMO
            </span>
            <h2 className="text-4xl sm:text-6xl font-display font-extrabold uppercase text-white tracking-tight leading-[0.92]">
              Direct the Fleet. Experience the Physics.
            </h2>
            <p className="text-slate-300 mt-4 text-base sm:text-lg font-sans leading-relaxed">
              Test real naval hydrodynamics and Well-to-Wake lifecycle accounting in real time. Adjust vessel class, speed, sea state, and fuel pathway to observe immediate physical response.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Control Column */}
            <div className="lg:col-span-5 p-8 rounded-sm bg-[#091122] border border-white/10 space-y-6">
              <div className="text-xs font-mono uppercase text-[#00f0ff] tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Voyage Parameters</span>
              </div>

              {/* Vessel Selector */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
                  Vessel Class & Capacity
                </label>
                <select
                  value={selectedVessel.id}
                  onChange={e => setSelectedVessel(vesselProfiles.find(v => v.id === e.target.value) || vesselProfiles[0])}
                  className="w-full px-4 py-3 rounded-sm bg-[#050811] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#00f0ff]"
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
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
                  Global Trade Corridor
                </label>
                <select
                  value={selectedCorridor.id}
                  onChange={e => setSelectedCorridor(corridorProfiles.find(c => c.id === e.target.value) || corridorProfiles[0])}
                  className="w-full px-4 py-3 rounded-sm bg-[#050811] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#00f0ff]"
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
                  <span className="text-[#00f0ff] font-bold tabular-nums">
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
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>12.0 kt (Slow Steam)</span>
                  <span>17.5 kt (Optimum)</span>
                  <span>22.0 kt (Sprint)</span>
                </div>
              </div>

              {/* Significant Wave Height Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">Wave Height (Hs):</span>
                  <span className="text-[#ffb703] font-bold tabular-nums">
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
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>0.5m (Calm Sea)</span>
                  <span>2.0m (Moderate)</span>
                  <span>5.0m (Storm)</span>
                </div>
              </div>

              {/* Fuel Pathway Grid */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
                  Fuel Pathway & Bunkering
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(fuelProfiles).map(([key, f]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedFuelKey(key)}
                      className={`p-3 rounded-sm text-left border transition-all text-xs font-mono ${
                        selectedFuelKey === key
                          ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-white shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                          : 'bg-[#050811] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">{key}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">${f.costPerMt}/MT</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cold-Ironing Toggle */}
              <div className="p-4 rounded-sm bg-[#050811] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold font-mono text-white flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#00ff9d]" />
                    <span>Port Shore Power (Cold-Ironing)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Zero port auxiliary emissions during berth dwell
                  </div>
                </div>
                <button
                  onClick={() => setShorePowerEnabled(!shorePowerEnabled)}
                  className={`w-11 h-5 rounded-full transition-colors relative ${
                    shorePowerEnabled ? 'bg-[#00ff9d]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black transition-transform ${
                      shorePowerEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Right Telemetry Board */}
            <div className="lg:col-span-7 p-8 rounded-sm bg-[#091122] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      Calculated Naval Physics Response
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white uppercase mt-1">
                      {selectedVessel.name} • {selectedCorridor.name}
                    </h3>
                  </div>

                  <div
                    className={`px-3 py-1.5 rounded-sm border text-xs font-mono font-bold flex items-center gap-1.5 ${
                      liveDispatchResult.isScheduleFeasible
                        ? 'border-[#00ff9d]/40 text-[#00ff9d] bg-[#00ff9d]/10'
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
                        <span>DEADLINE BREACH</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Primary Numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-8 font-mono">
                  <div className="p-4 rounded-sm bg-[#050811] border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">Daily Fuel Burn</div>
                    <div className="text-3xl font-extrabold text-white mt-1 tabular-nums">
                      {liveDispatchResult.dailyFuelBurnMt} <span className="text-xs text-slate-400 font-normal">MT/d</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">SFOC load-calibrated</div>
                  </div>

                  <div className="p-4 rounded-sm bg-[#050811] border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">Voyage Transit</div>
                    <div className="text-3xl font-extrabold text-[#00f0ff] mt-1 tabular-nums">
                      {liveDispatchResult.totalVoyageDays} <span className="text-xs text-slate-400 font-normal">days</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {liveDispatchResult.seaDays}d sea + {selectedCorridor.dwellDays}d port
                    </div>
                  </div>

                  <div className="p-4 rounded-sm bg-[#050811] border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">Lifecycle GHG (WTW)</div>
                    <div className="text-3xl font-extrabold text-[#00ff9d] mt-1 tabular-nums">
                      {liveDispatchResult.totalWtwGhgTonnes} <span className="text-xs text-slate-400 font-normal">tCO₂e</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {liveDispatchResult.wttGhgTonnes}t WTT / {liveDispatchResult.ttwGhgTonnes}t TTW
                    </div>
                  </div>
                </div>

                {/* Hydrodynamic Force Breakdown */}
                <div className="p-6 rounded-sm bg-[#050811] border border-white/10 space-y-4 font-mono text-xs">
                  <div className="text-[10px] uppercase text-slate-400 tracking-wider">
                    Hydrodynamic Resistance & Propulsion Power
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="text-slate-400">Calm Water R</div>
                      <div className="text-white font-bold mt-0.5">{liveDispatchResult.rCalmKn} kN</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Wave Added R</div>
                      <div className="text-[#ffb703] font-bold mt-0.5">{liveDispatchResult.rWaveKn} kN</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Brake Power</div>
                      <div className="text-[#00f0ff] font-bold mt-0.5">{liveDispatchResult.brakePowerKw} kW</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Engine MCR Load</div>
                      <div className="text-white font-bold mt-0.5">{liveDispatchResult.mcrPercent}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Financial Summary Bottom Bar */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Estimated Total Voyage Cost</div>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    ${liveDispatchResult.totalVoyageCostUsd}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Includes bunkering, charter capital, and shore electricity
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onLaunchConsole('prediction')}
                  className="px-6 py-3 rounded-sm bg-[#0b1426] hover:bg-[#111e38] border border-white/10 text-white text-xs tracking-wider flex items-center gap-2 transition-all"
                >
                  <span>ADVANCED HYDRO LAB</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#00f0ff]" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT V: MULTI-OBJECTIVE PARETO FRONTIER EXPLORER (DATA AS ART)
      ===================================================================== */}
      <section className="relative z-10 py-32 px-6 sm:px-12 lg:px-20 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono text-[#d946ef] uppercase tracking-widest block mb-3">
              05 // MULTI-OBJECTIVE OPTIMIZATION
            </span>
            <h2 className="text-4xl sm:text-6xl font-display font-extrabold uppercase text-white tracking-tight leading-[0.92]">
              Resolving the Three-Way Trade-off.
            </h2>
            <p className="text-slate-300 mt-4 text-base sm:text-lg font-sans leading-relaxed">
              There is no single "best" solution. The MO-QIEA engine identifies the exact non-dominated Pareto frontier between Total Fuel Burn, Operating Cost, and Lifecycle GHG Emissions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* 2D Vector Scatter Coordinate Canvas */}
            <div className="lg:col-span-7 p-8 rounded-sm bg-[#091122] border border-white/10">
              <div className="flex items-center justify-between mb-6 font-mono text-xs">
                <span className="text-slate-400 uppercase">Pareto Trade-off Plane: Cost vs. Lifecycle GHG</span>
                <span className="text-[#00f0ff]">25 GENERATIONS • 100% FEASIBLE</span>
              </div>

              <div className="relative w-full h-[320px] bg-[#050811] rounded-sm border border-white/10 p-6 flex flex-col justify-between font-mono">
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>← LOW GHG (28k t)</span>
                  <span>HIGH GHG (48k t) →</span>
                </div>

                {/* Plot Space */}
                <div className="relative w-full h-full my-4">
                  <div className="absolute inset-0 border-b border-l border-white/10" />
                  <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-white/[0.05]" />
                  <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-white/[0.05]" />

                  {/* Interactive Points */}
                  {paretoPlans.map(plan => {
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
                              ? 'bg-white border-[#00f0ff] shadow-[0_0_15px_#00f0ff]'
                              : 'bg-[#091122] border-slate-500 group-hover:border-white'
                          }`}
                        >
                          {plan.isKnee && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
                          )}
                        </div>
                        <span className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono px-2 py-0.5 rounded-sm bg-black/90 border border-white/10 text-slate-300">
                          {plan.id === 'plan_knee' ? '★ KNEE' : plan.code}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>$14M (MIN OPEX)</span>
                  <span>$22M (MAX CAPITAL)</span>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-400 mt-4 text-center">
                Click any point to inspect fleet-wide operational telemetry and fuel composition.
              </div>
            </div>

            {/* Right Detailed Plan Inspection Card */}
            <div className="lg:col-span-5 p-8 rounded-sm bg-[#091122] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 font-mono text-xs">
                  <span className={`px-2.5 py-1 rounded-sm border font-bold ${
                    activePlan.isKnee
                      ? 'border-[#00f0ff]/50 text-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : 'border-white/20 text-slate-300 bg-white/5'
                  }`}>
                    {activePlan.tag}
                  </span>
                  <span className="text-slate-400">PLAN ID: {activePlan.id}</span>
                </div>

                <h3 className="text-2xl font-display font-bold uppercase text-white mb-2">{activePlan.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-sans">
                  {activePlan.description}
                </p>

                <div className="grid grid-cols-2 gap-4 my-6 font-mono">
                  <div className="p-4 rounded-sm bg-[#050811] border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">Operating Cost</div>
                    <div className="text-2xl font-extrabold text-white mt-1">
                      ${activePlan.costMillion}M
                    </div>
                  </div>

                  <div className="p-4 rounded-sm bg-[#050811] border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">Lifecycle GHG</div>
                    <div className="text-2xl font-extrabold text-[#00ff9d] mt-1">
                      {activePlan.ghgKt}k <span className="text-xs font-normal text-slate-400">tCO₂e</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-sm bg-[#050811] border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">Fleet Speed</div>
                    <div className="text-xl font-bold text-[#00f0ff] mt-1">
                      {activePlan.speed}
                    </div>
                  </div>

                  <div className="p-4 rounded-sm bg-[#050811] border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">Fleet Fuel</div>
                    <div className="text-xl font-bold text-white mt-1">
                      {activePlan.fuelMt} MT
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-sm bg-[#050811] border border-white/10 text-xs font-mono">
                  <span className="text-slate-400">Fuel Allocation Strategy: </span>
                  <span className="text-[#00f0ff] font-bold">{activePlan.fleetFuelType}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onLaunchConsole('pareto')}
                  className="w-full py-3.5 rounded-sm bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] font-mono font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all"
                >
                  <span>INSPECT IN CONSOLE</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT VI: THE CARBON TAX ECONOMIC TIPPING POINT
      ===================================================================== */}
      <section className="relative z-10 py-32 px-6 sm:px-12 lg:px-20 border-b border-white/[0.08] bg-[#070c1a]/90">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono text-[#00ff9d] uppercase tracking-widest block mb-3">
              06 // ECONOMIC PARITY SIMULATION
            </span>
            <h2 className="text-4xl sm:text-6xl font-display font-extrabold uppercase text-white tracking-tight leading-[0.92]">
              The Economic Tipping Point.
            </h2>
            <p className="text-slate-300 mt-4 text-base sm:text-lg font-sans leading-relaxed">
              Alternative fuels carry an upfront green premium. Scrub the carbon tax slider below to discover the exact economic crossover point where green fleet deployment becomes strictly cheaper than fossil bunkering.
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-sm bg-[#091122] border border-white/10">
            <div className="max-w-2xl mx-auto text-center mb-10 font-mono">
              <label className="text-[11px] uppercase text-slate-400 tracking-wider">
                Simulated Carbon Tax Levy ($ USD / ton CO₂e)
              </label>
              <div className="text-5xl font-extrabold text-white my-3 tabular-nums font-mono">
                ${carbonTaxRate} <span className="text-lg font-normal text-slate-400">/ tCO₂e</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="5"
                value={carbonTaxRate}
                onChange={e => setCarbonTaxRate(parseInt(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>$0 (Current Baseline)</span>
                <span className="text-[#00f0ff] font-bold">$165 (Economic Parity Crossover)</span>
                <span>$250 (Target Rate)</span>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/10 font-mono">
              <div className="p-6 rounded-sm bg-[#050811] border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold text-white">Status Quo (100% Fossil VLSFO)</div>
                  <span className="text-xs text-slate-400">46,800 tCO₂e</span>
                </div>
                <div className="text-3xl font-extrabold text-white tabular-nums">
                  ${policyComparison.baselineTotal}M
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  $14.2M Bunkering + ${(46800 * carbonTaxRate / 1e6).toFixed(2)}M Carbon Tax
                </div>
              </div>

              <div className={`p-6 rounded-sm border transition-all ${
                policyComparison.isGreenCheaper
                  ? 'bg-[#00ff9d]/10 border-[#00ff9d] shadow-[0_0_20px_rgba(0,255,157,0.25)]'
                  : 'bg-[#050811] border-white/10'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold text-[#00ff9d] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Proposed QIEA Green Plan</span>
                  </div>
                  <span className="text-xs text-[#00ff9d]">34,600 tCO₂e</span>
                </div>
                <div className="text-3xl font-extrabold text-white tabular-nums">
                  ${policyComparison.greenTotal}M
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  $16.7M Bunkering + ${(34600 * carbonTaxRate / 1e6).toFixed(2)}M Carbon Tax
                </div>
              </div>
            </div>

            {/* Net Savings Verdict */}
            <div className="mt-8 p-6 rounded-sm bg-[#050811] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-sm flex items-center justify-center font-bold ${
                  policyComparison.isGreenCheaper
                    ? 'bg-[#00ff9d]/20 text-[#00ff9d]'
                    : 'bg-[#ffb703]/20 text-[#ffb703]'
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
                    Avoids ${policyComparison.taxPenaltyAvoided}M in direct regulatory carbon liabilities.
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onLaunchConsole('fuels')}
                className="px-6 py-2.5 rounded-sm bg-[#0b1426] hover:bg-[#111e38] border border-white/10 text-white text-xs tracking-wider uppercase flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <span>TEST IN CONSOLE</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00ff9d]" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT VII: CRYPTOGRAPHIC ESG COMPLIANCE LEDGER
      ===================================================================== */}
      <section className="relative z-10 py-32 px-6 sm:px-12 lg:px-20 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest block mb-3">
                07 // AUDIT VERIFICATION
              </span>
              <h2 className="text-4xl sm:text-6xl font-display font-extrabold uppercase text-white tracking-tight leading-[0.92]">
                Cryptographic ESG Ledger.
              </h2>
              <p className="text-slate-300 mt-4 text-base sm:text-lg font-sans leading-relaxed">
                Every optimization run generates a deterministic SHA-256 verification audit hash documenting modeled alignment with IMO Resolution MEPC.376(80) and FuelEU Maritime standards.
              </p>

              <div className="mt-8 space-y-4 text-sm font-sans text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00ff9d] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">IMO MEPC.376(80) Regulatory Alignment:</strong> Well-to-Tank and Tank-to-Wake emission factors indexed from authoritative regulatory databases (IMO MEPC.376(80), EU ETS Directive 2023/959).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00ff9d] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">FuelEU Maritime Mandates:</strong> Automatic accounting of zero-emission cold-ironing shore power connections at European container berths.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00ff9d] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Audit Export Options:</strong> Printable HTML audit reports, verified JSON ledgers, and live REST API endpoints.
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Ledger Card */}
            <div className="lg:col-span-6 p-8 rounded-sm bg-[#091122] border border-white/10 font-mono">
              <div className="flex items-center justify-between pb-6 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2 text-[#00f0ff]">
                  <Lock className="w-4 h-4" />
                  <span>DETERMINISTIC SIMULATION AUDIT LEDGER</span>
                </div>
                <span className="px-3 py-1 rounded-sm bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/30 font-bold">
                  VERIFIED FEASIBLE
                </span>
              </div>

              <div className="my-6 space-y-4 text-xs">
                <div>
                  <div className="text-slate-400 uppercase text-[10px]">Cryptographic Run Signature</div>
                  <div className="p-3 rounded-sm bg-[#050811] border border-white/10 text-[#00f0ff] break-all mt-1">
                    a4d339247bf2bc7e5c6a1cf88c946e3923d5733f1ff4f53c9e376834b6bdfbf6
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-sm bg-[#050811] border border-white/10">
                    <div className="text-slate-400 uppercase text-[10px]">Run ID</div>
                    <div className="text-white font-bold mt-0.5">run_1790982234_mo_qiea</div>
                  </div>
                  <div className="p-3 rounded-sm bg-[#050811] border border-white/10">
                    <div className="text-slate-400 uppercase text-[10px]">Solution Plan</div>
                    <div className="text-white font-bold mt-0.5">moqiea_g19_i28</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onLaunchConsole('reports')}
                  className="px-6 py-3 rounded-sm bg-[#00f0ff] text-black font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  <FileText className="w-4 h-4" />
                  <span>VIEW AUDIT REPORT</span>
                </motion.button>

                <a
                  href="/api/reports/json/run_1790982234_mo_qiea"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
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
          ACT VIII: FINAL ASYMMETRIC CALL TO ACTION & FOOTER
      ===================================================================== */}
      <section className="relative z-10 py-36 px-6 sm:px-12 lg:px-20 text-center bg-gradient-to-b from-[#050811] to-[#020409]">
        <div className="max-w-4xl mx-auto">
          <div className="w-16 h-16 rounded-sm bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff] mx-auto mb-8 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
            <Compass className="w-8 h-8" />
          </div>

          <h2 className="text-5xl sm:text-7xl font-display font-extrabold uppercase text-white tracking-tight leading-[0.88] mb-6">
            Command Your Fleet.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-12 font-sans">
            Ready to deploy? Launch the live decision support console to simulate real corridor deployments, inspect Pareto frontiers, and download modeled ESG compliance ledgers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onLaunchConsole('operations')}
              className="px-10 py-5 rounded-sm bg-[#00f0ff] text-black font-mono font-bold text-xs tracking-widest uppercase flex items-center gap-3 shadow-[0_0_35px_rgba(0,240,255,0.5)] hover:bg-cyan-300 transition-all"
            >
              <span>ENTER OPERATIONS CONSOLE</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-5 rounded-sm border border-white/20 hover:border-white text-slate-300 font-mono text-xs tracking-wider uppercase bg-[#091122]/60 transition-all flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 text-[#00f0ff]" />
              <span>EXPLORE API DOCS</span>
            </motion.a>
          </div>
        </div>
      </section>

      {/* Persistent Footer */}
      <footer className="relative z-10 py-12 px-6 sm:px-12 lg:px-20 border-t border-white/[0.08] text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          SMART INDIA HACKATHON 2024 • PROBLEM STATEMENT 2 (SIH26138)
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => onLaunchConsole('benchmarks')} className="hover:text-white transition-colors">
            BENCHMARKS
          </button>
          <button onClick={() => onLaunchConsole('reports')} className="hover:text-white transition-colors">
            AUDIT
          </button>
          <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            SWAGGER API
          </a>
        </div>
      </footer>
    </div>
  );
};
