import React, { useState, useEffect } from 'react';
import { useGlobalDispatchState } from '../../store/useDispatchStore';
import { DashboardOverviewTab } from './tabs/DashboardOverviewTab';
import { DashboardPhysicsTab } from './tabs/DashboardPhysicsTab';
import { DashboardOptimizationTab } from './tabs/DashboardOptimizationTab';
import { DashboardComplianceTab } from './tabs/DashboardComplianceTab';
import { DashboardDirectoryTab } from './tabs/DashboardDirectoryTab';
import { WelcomeOnboardingModal } from '../tour/WelcomeOnboardingModal';
import { InteractiveTaskWalkthrough } from '../tour/InteractiveTaskWalkthrough';
import { DisruptionLabModal } from './DisruptionLabModal';
import { QFleetLogo } from '../brand/QFleetLogo';
import {
  Ship,
  Compass,
  Play,
  FileDown,
  Sparkles,
  Layers,
  Gauge,
  TrendingUp,
  Award,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from '@/components/icons';

interface Props {
  store: ReturnType<typeof useGlobalDispatchState>;
  onNavigateLanding: (e?: React.MouseEvent) => void;
  onNavigateJudge?: () => void;
}

export const FleetDashboard: React.FC<Props> = ({ store, onNavigateLanding, onNavigateJudge }) => {
  const {
    corridors,
    activeCorridorId,
    setActiveCorridorId,
    activeCorridor,
    fleet,
    setFleet,
    selectedVesselId,
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
    executeQuantumSolver,
    triggerPdfExport,
  } = store;

  // Active Tab: overview | physics | optimization | compliance | directory
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Tour State
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false);
  const [isDisruptionOpen, setIsDisruptionOpen] = useState(false);

  // Auto-prompt Welcome Modal on first visit
  useEffect(() => {
    const welcomed = localStorage.getItem('qfleet_welcomed_v1');
    if (!welcomed) {
      setIsWelcomeOpen(true);
      localStorage.setItem('qfleet_welcomed_v1', 'true');
    }
  }, []);

  const handleApplyDisruption = (params: { weatherMultiplier: number; carbonTax: number; scenarioName: string }) => {
    setWaveHeight(Number((params.weatherMultiplier * 2.0).toFixed(1)));
    setCarbonPriceEur(Number((params.carbonTax * 0.925).toFixed(0)));
    executeQuantumSolver();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] font-sans antialiased flex flex-col selection:bg-orange-100 selection:text-orange-900 w-full max-w-full overflow-x-hidden">
      {/* 1. Spacious Minimalist Top Navigation Header (Height: 56px-64px) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/60 sticky top-0 z-40 w-full max-w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
          {/* Left: Clean Brand & Back Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
            <button
              onClick={(e) => onNavigateLanding(e)}
              data-testid="back-to-landing-btn"
              className="text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1 text-xs font-mono group py-1 cursor-pointer select-none"
              title="Return to Presentation Landing Page"
            >
              <span className="transition-transform group-hover:-translate-x-0.5 text-stone-600">←</span>
              <span className="hidden xs:inline">Landing</span>
            </button>

            <div className="h-4 w-px bg-stone-200 hidden xs:block" />

            <div className="flex items-center gap-1 sm:gap-2 select-none">
              <QFleetLogo
                className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 hover:scale-105 transition-transform cursor-pointer"
                color="#ff6b00"
                dotColor="#1c1917"
                title="Return to Presentation Landing Page"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigateLanding();
                  }
                }}
                onClick={(e) => {
                  onNavigateLanding(e);
                }}
              />
              <span
                onClick={(e) => {
                  onNavigateLanding(e);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigateLanding();
                  }
                }}
                title="Return to Presentation Landing Page"
                className="font-semibold text-xs sm:text-sm tracking-tight text-stone-900 hover:text-[#ff6b00] transition-colors font-mono uppercase select-none cursor-pointer"
              >
                Q-FLEET
              </span>
              <span className="text-xs font-mono text-stone-400 hidden sm:inline select-none cursor-default">
                / Console
              </span>
              <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/60 ml-0.5 select-none pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          </div>

          {/* Right: Route Selector & Key Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Contextual Corridor Selector */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-mono text-stone-400">Route:</span>
              <select
                value={activeCorridorId}
                onChange={(e) => setActiveCorridorId(e.target.value)}
                data-testid="corridor-selector"
                className="text-xs font-mono bg-stone-50 border border-stone-200 hover:border-stone-300 rounded-md px-3 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 max-w-[260px] truncate transition-colors cursor-pointer shadow-2xs"
              >
                {corridors.map((c) => (
                  <option key={c.route_id} value={c.route_id}>
                    {c.name} ({c.distance_nm} NM)
                  </option>
                ))}
              </select>
            </div>

            {/* Tour Launcher */}
            <button
              onClick={() => setIsWalkthroughActive(true)}
              className="px-2 py-1 text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-md transition-colors hidden sm:inline-block cursor-pointer"
              title="Interactive Product Tour"
            >
              Tour
            </button>

            {/* Judge Mode Button */}
            {onNavigateJudge && (
              <button
                onClick={onNavigateJudge}
                data-testid="nav-judge-mode-btn"
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-2xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Enter 3-Minute Guided Judge Evaluation Mode"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Judge Mode</span>
              </button>
            )}

            {/* Disruption Lab Launcher */}
            <button
              onClick={() => setIsDisruptionOpen(true)}
              data-testid="nav-disruption-lab-btn"
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-[11px] sm:text-xs font-mono font-medium transition-colors border border-stone-200 cursor-pointer hidden md:flex items-center gap-1 whitespace-nowrap"
              title="Open Disruption & Operational Resilience Lab"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Disruption Lab</span>
            </button>

            {/* Export PDF */}
            <button
              id="tour-export-pdf"
              onClick={triggerPdfExport}
              disabled={isOptimizationStale}
              data-testid="export-pdf-btn"
              className={`px-2 sm:px-3 py-1 sm:py-1.5 border rounded-md text-[11px] sm:text-xs font-medium transition-colors shadow-2xs whitespace-nowrap ${
                isOptimizationStale
                  ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700'
              }`}
              title={
                isOptimizationStale
                  ? 'Parameters modified. Re-run optimization to export updated dispatch PDF.'
                  : 'Download IMO compliance voyage dispatch report (PDF)'
              }
            >
              <span className="hidden sm:inline">Export </span>PDF
            </button>

            {/* Run Optimization */}
            <button
              id="tour-run-optimization"
              onClick={() => executeQuantumSolver()}
              disabled={isSolving}
              data-testid="run-optimization-btn"
              data-stale={isOptimizationStale ? "true" : "false"}
              className="relative px-2 sm:px-3 py-1 sm:py-1.5 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white rounded-md text-[11px] sm:text-xs font-mono font-medium transition-all shadow-2xs flex items-center gap-1 sm:gap-1.5 disabled:opacity-50 whitespace-nowrap"
            >
              {isOptimizationStale && (
                <span
                  data-testid="stale-indicator"
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0"
                  title="Parameters modified"
                />
              )}
              <span>{isSolving ? 'Solving...' : <><span className="hidden sm:inline">Run </span>Optimize</>}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Breathable, Clean Tab Navigation */}
      <nav className="bg-white border-b border-stone-200/60 sticky top-14 sm:top-16 z-30 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center gap-3 sm:gap-8 overflow-x-auto min-w-0 no-scrollbar py-0.5">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'physics', label: 'Naval Physics' },
              { id: 'optimization', label: 'Pareto Optimization' },
              { id: 'compliance', label: 'Compliance & CII' },
              { id: 'directory', label: 'Fleet Directory' },
            ].map((tab) => (
              <button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 sm:py-3.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap border-b-2 shrink-0 ${
                  activeTab === tab.id
                    ? 'border-stone-900 text-stone-900 font-semibold'
                    : 'border-transparent text-stone-400 hover:text-stone-700 hover:border-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 3. Main Operational Tab Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-5 sm:py-8 min-w-0 overflow-x-hidden">
        {activeTab === 'overview' && (
          <DashboardOverviewTab
            corridors={corridors}
            activeCorridorId={activeCorridorId}
            setActiveCorridorId={setActiveCorridorId}
            activeCorridor={activeCorridor}
            fleet={fleet}
            selectedSolution={selectedParetoSolution}
            speedKnots={speedKnots}
            carbonPriceEur={carbonPriceEur}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'physics' && (
          <DashboardPhysicsTab
            activeVessel={activeVessel}
            speedKnots={speedKnots}
            setSpeedKnots={setSpeedKnots}
            draftMeters={draftMeters}
            setDraftMeters={setDraftMeters}
            waveHeight={waveHeight}
            setWaveHeight={setWaveHeight}
            calc={hydrodynamics}
            onNavigateTab={setActiveTab}
            onRunSolver={() => executeQuantumSolver()}
          />
        )}

        {activeTab === 'optimization' && (
          <DashboardOptimizationTab
            latestOptimization={latestOptimization}
            selectedSolution={selectedParetoSolution}
            setSelectedSolution={setSelectedParetoSolution}
            isSolving={isSolving}
            onRunSolver={executeQuantumSolver}
            solverLatencyMs={solverLatencyMs}
            benchmarkData={benchmarkData}
            activeCorridor={activeCorridor}
          />
        )}

        {activeTab === 'compliance' && (
          <DashboardComplianceTab
            selectedSolution={selectedParetoSolution}
            selectedFuel={selectedFuel}
            setSelectedFuel={setSelectedFuel}
            carbonPriceEur={carbonPriceEur}
            setCarbonPriceEur={setCarbonPriceEur}
            fuels={fuels}
          />
        )}

        {activeTab === 'directory' && (
          <DashboardDirectoryTab
            fleet={fleet}
            setFleet={setFleet}
            corridors={corridors}
          />
        )}
      </main>

      {/* 4. First-Time Welcome Modal */}
      <WelcomeOnboardingModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        onStartWalkthrough={() => setIsWalkthroughActive(true)}
      />

      {/* 5. Interactive Hands-On Task Walkthrough */}
      <InteractiveTaskWalkthrough
        isActive={isWalkthroughActive}
        onClose={() => setIsWalkthroughActive(false)}
        currentTab={activeTab}
        onSwitchTab={setActiveTab}
      />

      {/* 6. Disruption & Operational Resilience Lab Modal */}
      <DisruptionLabModal
        isOpen={isDisruptionOpen}
        onClose={() => setIsDisruptionOpen(false)}
        activeCorridor={activeCorridor}
        currentOptimization={latestOptimization}
        onApplyDisruption={handleApplyDisruption}
      />
    </div>
  );
};
