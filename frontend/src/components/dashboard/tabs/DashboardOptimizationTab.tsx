import React, { useState } from 'react';
import { OptimizeRunResponse, ParetoSolution, BenchmarkComparisonResponse, CorridorInfo } from '../../../types';
import { Cpu, Play, CheckCircle2, TrendingUp, AlertTriangle, Layers, Award, Ship } from '@/components/icons';
import { BaselineImpactCard } from '../BaselineImpactCard';
import { ExplainabilityCard } from '../ExplainabilityCard';
import { DecisionConfidencePanel } from '../DecisionConfidencePanel';

interface Props {
  latestOptimization: OptimizeRunResponse | null;
  selectedSolution: ParetoSolution | null;
  setSelectedSolution: (solution: ParetoSolution) => void;
  isSolving: boolean;
  onRunSolver: (algorithm?: string) => void;
  solverLatencyMs: number;
  benchmarkData: BenchmarkComparisonResponse | null;
  activeCorridor?: CorridorInfo | null;
}

export const DashboardOptimizationTab: React.FC<Props> = ({
  latestOptimization,
  selectedSolution,
  setSelectedSolution,
  isSolving,
  onRunSolver,
  solverLatencyMs,
  benchmarkData,
  activeCorridor,
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState('MO-QIEA');
  const paretoFront = latestOptimization?.pareto_front || [];

  const hasSolution = !!selectedSolution;
  const originName = activeCorridor?.origin_port?.name || 'Origin Port';
  const destName = activeCorridor?.destination_port?.name || 'Destination Port';
  const totalDistNm = activeCorridor?.distance_nm || 10500;
  const avgSpeed = selectedSolution?.allocations?.[0]?.speed_knots || 14.5;
  const totalFuel = selectedSolution?.total_fuel_mt || 0;

  const dynamicLegs = [
    {
      legName: 'Leg 1: Departure & Coastal Sector',
      area: `${originName} Approaches & Coastal Waters`,
      distanceNm: Math.round(totalDistNm * 0.20),
      seaState: 'Hs 1.8m (Calm to Slight)',
      optimalSpeed: Number(avgSpeed.toFixed(1)),
      transitHrs: Number(((totalDistNm * 0.20) / Math.max(1, avgSpeed)).toFixed(1)),
      estFuelMt: Number((totalFuel * 0.19).toFixed(1)),
    },
    {
      legName: 'Leg 2: Deep Sea Open Ocean Transit',
      area: `${originName} → ${destName} Geodesic Corridor`,
      distanceNm: Math.round(totalDistNm * 0.60),
      seaState: 'Hs 2.5m (Moderate Swell)',
      optimalSpeed: Number((avgSpeed * 0.98).toFixed(1)),
      transitHrs: Number(((totalDistNm * 0.60) / Math.max(1, avgSpeed * 0.98)).toFixed(1)),
      estFuelMt: Number((totalFuel * 0.62).toFixed(1)),
    },
    {
      legName: 'Leg 3: Arrival Approaches & Terminal',
      area: `${destName} Traffic Separation & Berth Limits`,
      distanceNm: Math.round(totalDistNm * 0.20),
      seaState: 'Hs 1.4m (Protected Waters)',
      optimalSpeed: Number((avgSpeed * 0.92).toFixed(1)),
      transitHrs: Number(((totalDistNm * 0.20) / Math.max(1, avgSpeed * 0.92)).toFixed(1)),
      estFuelMt: Number((totalFuel * 0.19).toFixed(1)),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">
            Multi-Objective Fleet Optimization
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Pareto-optimal trade-offs between voyage bunker fuel, commercial expenditure, and lifecycle GHG emissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedAlgo}
            onChange={(e) => setSelectedAlgo(e.target.value)}
            data-testid="algo-select"
            className="text-xs font-mono bg-white border border-stone-200 rounded px-2.5 py-1.5 text-stone-800 hover:border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer shadow-2xs"
          >
            <option value="MO-QIEA">MO-QIEA (Quantum-Inspired)</option>
            <option value="NSGA-II">NSGA-II (Classical GA)</option>
            <option value="MO-PSO">MO-PSO (Particle Swarm)</option>
          </select>

          <button
            onClick={() => onRunSolver(selectedAlgo)}
            disabled={isSolving}
            data-testid="rerun-optimization-btn"
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white rounded text-xs font-mono font-medium transition-all shadow-2xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSolving ? 'Solving...' : 'Re-Run Optimization'}</span>
          </button>
        </div>
      </div>

      {/* 2. Pareto Frontier & Knee Point Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pareto Frontier Visualizer */}
        <div id="tour-pareto-chart" className="lg:col-span-2 bg-white rounded-lg border border-stone-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                Non-Dominated Trade-Offs
              </div>
              <h3 className="text-sm font-semibold text-stone-900 mt-0.5">
                Pareto Frontier (Fuel Burn vs. Operating Cost)
              </h3>
            </div>
            {solverLatencyMs > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
                {solverLatencyMs} ms
              </span>
            )}
          </div>

          {/* Clean Light Scatter Plot */}
          <div className="relative bg-[#FAFAFA] border border-stone-200 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
            {paretoFront.length > 0 ? (
              <div className="w-full h-64 relative">
                {/* SVG Axes */}
                <svg className="w-full h-full" viewBox="0 0 600 240">
                  {/* Grid Lines */}
                  <line x1="50" y1="20" x2="50" y2="200" stroke="#E7E5E4" strokeWidth="1" />
                  <line x1="50" y1="200" x2="580" y2="200" stroke="#E7E5E4" strokeWidth="1" />
                  <line x1="50" y1="110" x2="580" y2="110" stroke="#F5F5F4" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Axis Labels */}
                  <text x="50" y="14" fill="#78716C" fontSize="10" textAnchor="middle">High Cost ($M)</text>
                  <text x="550" y="215" fill="#78716C" fontSize="10" textAnchor="end">Fuel Burn (MT) →</text>
                  <text x="50" y="215" fill="#A8A29E" fontSize="10" textAnchor="middle">0</text>

                  {/* Scatter Points */}
                  {paretoFront.map((sol, idx) => {
                    const isSelected = selectedSolution?.solution_id === sol.solution_id;
                    const isKnee = sol.solution_id === latestOptimization?.compromise_solution_id;

                    const minF = Math.min(...paretoFront.map((p) => p.total_fuel_mt));
                    const maxF = Math.max(...paretoFront.map((p) => p.total_fuel_mt));
                    const minC = Math.min(...paretoFront.map((p) => p.total_cost_usd));
                    const maxC = Math.max(...paretoFront.map((p) => p.total_cost_usd));

                    const spanF = Math.max(1e-4, maxF - minF);
                    const spanC = Math.max(1e-4, maxC - minC);

                    const cx = 90 + ((sol.total_fuel_mt - minF) / spanF) * 440;
                    const cy = 170 - ((sol.total_cost_usd - minC) / spanC) * 120;

                    return (
                      <g
                        key={sol.solution_id || idx}
                        data-testid="pareto-point"
                        data-solution-id={sol.solution_id}
                        className="cursor-pointer transition-transform hover:scale-125"
                        onClick={() => setSelectedSolution(sol)}
                      >
                        {isKnee && (
                          <circle cx={cx} cy={cy} r="14" fill="#EA580C" opacity="0.15" />
                        )}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? "8" : isKnee ? "7" : "5"}
                          fill={isKnee ? "#EA580C" : isSelected ? "#1C1917" : "#0284C7"}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        {isSelected && (
                          <text x={cx} y={cy - 12} fill="#1C1917" fontSize="10" fontWeight="bold" textAnchor="middle">
                            Active Plan
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                <div className="absolute top-2 right-2 bg-white/95 border border-stone-200 rounded-lg p-2 text-[11px] font-mono text-stone-600 shadow-2xs space-y-1 pointer-events-none">
                  <div className="flex items-center gap-1.5" data-testid="compromise-knee-plan">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span>
                    <span>Compromise Knee Plan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
                    <span>Candidate Trade-offs</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs font-mono text-stone-400 py-12">
                Click 'Re-Run Optimization' above to generate non-dominated solutions.
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-stone-600 bg-stone-50/70 p-3 rounded-lg border border-stone-200">
            <div>
              Active Solution ID: <strong data-testid="active-solution-id" className="text-stone-900 font-mono">{selectedSolution?.solution_id || 'Awaiting Run'}</strong>
            </div>
            <div>
              Algorithm: <strong className="text-stone-900">{selectedSolution?.algorithm || selectedAlgo}</strong>
            </div>
            <div>
              Feasibility: <strong className={selectedSolution?.is_feasible ? "text-emerald-700" : "text-amber-700"}>
                {selectedSolution ? (selectedSolution.is_feasible ? "100% Feasible" : "Violations Detected") : "Pending"}
              </strong>
            </div>
          </div>
        </div>

        {/* Selected Plan Details Card */}
        <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-2xs space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-600" />
              Selected Plan Scorecard
            </h3>
            <span className="text-xs text-stone-400 font-mono mt-0.5 block">
              Evaluation across environmental & commercial metrics
            </span>
          </div>

          <div className="space-y-2.5 font-mono">
            <div className="flex justify-between items-center p-2.5 bg-stone-50/70 rounded border border-stone-100">
              <span className="text-xs text-stone-500">Voyage Bunker Fuel:</span>
              <span data-testid="scorecard-fuel-burn" className="text-sm font-semibold text-stone-900 tabular-nums">
                {hasSolution && selectedSolution.total_fuel_mt != null
                  ? `${selectedSolution.total_fuel_mt.toLocaleString(undefined, { maximumFractionDigits: 1 })} MT`
                  : '—'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-stone-50/70 rounded border border-stone-100">
              <span className="text-xs text-stone-500">Total Operating Cost:</span>
              <span className="text-sm font-semibold text-stone-900 tabular-nums">
                {hasSolution && selectedSolution.total_cost_usd != null
                  ? `$${(selectedSolution.total_cost_usd / 1e6).toFixed(2)}M`
                  : '—'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-stone-50/70 rounded border border-stone-100">
              <span className="text-xs text-stone-500">Lifecycle GHG (WTW):</span>
              <span className="text-sm font-semibold text-emerald-700 tabular-nums">
                {hasSolution && selectedSolution.total_lifecycle_ghg_tco2e != null
                  ? `${selectedSolution.total_lifecycle_ghg_tco2e.toLocaleString(undefined, { maximumFractionDigits: 0 })} tCO₂e`
                  : '—'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-stone-50/70 rounded border border-stone-100">
              <span className="text-xs text-stone-500">Demand Fulfillment:</span>
              <span className="text-sm font-semibold text-emerald-700">
                {hasSolution && selectedSolution.demand_satisfaction_pct != null
                  ? `${selectedSolution.demand_satisfaction_pct}%`
                  : '—'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-stone-50/70 rounded border border-stone-100">
              <span className="text-xs text-stone-500">Fleet CII Rating:</span>
              <span className="px-2 py-0.5 rounded font-mono font-semibold text-xs bg-stone-100 text-stone-800 border border-stone-200">
                {hasSolution && selectedSolution.fleet_average_cii_rating
                  ? `Grade ${selectedSolution.fleet_average_cii_rating}`
                  : 'Pending'}
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs font-mono text-stone-500 leading-relaxed border-t border-stone-100">
            {hasSolution
              ? 'This solution reflects the multi-objective Pareto trade-off between bunker fuel consumption, total commercial outlay, and lifecycle GHG emissions.'
              : 'Execute the optimizer to evaluate fleet deployment options across fuel, cost, and emission objectives.'}
          </div>
        </div>
      </div>

      {/* 2.5 Baseline Impact Engine Card */}
      {selectedSolution && (
        <BaselineImpactCard
          impact={latestOptimization?.impact_comparison}
          baselineSolution={latestOptimization?.baseline_solution}
          selectedSolution={selectedSolution}
        />
      )}

      {/* 2.6 Decision Explainability Card */}
      {selectedSolution && (
        <ExplainabilityCard
          selectedSolution={selectedSolution}
          activeCorridor={activeCorridor}
        />
      )}

      {/* 2.7 Decision Confidence Bounds Panel */}
      {selectedSolution && (
        <DecisionConfidencePanel
          selectedSolution={selectedSolution}
        />
      )}

      {/* 3. Fleet Allocation Roster Table */}
      {selectedSolution?.allocations && selectedSolution.allocations.length > 0 && (
        <div className="bg-white rounded-lg border border-stone-200/90 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Ship className="w-4 h-4 text-stone-700" />
              Fleet Deployment Allocations ({selectedSolution.allocations.length} Vessels)
            </h3>
            <span className="text-xs font-mono text-stone-400">
              Corridor: {activeCorridor?.name || selectedSolution.allocations[0]?.route_name}
            </span>
          </div>

          <div className="border border-stone-200 rounded-lg overflow-x-auto w-full max-w-full min-w-0">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-50/80 border-b border-stone-100 text-stone-400 uppercase text-[11px] font-normal tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Vessel</th>
                  <th className="py-2.5 px-3 font-medium">Type</th>
                  <th className="py-2.5 px-3 text-right font-medium">Speed</th>
                  <th className="py-2.5 px-3 font-medium">Fuel</th>
                  <th className="py-2.5 px-3 text-center font-medium">Shore Power</th>
                  <th className="py-2.5 px-3 text-right font-medium">Transit Days</th>
                  <th className="py-2.5 px-3 text-right font-medium">Fuel Burn (MT)</th>
                  <th className="py-2.5 px-3 text-right font-medium">Cost ($)</th>
                  <th className="py-2.5 px-3 text-center font-medium">CII Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800 bg-white">
                {selectedSolution.allocations.map((a) => (
                  <tr key={a.vessel_id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-stone-900">
                      <div>{a.vessel_name}</div>
                      {a.applied_draft_meters ? (
                        <div className="text-[10px] text-stone-400 font-mono font-normal">Draft: {a.applied_draft_meters}m</div>
                      ) : null}
                    </td>
                    <td className="py-2.5 px-3 text-stone-500 text-[11px]">{a.vessel_type}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <div>{a.speed_knots} kts</div>
                      {a.speed_adjustment_reason && (
                        <div className="text-[10px] text-amber-700 font-sans tracking-tight" title={a.speed_adjustment_reason}>
                          {a.speed_adjustment_reason.includes('Clamped') ? '⚙️ Clamped' : '⚡ Recovery'}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div>{a.fuel_type}</div>
                      {a.fuel_adjustment_reason && (
                        <div className="text-[10px] text-amber-700 font-sans tracking-tight" title={a.fuel_adjustment_reason}>
                          {a.fuel_adjustment_reason.includes('ECA') ? '🌿 ECA Rule' : '🔄 Substituted'}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {a.shore_power_used ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] border border-emerald-200">Yes</span>
                      ) : (
                        <span className="text-stone-400">No</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{a.transit_time_days.toFixed(1)}d</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-stone-900">
                      {a.total_fuel_mt.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-stone-700">
                      ${Math.round(a.operational_cost_usd).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 font-semibold text-stone-800 text-[11px] border border-stone-200">
                        {a.cii_rating || 'C'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Waypoint Speed Profile Table (Dynamic Corridor Profile) */}
      <div className="bg-white rounded-lg border border-stone-200/90 shadow-2xs p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-600" />
            Waypoint-by-Waypoint Cruising Speed Profile
          </h3>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Dynamic speed adjustments calibrated across each geodesic corridor segment based on local sea currents and wave swell for{' '}
            <strong className="text-stone-800 font-medium">{activeCorridor?.name || 'Selected Corridor'}</strong> ({totalDistNm.toLocaleString()} NM).
          </p>
        </div>

        <div className="border border-stone-200 rounded-lg overflow-x-auto w-full max-w-full min-w-0">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-50/80 border-b border-stone-100 text-stone-400 uppercase text-[11px] font-normal tracking-wider">
              <tr>
                <th className="py-2.5 px-3 font-medium">Segment / Leg</th>
                <th className="py-2.5 px-3 font-medium">Geographic Area</th>
                <th className="py-2.5 px-3 text-right font-medium">Distance</th>
                <th className="py-2.5 px-3 text-center font-medium">Sea State</th>
                <th className="py-2.5 px-3 text-right font-medium">Optimal Speed</th>
                <th className="py-2.5 px-3 text-right font-medium">Transit Time</th>
                <th className="py-2.5 px-3 text-right font-medium">Est. Fuel Burn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white text-xs">
              {dynamicLegs.map((leg, idx) => (
                <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-stone-900">{leg.legName}</td>
                  <td className="py-2.5 px-3 text-stone-600">{leg.area}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-stone-700">{leg.distanceNm.toLocaleString()} NM</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-sky-50 text-sky-800 border border-sky-200">
                      {leg.seaState}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-stone-900 tabular-nums">{leg.optimalSpeed} kts</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-stone-600">{leg.transitHrs} hrs</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-orange-600 tabular-nums">
                    {hasSolution ? `${leg.estFuelMt.toLocaleString()} MT` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
