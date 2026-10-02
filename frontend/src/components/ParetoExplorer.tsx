import React, { useState } from 'react';
import { ParetoSolution } from '../types';
import { Layers, Sparkles, TrendingDown, Check, Info } from 'lucide-react';

interface ParetoExplorerProps {
  solutions: ParetoSolution[];
  selectedSolutionId: string;
  compromiseSolutionId: string;
  onSelectSolution: (solutionId: string) => void;
}

export const ParetoExplorer: React.FC<ParetoExplorerProps> = ({
  solutions,
  selectedSolutionId,
  compromiseSolutionId,
  onSelectSolution,
}) => {
  const [hoveredSolution, setHoveredSolution] = useState<ParetoSolution | null>(null);

  if (!solutions || solutions.length === 0) {
    return (
      <div className="bg-oceanic-hull border border-oceanic-border rounded-xl p-8 text-center text-slate-400">
        <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-bounce" />
        <p className="text-sm">No Pareto solutions generated yet. Run the optimization engine.</p>
      </div>
    );
  }

  // Calculate scales for SVG projection
  const costs = solutions.map((s) => s.total_cost_usd);
  const ghgs = solutions.map((s) => s.total_lifecycle_ghg_tco2e);
  const fuels = solutions.map((s) => s.total_fuel_mt);

  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);
  const minGhg = Math.min(...ghgs);
  const maxGhg = Math.max(...ghgs);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 340;
  const pad = 50;

  const scaleX = (cost: number) => {
    if (maxCost === minCost) return svgWidth / 2;
    return pad + ((cost - minCost) / (maxCost - minCost)) * (svgWidth - 2 * pad);
  };

  const scaleY = (ghg: number) => {
    if (maxGhg === minGhg) return svgHeight / 2;
    // Lower GHG is better -> top of plot
    return svgHeight - pad - ((ghg - minGhg) / (maxGhg - minGhg)) * (svgHeight - 2 * pad);
  };

  const activeSolution =
    solutions.find((s) => s.solution_id === selectedSolutionId) ||
    solutions.find((s) => s.solution_id === compromiseSolutionId) ||
    solutions[0];

  return (
    <div className="bg-oceanic-hull border border-oceanic-border rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-oceanic-border bg-oceanic-panel/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-telemetry-violet" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
            Multi-Objective Pareto Trade-off Explorer
          </h2>
          <span className="text-xs font-mono text-telemetry-violet bg-telemetry-violet/10 px-2 py-0.5 rounded border border-telemetry-violet/30">
            {solutions.length} Non-Dominated Frontiers
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-telemetry-violet inline-block" />
            <span>Knee Compromise</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-telemetry-cyan inline-block" />
            <span>Alternative Plan</span>
          </span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Scatter Plot (Data as Art) */}
        <div className="lg:col-span-8 bg-[#050914] border border-oceanic-border rounded-lg p-3 relative overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none"
            aria-label="Pareto Frontier Scatter Plot"
          >
            {/* Grid Lines */}
            <line x1={pad} y1={pad} x2={pad} y2={svgHeight - pad} stroke="#1e293b" strokeWidth="1" />
            <line x1={pad} y1={svgHeight - pad} x2={svgWidth - pad} y2={svgHeight - pad} stroke="#1e293b" strokeWidth="1" />

            {/* Axis Labels */}
            <text x={svgWidth / 2} y={svgHeight - 12} fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">
              Total Operating Cost ($ USD) →
            </text>
            <text
              x={-svgHeight / 2}
              y="18"
              fill="#94a3b8"
              fontSize="11"
              fontFamily="monospace"
              textAnchor="middle"
              transform="rotate(-90)"
            >
              ← Well-to-Wake Lifecycle GHG (tCO₂e)
            </text>

            {/* Min / Max Reference Labels */}
            <text x={pad} y={svgHeight - pad + 15} fill="#64748b" fontSize="9" fontFamily="monospace">
              ${(minCost / 1e6).toFixed(1)}M
            </text>
            <text x={svgWidth - pad} y={svgHeight - pad + 15} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
              ${(maxCost / 1e6).toFixed(1)}M
            </text>
            <text x={pad - 6} y={pad + 8} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
              {(maxGhg / 1e3).toFixed(1)}kt
            </text>
            <text x={pad - 6} y={svgHeight - pad - 4} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
              {(minGhg / 1e3).toFixed(1)}kt
            </text>

            {/* Pareto Solutions */}
            {solutions.map((sol) => {
              const x = scaleX(sol.total_cost_usd);
              const y = scaleY(sol.total_lifecycle_ghg_tco2e);
              const isKnee = sol.solution_id === compromiseSolutionId;
              const isSelected = sol.solution_id === selectedSolutionId;

              return (
                <g
                  key={sol.solution_id}
                  className="cursor-pointer transition-transform"
                  onClick={() => onSelectSolution(sol.solution_id)}
                  onMouseEnter={() => setHoveredSolution(sol)}
                  onMouseLeave={() => setHoveredSolution(null)}
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle cx={x} cy={y} r="14" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="3 3" />
                  )}

                  {/* Knee Point Pulse */}
                  {isKnee && (
                    <circle cx={x} cy={y} r="18" fill="none" stroke="#d946ef" strokeWidth="1.5" className="animate-ping" />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isKnee ? '8' : isSelected ? '7' : '5'}
                    fill={isKnee ? '#d946ef' : isSelected ? '#00e5ff' : '#0284c7'}
                    stroke="#070d18"
                    strokeWidth="2"
                    className="hover:scale-125 transition-transform"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Compromise Solution Details Card */}
        <div className="lg:col-span-4 bg-oceanic-panel/70 border border-oceanic-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-telemetry-cyan uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {activeSolution.solution_id === compromiseSolutionId ? 'KNEE COMPROMISE PLAN' : 'INSPECTED PLAN'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-telemetry-seafoam/20 text-telemetry-seafoam">
              {activeSolution.is_feasible ? 'FEASIBLE' : 'PENALIZED'}
            </span>
          </div>

          <div className="space-y-3 font-mono">
            <div className="bg-oceanic-void p-3 rounded border border-oceanic-border">
              <span className="text-[10px] uppercase text-slate-400 block">Lifecycle GHG Emissions (WTW)</span>
              <span className="text-xl font-bold text-telemetry-seafoam">
                {activeSolution.total_lifecycle_ghg_tco2e.toLocaleString()} <span className="text-xs">tCO₂e</span>
              </span>
            </div>

            <div className="bg-oceanic-void p-3 rounded border border-oceanic-border">
              <span className="text-[10px] uppercase text-slate-400 block">Total Operational Cost</span>
              <span className="text-xl font-bold text-slate-100">
                ${activeSolution.total_cost_usd.toLocaleString()}
              </span>
            </div>

            <div className="bg-oceanic-void p-3 rounded border border-oceanic-border">
              <span className="text-[10px] uppercase text-slate-400 block">Total Voyage Fuel Burn</span>
              <span className="text-lg font-bold text-telemetry-amber">
                {activeSolution.total_fuel_mt.toLocaleString()} <span className="text-xs">MT</span>
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-oceanic-border text-xs text-slate-400 flex items-center justify-between">
            <span>Demand Satisfaction:</span>
            <span className="font-mono text-slate-200 font-semibold">
              {activeSolution.demand_satisfaction_pct.toFixed(1)}%
            </span>
          </div>

          <button
            onClick={() => onSelectSolution(activeSolution.solution_id)}
            className="w-full py-2 bg-telemetry-cyan text-oceanic-void rounded font-mono font-bold text-xs hover:bg-telemetry-cyan/90 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            APPLY TO FLEET MATRIX
          </button>
        </div>
      </div>
    </div>
  );
};
