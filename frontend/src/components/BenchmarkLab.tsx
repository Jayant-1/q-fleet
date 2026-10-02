import React, { useState, useEffect } from 'react';
import { fetchBenchmarks } from '../services/api';
import { BenchmarkComparisonResponse } from '../types';
import { Cpu, Trophy, TrendingUp, Clock, CheckCircle, BarChart3, RefreshCw } from 'lucide-react';

export const BenchmarkLab: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [benchmark, setBenchmark] = useState<BenchmarkComparisonResponse | null>(null);

  const loadData = async (runNew = false) => {
    setLoading(true);
    try {
      const res = await fetchBenchmarks(runNew ? { population_size: 30, generations: 25, random_seed: 42 } : undefined);
      setBenchmark(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  return (
    <div className="bg-oceanic-hull border border-oceanic-border rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-oceanic-border bg-oceanic-panel/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-telemetry-cyan" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
            Optimization Benchmark Lab: Quantum-Inspired vs Classical Baselines
          </h2>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1 bg-oceanic-void hover:bg-oceanic-panel text-slate-200 border border-oceanic-border rounded text-xs font-mono transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'RUNNING BENCHMARK...' : 'RE-RUN BENCHMARK'}</span>
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Metric Cards Comparison */}
        {benchmark && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {benchmark.algorithms_compared.map((algo) => {
              const isQiea = algo.algorithm.includes('QIEA');
              const isWinnerHv = benchmark.winner_hypervolume === algo.algorithm;

              return (
                <div
                  key={algo.algorithm}
                  className={`p-4 rounded-xl border relative overflow-hidden ${
                    isQiea
                      ? 'bg-gradient-to-b from-oceanic-panel to-oceanic-void border-telemetry-cyan/50 glow-cyan'
                      : 'bg-oceanic-panel/60 border-oceanic-border'
                  }`}
                >
                  {isWinnerHv && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                      <Trophy className="w-3 h-3" /> BEST HV
                    </div>
                  )}

                  <h3 className="font-bold text-slate-100 text-sm mb-3 font-sans">
                    {algo.algorithm}
                  </h3>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Hypervolume (HV):</span>
                      <span className="font-bold text-telemetry-cyan">{algo.hypervolume.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Spacing / Spread (Δ):</span>
                      <span className="font-bold text-slate-200">{algo.spacing_spread.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Pareto Front Size:</span>
                      <span className="font-bold text-slate-200">{algo.pareto_front_size} solutions</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Min Fuel Solution:</span>
                      <span className="font-bold text-telemetry-amber">{algo.min_fuel_mt.toLocaleString()} MT</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Min Lifecycle GHG:</span>
                      <span className="font-bold text-telemetry-seafoam">{algo.min_lifecycle_ghg_tco2e.toLocaleString()} t</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Feasibility Rate:</span>
                      <span className="font-bold text-slate-200">{algo.feasibility_rate_pct.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-2 border-t border-oceanic-border text-[11px]">
                      <span>Wall-clock Runtime:</span>
                      <span className="text-slate-300">{algo.execution_time_seconds.toFixed(2)}s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Convergence Curves SVG Chart (Data as Art) */}
        {benchmark && benchmark.algorithms_compared[0]?.convergence_curve && (
          <div className="bg-[#050914] border border-oceanic-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-telemetry-cyan" />
                Hypervolume Convergence Trajectory Across Generations
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-telemetry-cyan">
                  <span className="w-3 h-0.5 bg-telemetry-cyan inline-block" /> MO-QIEA
                </span>
                <span className="flex items-center gap-1.5 text-telemetry-amber">
                  <span className="w-3 h-0.5 bg-telemetry-amber inline-block" /> NSGA-II
                </span>
                <span className="flex items-center gap-1.5 text-telemetry-seafoam">
                  <span className="w-3 h-0.5 bg-telemetry-seafoam inline-block" /> MO-PSO
                </span>
              </div>
            </div>

            <div className="w-full aspect-[21/9] min-h-[220px]">
              <svg viewBox="0 0 600 200" className="w-full h-full select-none">
                {/* Grid Lines */}
                <line x1="40" y1="20" x2="40" y2="170" stroke="#1e293b" strokeWidth="1" />
                <line x1="40" y1="170" x2="580" y2="170" stroke="#1e293b" strokeWidth="1" />
                <text x="35" y="25" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">HV Max</text>
                <text x="35" y="170" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">0.0</text>
                <text x="580" y="185" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">Generations →</text>

                {/* Plot each algorithm curve */}
                {benchmark.algorithms_compared.map((algo, aIdx) => {
                  const curve = algo.convergence_curve;
                  if (!curve || curve.length < 2) return null;

                  const color = aIdx === 0 ? '#00e5ff' : aIdx === 1 ? '#f59e0b' : '#10b981';
                  const maxGen = curve.length;
                  const pts = curve.map((c, i) => {
                    const x = 40 + (i / (maxGen - 1)) * 540;
                    const y = 170 - c.hypervolume * 150;
                    return `${x},${y}`;
                  });

                  return (
                    <g key={algo.algorithm}>
                      <polyline
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={pts.join(' ')}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Methodology & Disclosure */}
        <div className="p-3 rounded-lg bg-oceanic-panel/40 border border-oceanic-border text-xs text-slate-400 font-mono space-y-1">
          <div className="font-bold text-slate-300 uppercase tracking-wider">Methodology & Budget Parity Standard:</div>
          <p>{benchmark?.methodology_notes}</p>
          <div className="text-[10px] text-telemetry-cyan pt-1">
            Data Provenance: {benchmark?.data_provenance}
          </div>
        </div>
      </div>
    </div>
  );
};
