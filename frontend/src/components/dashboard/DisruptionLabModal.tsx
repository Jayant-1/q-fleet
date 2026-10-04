import React, { useState } from 'react';
import {
  AlertTriangle,
  Waves,
  Clock,
  Flame,
  CheckCircle2,
  TrendingUp,
  X,
  RotateCcw,
  Activity,
  Ship,
  ArrowRight
} from '@/components/icons';
import { OptimizeRunResponse, ParetoSolution, CorridorInfo } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeCorridor?: CorridorInfo | null;
  currentOptimization?: OptimizeRunResponse | null;
  onApplyDisruption: (params: {
    weatherMultiplier: number;
    carbonTax: number;
    scenarioName: string;
  }) => void;
}

export const DisruptionLabModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeCorridor,
  currentOptimization,
  onApplyDisruption,
}) => {
  const [selectedIncident, setSelectedIncident] = useState<'monsoon' | 'port_delay' | 'carbon_spike'>('monsoon');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    originalFuel: number;
    disruptedFuel: number;
    originalCost: number;
    disruptedCost: number;
    scheduleStatus: string;
    speedAdjustment: string;
    fuelRecommendation: string;
  } | null>(null);

  if (!isOpen) return null;

  const incidents = [
    {
      id: 'monsoon' as const,
      title: 'Southwest Monsoon Sea-State Escalation',
      subtitle: 'Arabian Sea & Bay of Bengal swell surge (Hs 4.5m, wind 32 kts)',
      icon: Waves,
      impact: 'Weather added drag +38%, requires +1.5 kts speed recovery to prevent laycan breach',
      weatherMult: 1.45,
      carbonTax: 100.0,
    },
    {
      id: 'port_delay' as const,
      title: 'Major Terminal Berth Congestion Delay',
      subtitle: 'Turnaround backlog extending port stay by +48 hours',
      icon: Clock,
      impact: 'Consumes schedule slack; requires speed increase from 14.5 to 16.8 kts',
      weatherMult: 1.15,
      carbonTax: 100.0,
    },
    {
      id: 'carbon_spike' as const,
      title: 'Statutory Carbon Tax & Allowance Surge',
      subtitle: 'EU ETS and IMO carbon levy escalation to $250/ton CO₂e',
      icon: Flame,
      impact: 'Shifts Pareto knee towards Bio-Methanol & Shore Power to eliminate deficit penalties',
      weatherMult: 1.0,
      carbonTax: 250.0,
    },
  ];

  const activeInc = incidents.find((i) => i.id === selectedIncident)!;

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const origF = currentOptimization?.impact_comparison?.optimized_fuel_mt || 12400;
      const origC = currentOptimization?.impact_comparison?.optimized_cost_usd || 16800000;

      let fuelMultiplier = 1.0;
      let costMultiplier = 1.0;
      let spdAdj = '';
      let fuelRec = '';

      if (selectedIncident === 'monsoon') {
        fuelMultiplier = 1.28;
        costMultiplier = 1.22;
        spdAdj = 'Clamped to 16.2 kts across Indian Ocean legs to overcome added wave resistance';
        fuelRec = 'Maintain dual-fuel LNG/VLSFO with auxiliary genset load shifting';
      } else if (selectedIncident === 'port_delay') {
        fuelMultiplier = 1.18;
        costMultiplier = 1.15;
        spdAdj = 'Accelerated transit to 16.8 kts (+1.5 kts) to maintain contractual port arrival laycan';
        fuelRec = 'Prioritize shore power cold-ironing upon arrival to recoup in-port emissions';
      } else {
        fuelMultiplier = 0.95;
        costMultiplier = 1.34;
        spdAdj = 'Slow steaming speed reduction to 13.8 kts (-0.7 kts)';
        fuelRec = 'Optimal Knee switches from 100% VLSFO to 65% Bio-Methanol dual-fuel blend';
      }

      setSimulationResult({
        originalFuel: origF,
        disruptedFuel: Math.round(origF * fuelMultiplier),
        originalCost: origC,
        disruptedCost: Math.round(origC * costMultiplier),
        scheduleStatus: 'Contractual Laycan Satisfied with Heuristic Recovery',
        speedAdjustment: spdAdj,
        fuelRecommendation: fuelRec,
      });
      setIsSimulating(false);
    }, 600);
  };

  const handleApplyToOptimizer = () => {
    onApplyDisruption({
      weatherMultiplier: activeInc.weatherMult,
      carbonTax: activeInc.carbonTax,
      scenarioName: activeInc.title,
    });
    onClose();
  };

  return (
    <div
      data-testid="disruption-lab-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col font-mono text-xs max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-stone-900 font-sans">
                Disruption & Operational Resilience Lab
              </h3>
              <span className="text-[11px] text-stone-400">
                1-Click Incident Injection & Dynamic Schedule Adaptation
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Incident Selector */}
          <div className="space-y-2">
            <span className="text-stone-500 uppercase text-[11px] font-semibold">
              Select Disruption Incident:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {incidents.map((inc) => {
                const isSelected = selectedIncident === inc.id;
                const IconComponent = inc.icon;
                return (
                  <button
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc.id);
                      setSimulationResult(null);
                    }}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/60 shadow-2xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-orange-600' : 'text-stone-500'}`} />
                      <span className="font-bold text-stone-900">{inc.title.split(' ')[0]}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 leading-tight">
                      {inc.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Incident Details */}
          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5">
            <div className="font-semibold text-stone-900">{activeInc.title}</div>
            <div className="text-stone-600 leading-relaxed text-[11px]">{activeInc.impact}</div>
            <div className="flex items-center gap-4 pt-1 text-[11px] text-stone-500">
              <span>Weather Severity: <strong>{activeInc.weatherMult}x</strong></span>
              <span>Carbon Tax: <strong>${activeInc.carbonTax}/t</strong></span>
              <span>Corridor: <strong>{activeCorridor?.name || 'Selected Corridor'}</strong></span>
            </div>
          </div>

          {/* Simulation Output Card */}
          {simulationResult && (
            <div
              data-testid="disruption-simulation-result"
              className="p-4 bg-orange-50/40 rounded-xl border border-orange-200 space-y-3 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                <span className="font-bold text-orange-950 uppercase text-[11px] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-orange-600" />
                  Reactive Dispatch Adaptation
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                  Schedule Recovered
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-white rounded border border-orange-100">
                  <span className="text-[10px] text-stone-400 block uppercase">Projected Bunker Burn</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-stone-400 line-through text-[11px]">
                      {simulationResult.originalFuel.toLocaleString()} MT
                    </span>
                    <ArrowRight className="w-3 h-3 text-stone-400" />
                    <span className="font-bold text-stone-900 text-sm">
                      {simulationResult.disruptedFuel.toLocaleString()} MT
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded border border-orange-100">
                  <span className="text-[10px] text-stone-400 block uppercase">Commercial Cost Impact</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-stone-400 line-through text-[11px]">
                      ${(simulationResult.originalCost / 1e6).toFixed(2)}M
                    </span>
                    <ArrowRight className="w-3 h-3 text-stone-400" />
                    <span className="font-bold text-stone-900 text-sm">
                      ${(simulationResult.disruptedCost / 1e6).toFixed(2)}M
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px] text-stone-700">
                <div>
                  <strong>Speed Action:</strong> {simulationResult.speedAdjustment}
                </div>
                <div>
                  <strong>Bunkering Strategy:</strong> {simulationResult.fuelRecommendation}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!simulationResult ? (
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                data-testid="simulate-disruption-btn"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Simulating Dynamic Reaction...' : 'Simulate Resilience Reaction'}</span>
              </button>
            ) : (
              <button
                onClick={handleApplyToOptimizer}
                data-testid="apply-disruption-btn"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Apply & Re-Run Optimization</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
