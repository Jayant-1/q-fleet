import React from 'react';

interface Props {
  onEnterCockpit: () => void;
}

const OPTIMIZATION_BENCHMARKS = [
  {
    algorithm: 'MO-QIEA (Proposed)',
    isProposed: true,
    evals: 1050,
    frontSize: 4,
    feasibility: '100.0%',
    hypervolume: '0.1839',
    spread: '0.0254',
    spreadWinner: true,
    minFuel: '10,643.5 MT',
    minGhg: '37,034.4 t',
    runtime: '0.86s',
    role: 'Optimal solution spread & diversity across clean alternative fuels',
  },
  {
    algorithm: 'NSGA-II (Classical Genetic Baseline)',
    isProposed: false,
    evals: 1050,
    frontSize: 2,
    feasibility: '100.0%',
    hypervolume: '0.2366',
    spread: '0.0000',
    spreadWinner: false,
    minFuel: '9,979.4 MT',
    minGhg: '37,035.3 t',
    runtime: '1.50s',
    role: 'Standard non-dominated sorting baseline with crossover & mutation',
  },
  {
    algorithm: 'MO-PSO (Classical Particle Swarm Baseline)',
    isProposed: false,
    evals: 1050,
    frontSize: 2,
    feasibility: '100.0%',
    hypervolume: '0.2577',
    hvWinner: true,
    spread: '0.0000',
    spreadWinner: false,
    minFuel: '9,511.3 MT',
    minGhg: '34,247.4 t',
    runtime: '0.51s',
    role: 'Fast continuous swarm convergence; hypervolume winner',
  },
];

const PREDICTION_BENCHMARKS = [
  {
    model: 'Classical Random Forest',
    type: 'Non-Linear Ensemble Baseline',
    features: '8 / 8',
    r2Sample: '0.6284',
    r2Archive: '0.7350',
    maeSample: '1,190.8 MT',
    latency: '0.018 ms',
    highlight: 'Accuracy Winner (Full 8 Features)',
  },
  {
    model: 'Quantum-Inspired QIEA-GBM',
    type: 'Proposed Rotation-Gate Selection',
    features: '2-3 / 8',
    r2Sample: '0.5734',
    r2Archive: '0.4318',
    maeSample: '1,256.4 MT',
    latency: '0.002 ms',
    highlight: 'Parsimony Winner (Sparse Representation)',
  },
  {
    model: 'Classical Ridge Regression',
    type: 'Linear Regularized Baseline',
    features: '8 / 8',
    r2Sample: '0.3971',
    r2Archive: '0.3812',
    maeSample: '1,736.1 MT',
    latency: '0.000 ms',
    highlight: 'Linear Benchmark',
  },
];

