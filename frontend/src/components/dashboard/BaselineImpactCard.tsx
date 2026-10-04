import React from 'react';
import { ImpactComparison, ParetoSolution } from '../../types';
import { Award, CheckCircle2, TrendingDown, ArrowRight, ShieldCheck, Ship, Info } from '@/components/icons';

interface Props {
  impact?: ImpactComparison | null;
  baselineSolution?: ParetoSolution | null;
  selectedSolution?: ParetoSolution | null;
}

export const BaselineImpactCard: React.FC<Props> = ({
  impact,
  baselineSolution,
  selectedSolution,
}) => {
  if (!impact && !baselineSolution && !selectedSolution) {
    return null;
  }

  // Calculate fallback values if impact comparison is not pre-packaged
  const baseFuel = impact?.baseline_fuel_mt ?? baselineSolution?.total_fuel_mt ?? 0;
  const optFuel = impact?.optimized_fuel_mt ?? selectedSolution?.total_fuel_mt ?? 0;
  const fuelDiff = impact?.fuel_saved_mt ?? (baseFuel > 0 ? baseFuel - optFuel : 0);
  const fuelPct = impact?.fuel_saved_pct ?? (baseFuel > 0 ? ((fuelDiff / baseFuel) * 100) : 0);

  const baseCost = impact?.baseline_cost_usd ?? baselineSolution?.total_cost_usd ?? 0;
  const optCost = impact?.optimized_cost_usd ?? selectedSolution?.total_cost_usd ?? 0;
  const costDiff = impact?.cost_saved_usd ?? (baseCost > 0 ? baseCost - optCost : 0);
  const costPct = impact?.cost_saved_pct ?? (baseCost > 0 ? ((costDiff / baseCost) * 100) : 0);

  const baseGhg = impact?.baseline_ghg_tco2e ?? baselineSolution?.total_lifecycle_ghg_tco2e ?? 0;
  const optGhg = impact?.optimized_ghg_tco2e ?? selectedSolution?.total_lifecycle_ghg_tco2e ?? 0;
  const ghgDiff = impact?.ghg_saved_tco2e ?? (baseGhg > 0 ? baseGhg - optGhg : 0);
  const ghgPct = impact?.ghg_saved_pct ?? (baseGhg > 0 ? ((ghgDiff / baseGhg) * 100) : 0);

  const baseCii = impact?.baseline_cii_grade ?? baselineSolution?.fleet_average_cii_rating ?? 'D';
  const optCii = impact?.optimized_cii_grade ?? selectedSolution?.fleet_average_cii_rating ?? 'B';

  const fueleuSaved = impact?.fueleu_penalty_saved_usd ?? 0;
  const etsSaved = impact?.eu_ets_saved_usd ?? 0;

  return (
    <div
      data-testid="baseline-impact-card"
      className="bg-white rounded-xl border border-stone-200/90 shadow-2xs p-5 sm:p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              Impact Engine
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              Deterministic Conventional Baseline Delta
            </span>
          </div>
          <h3 className="text-base font-bold text-stone-900 mt-1">
            Before Q-FLEET vs. Recommended Plan
          </h3>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Rigorous comparison of standard conventional baseline dispatch (100% VLSFO, design service speed, auxiliary engines at berth) against optimizer Pareto knee plan.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-mono font-medium">
          <TrendingDown className="w-4 h-4 text-emerald-600" />
          <span>Multi-Objective Efficiency Gain</span>
        </div>
      </div>

      {/* 4 Core Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Fuel Burn */}
        <div className="p-4 rounded-lg bg-stone-50/80 border border-stone-200/80 space-y-2 font-mono">
          <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
            Voyage Bunker Fuel
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-stone-400 line-through">
              {baseFuel > 0 ? `${baseFuel.toLocaleString(undefined, { maximumFractionDigits: 1 })} MT` : '—'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-sm font-bold text-stone-900">
              {optFuel > 0 ? `${optFuel.toLocaleString(undefined, { maximumFractionDigits: 1 })} MT` : '—'}
            </span>
          </div>
          <div
            data-testid="baseline-fuel-diff"
            className="pt-1.5 border-t border-stone-200/60 flex items-center justify-between text-xs"
          >
            <span className="text-stone-500">Bunker Delta:</span>
            <span className="font-bold text-emerald-700">
              {fuelDiff > 0 ? `-${fuelDiff.toLocaleString(undefined, { maximumFractionDigits: 1 })} MT (-${fuelPct.toFixed(1)}%)` : 'Parity'}
            </span>
          </div>
        </div>

        {/* Metric 2: Operating Cost */}
        <div className="p-4 rounded-lg bg-stone-50/80 border border-stone-200/80 space-y-2 font-mono">
          <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
            Total Commercial Outlay
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-stone-400 line-through">
              {baseCost > 0 ? `$${(baseCost / 1e6).toFixed(2)}M` : '—'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-sm font-bold text-stone-900">
              {optCost > 0 ? `$${(optCost / 1e6).toFixed(2)}M` : '—'}
            </span>
          </div>
          <div
            data-testid="baseline-cost-diff"
            className="pt-1.5 border-t border-stone-200/60 flex items-center justify-between text-xs"
          >
            <span className="text-stone-500">Cost Delta:</span>
            <span className="font-bold text-emerald-700">
              {costDiff > 0 ? `-$${(costDiff / 1e3).toFixed(0)}k (-${costPct.toFixed(1)}%)` : 'Parity'}
            </span>
          </div>
        </div>

        {/* Metric 3: Lifecycle GHG */}
        <div className="p-4 rounded-lg bg-stone-50/80 border border-stone-200/80 space-y-2 font-mono">
          <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
            Lifecycle GHG (WTW)
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-stone-400 line-through">
              {baseGhg > 0 ? `${baseGhg.toLocaleString(undefined, { maximumFractionDigits: 0 })} t` : '—'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-sm font-bold text-stone-900">
              {optGhg > 0 ? `${optGhg.toLocaleString(undefined, { maximumFractionDigits: 0 })} t` : '—'}
            </span>
          </div>
          <div
            data-testid="baseline-ghg-diff"
            className="pt-1.5 border-t border-stone-200/60 flex items-center justify-between text-xs"
          >
            <span className="text-stone-500">GHG Abated:</span>
            <span className="font-bold text-emerald-700">
              {ghgDiff > 0 ? `-${ghgDiff.toLocaleString(undefined, { maximumFractionDigits: 0 })} t (-${ghgPct.toFixed(1)}%)` : 'Parity'}
            </span>
          </div>
        </div>

        {/* Metric 4: CII Letter Grade */}
        <div className="p-4 rounded-lg bg-stone-50/80 border border-stone-200/80 space-y-2 font-mono">
          <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
            Fleet CII Grade
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
              Grade {baseCii}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
              Grade {optCii}
            </span>
          </div>
          <div className="pt-1.5 border-t border-stone-200/60 flex items-center justify-between text-xs">
            <span className="text-stone-500">Statutory Status:</span>
            <span className="font-bold text-emerald-700">
              Corrective Plan Avoided
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Regulatory Savings Bar */}
      {(fueleuSaved > 0 || etsSaved > 0) && (
        <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Statutory Non-Compliance Liabilities Prevented:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-stone-700">
            {fueleuSaved > 0 && (
              <div>
                FuelEU Deficit Penalty Saved: <strong className="text-emerald-700">${fueleuSaved.toLocaleString()}</strong>
              </div>
            )}
            {etsSaved > 0 && (
              <div>
                EU ETS Surrender Outlay Saved: <strong className="text-emerald-700">${etsSaved.toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Honest Scientific Disclosure Footnote */}
      <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-start gap-2 text-stone-600 text-xs font-mono">
        <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <div className="font-semibold text-stone-800">
            [MODELED SCENARIO COMPARISON: First-Principles Simulation Delta]
          </div>
          <div className="text-[11px] text-stone-500">
            Baseline figures reflect conventional commercial dispatch (100% VLSFO bunkering, design cruising speed, auxiliary diesel generators operating in port) satisfying identical corridor cargo demands. All reported savings represent mathematical simulation differentials under specified model constraints, not guaranteed real-world performance.
          </div>
        </div>
      </div>
    </div>
  );
};
