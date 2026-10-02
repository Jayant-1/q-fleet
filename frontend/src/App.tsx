import React, { useState, useEffect } from 'react';
import {
  fetchCorridors,
  fetchFleet,
  fetchFuels,
  runOptimization
} from './services/api';
import {
  CorridorInfo,
  VesselInfo,
  FuelSpecification,
  OptimizeRunResponse,
  ParetoSolution
} from './types';
import { HeaderNav, TabKey } from './components/HeaderNav';
import { RouteMap } from './components/RouteMap';
import { FleetMatrix } from './components/FleetMatrix';
import { ParetoExplorer } from './components/ParetoExplorer';
import { FuelPathwayLifecycle } from './components/FuelPathwayLifecycle';
import { PredictionStudio } from './components/PredictionStudio';
import { BenchmarkLab } from './components/BenchmarkLab';
import { ReportViewer } from './components/ReportViewer';
import { ScenarioSandbox } from './components/ScenarioSandbox';
import {
  Compass,
  Layers,
  Activity,
  Cpu,
  Flame,
  FileText,
  Sliders,
  Sparkles,
  Zap,
  TrendingDown,
  Anchor,
  ShieldCheck
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('operations');
  const [corridors, setCorridors] = useState<CorridorInfo[]>([]);
  const [fleet, setFleet] = useState<VesselInfo[]>([]);
  const [fuels, setFuels] = useState<FuelSpecification[]>([]);

  const [optRun, setOptRun] = useState<OptimizeRunResponse | null>(null);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);

  const [isRunningOpt, setIsRunningOpt] = useState<boolean>(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load initial domain data and baseline optimization on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const [cList, fList, fuelList] = await Promise.all([
          fetchCorridors(),
          fetchFleet(),
          fetchFuels(),
        ]);
        setCorridors(cList);
        setFleet(fList);
        setFuels(fuelList);
        if (cList.length > 0) setSelectedRouteId(cList[0].route_id);

        // Run default baseline optimization
        setIsRunningOpt(true);
        const optRes = await runOptimization({
          scenario_id: 'global_liner_2026',
          algorithm: 'MO-QIEA',
          population_size: 30,
          generations: 25,
          carbon_tax_per_ton: 100.0,
          random_seed: 42,
        });
        setOptRun(optRes);
        setSelectedSolutionId(optRes.compromise_solution_id);
      } catch (err: any) {
        console.error('Initialization error:', err);
        setErrorMsg(err.message || 'Failed to initialize system');
      } finally {
        setIsRunningOpt(false);
      }
    };

    initApp();
  }, []);

  const handleRunOptimization = async (params: any) => {
    setIsRunningOpt(true);
    setIsSandboxOpen(false);
    setErrorMsg(null);
    try {
      const res = await runOptimization({
        scenario_id: 'global_liner_2026',
        ...params,
      });
      setOptRun(res);
      setSelectedSolutionId(res.compromise_solution_id);
      setActiveTab('pareto');
    } catch (err: any) {
      setErrorMsg(err.message || 'Optimization run failed');
    } finally {
      setIsRunningOpt(false);
    }
  };

  const activeSolution: ParetoSolution | null =
    optRun?.pareto_front.find((s) => s.solution_id === selectedSolutionId) ||
    optRun?.pareto_front[0] ||
    null;

  return (
    <div className="min-h-screen bg-oceanic-void text-slate-100 flex flex-col font-sans">
      {/* Top Operational Navigation */}
      <HeaderNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isRunningOpt={isRunningOpt}
        onOpenSandbox={() => setIsSandboxOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="bg-red-950/60 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-mono">
            <span>ERROR: {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="underline hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Global Operational Headline Metrics Strip */}
        {activeSolution && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
            <div className="bg-oceanic-hull p-3.5 rounded-xl border border-oceanic-border shadow-lg">
              <span className="text-[10px] uppercase text-slate-400 block tracking-wider">
                Total Fleet Fuel (MTOE)
              </span>
              <div className="text-xl sm:text-2xl font-black text-telemetry-amber mt-0.5">
                {activeSolution.total_fuel_mt.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">MT</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {activeSolution.allocations.length} Active Vessels
              </span>
            </div>

            <div className="bg-oceanic-hull p-3.5 rounded-xl border border-oceanic-border shadow-lg">
              <span className="text-[10px] uppercase text-slate-400 block tracking-wider">
                Total Operating Cost
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-100 mt-0.5">
                ${activeSolution.total_cost_usd.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Includes Bunkering + Charter + Carbon Tax
              </span>
            </div>

            <div className="bg-oceanic-hull p-3.5 rounded-xl border border-telemetry-seafoam/30 glow-emerald shadow-lg">
              <span className="text-[10px] uppercase text-telemetry-seafoam block tracking-wider">
                Lifecycle GHG (Well-to-Wake)
              </span>
              <div className="text-xl sm:text-2xl font-black text-telemetry-seafoam mt-0.5">
                {activeSolution.total_lifecycle_ghg_tco2e.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">tCO₂e</span>
              </div>
              <span className="text-[10px] text-telemetry-seafoam/80 mt-1 block">
                WTT Upstream + TTW Propulsion
              </span>
            </div>

            <div className="bg-oceanic-hull p-3.5 rounded-xl border border-oceanic-border shadow-lg">
              <span className="text-[10px] uppercase text-slate-400 block tracking-wider">
                Corridor Demand Delivery
              </span>
              <div className="text-xl sm:text-2xl font-black text-telemetry-cyan mt-0.5">
                {activeSolution.demand_satisfaction_pct.toFixed(1)}%
              </div>
              <span className="text-[10px] text-telemetry-cyan/80 mt-1 block">
                {activeSolution.is_feasible ? '✓ Zero Cargo Shortfall' : '⚠ Deficit Detected'}
              </span>
            </div>
          </div>
        )}

        {/* Tab 1: Operations (Map + Fleet Matrix) */}
        {activeTab === 'operations' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <RouteMap
              corridors={corridors}
              allocations={activeSolution?.allocations || []}
              selectedRouteId={selectedRouteId}
              onSelectRoute={setSelectedRouteId}
            />

            <FleetMatrix
              fleet={fleet}
              allocations={activeSolution?.allocations || []}
              selectedVesselId={selectedVesselId}
              onSelectVessel={setSelectedVesselId}
            />
          </div>
        )}

        {/* Tab 2: Pareto Trade-offs */}
        {activeTab === 'pareto' && optRun && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <ParetoExplorer
              solutions={optRun.pareto_front}
              selectedSolutionId={selectedSolutionId}
              compromiseSolutionId={optRun.compromise_solution_id}
              onSelectSolution={setSelectedSolutionId}
            />

            <FleetMatrix
              fleet={fleet}
              allocations={activeSolution?.allocations || []}
              selectedVesselId={selectedVesselId}
              onSelectVessel={setSelectedVesselId}
            />
          </div>
        )}

        {/* Tab 3: Prediction Studio */}
        {activeTab === 'prediction' && (
          <div className="animate-in fade-in duration-300">
            <PredictionStudio />
          </div>
        )}

        {/* Tab 4: Alternative Fuels & Shore Power */}
        {activeTab === 'fuels' && (
          <div className="animate-in fade-in duration-300">
            <FuelPathwayLifecycle fuels={fuels} />
          </div>
        )}

        {/* Tab 5: Algorithm Benchmarks */}
        {activeTab === 'benchmarks' && (
          <div className="animate-in fade-in duration-300">
            <BenchmarkLab />
          </div>
        )}

        {/* Tab 6: Audit & Compliance Report */}
        {activeTab === 'reports' && (
          <div className="animate-in fade-in duration-300">
            <ReportViewer
              runId={optRun?.run_id || ''}
              solution={activeSolution}
            />
          </div>
        )}
      </main>

      {/* Policy Simulation Sandbox Modal */}
      <ScenarioSandbox
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
        isRunning={isRunningOpt}
        onRunOptimization={handleRunOptimization}
      />

      {/* Footer */}
      <footer className="border-t border-oceanic-border bg-oceanic-hull/60 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            <span className="text-slate-200 font-bold">SMART INDIA HACKATHON 2024 / PROBLEM STATEMENT 2 (SIH26138)</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Quantum-Inspired Fuel Consumption Prediction and Green Fleet Optimization Platform.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>IMO Resolution MEPC.376(80)</span>
            <span>•</span>
            <span>FuelEU Maritime EU 2023/1805</span>
            <span>•</span>
            <span className="text-telemetry-cyan font-bold">QIEA Engine Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