export const BenchmarkTable: React.FC<Props> = ({ onEnterCockpit }) => {
  return (
    <div className="border border-white/10 bg-[#0e0e12] p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#ff6b00]">
            BENCHMARK EVIDENCE // REPRODUCIBLE LEDGER
          </span>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Empirical Multi-Objective & Machine Learning Benchmarks
          </h3>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Matched computational budget (1,050 evaluations per optimizer, N=42 seed). Zero target leakage on EMSA MRV temporal holdout.
          </p>
        </div>

        <button
          onClick={onEnterCockpit}
          className="font-mono text-xs px-4 py-2 bg-white hover:bg-zinc-200 text-black font-semibold uppercase tracking-wider transition-colors cursor-pointer"
        >
          OPEN BENCHMARKS IN DASHBOARD →
        </button>
      </div>

      {/* Part 1: Fleet Optimization Benchmark */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="text-white font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00]" />
            1. Multi-Objective Fleet Dispatch Benchmark (Budget Parity)
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">Budget: 1,050 evals</span>
            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">Seed: 42</span>
            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">Scenario: Global Liner 2026</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/15 text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-3 text-center">Pareto Front</th>
                <th className="py-2.5 px-3 text-center">Feasible %</th>
                <th className="py-2.5 px-3 text-right">Hypervolume (HV)</th>
                <th className="py-2.5 px-3 text-right text-[#ff6b00]">Spread (Δ)</th>
                <th className="py-2.5 px-3 text-right">Min Fuel (MT)</th>
                <th className="py-2.5 px-3 text-right text-emerald-400">Min GHG (t)</th>
                <th className="py-2.5 px-3 text-right">Runtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {OPTIMIZATION_BENCHMARKS.map((a) => (
                <tr key={a.algorithm} className={`hover:bg-white/[0.02] transition-colors ${a.isProposed ? 'bg-white/[0.01]' : ''}`}>
                  <td className="py-3 px-3">
                    <div className="font-sans font-medium text-white text-xs">{a.algorithm}</div>
                    <div className="text-[10px] text-zinc-500 font-sans">{a.role}</div>
                  </td>
                  <td className="py-3 px-3 text-center text-zinc-300 tabular-nums">{a.frontSize}</td>
                  <td className="py-3 px-3 text-center text-emerald-400 tabular-nums">{a.feasibility}</td>
                  <td className={`py-3 px-3 text-right tabular-nums ${a.hvWinner ? 'text-white font-bold' : 'text-zinc-400'}`}>
                    {a.hypervolume} {a.hvWinner && <span className="text-[9px] text-[#ff6b00] ml-0.5">[WINNER]</span>}
                  </td>
                  <td className={`py-3 px-3 text-right tabular-nums ${a.spreadWinner ? 'text-[#ff6b00] font-bold' : 'text-zinc-400'}`}>
                    {a.spread} {a.spreadWinner && <span className="text-[9px] text-emerald-400 ml-0.5">[WINNER]</span>}
                  </td>
                  <td className="py-3 px-3 text-right text-zinc-300 tabular-nums">{a.minFuel}</td>
                  <td className="py-3 px-3 text-right text-emerald-400 tabular-nums">{a.minGhg}</td>
                  <td className="py-3 px-3 text-right text-zinc-400 tabular-nums">{a.runtime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part 2: Empirical Prediction Holdout Benchmark */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="text-white font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            2. EMSA THETIS-MRV Annual Fuel Prediction (2022 Train → 2023 Holdout)
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">25,691 Annual Reports (15,924 Ships)</span>
            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">Split: Temporal Holdout</span>
            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">Zero Target Leakage</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/15 text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Model Architecture</th>
                <th className="py-2.5 px-3">Model Type</th>
                <th className="py-2.5 px-3 text-center">Features Used</th>
                <th className="py-2.5 px-3 text-right">R² (2.5k Sample)</th>
                <th className="py-2.5 px-3 text-right">R² (Full 25.6k Archive)</th>
                <th className="py-2.5 px-3 text-right">MAE (Sample)</th>
                <th className="py-2.5 px-3 text-right">Inference Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {PREDICTION_BENCHMARKS.map((m) => (
                <tr key={m.model} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-sans font-medium text-white text-xs">{m.model}</span>
                    <div className="text-[10px] text-[#ff6b00]">{m.highlight}</div>
                  </td>
                  <td className="py-3 px-3 text-zinc-400 text-[11px]">{m.type}</td>
                  <td className="py-3 px-3 text-center text-zinc-300 tabular-nums">{m.features}</td>
                  <td className="py-3 px-3 text-right text-zinc-200 tabular-nums font-bold">{m.r2Sample}</td>
                  <td className="py-3 px-3 text-right text-zinc-200 tabular-nums font-bold">{m.r2Archive}</td>
                  <td className="py-3 px-3 text-right text-zinc-300 tabular-nums">{m.maeSample}</td>
                  <td className="py-3 px-3 text-right text-cyan-400 tabular-nums">{m.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-[10px] font-mono text-zinc-500">
        <div>
          Data provenance: European Maritime Safety Agency (EMSA) THETIS-MRV 2022–2023 · First-principles Holtrop-Mennen & Kwon (1987) dynamics.
        </div>
        <div className="text-zinc-400">
          Source artifact: <code className="text-zinc-300">docs/benchmark_results.json</code> · All tests reproducible offline via <code className="text-zinc-300">scripts/run_benchmarks.py</code>
        </div>
      </div>
    </div>
  );
};
