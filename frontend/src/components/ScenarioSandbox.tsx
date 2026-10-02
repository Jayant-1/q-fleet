import React, { useState } from 'react';
import { Sliders, X, Play, ShieldAlert, DollarSign, CloudRain, Package, Cpu } from 'lucide-react';

interface ScenarioSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  isRunning: boolean;
  onRunOptimization: (params: {
    algorithm: string;
    population_size: number;
    generations: number;
    carbon_tax_per_ton: number;
    weather_severity_multiplier: number;
    demand_multiplier: number;
    random_seed: number;
  }) => void;
}

export const ScenarioSandbox: React.FC<ScenarioSandboxProps> = ({
  isOpen,
  onClose,
  isRunning,
  onRunOptimization,
}) => {
  const [algorithm, setAlgorithm] = useState<string>('MO-QIEA');
  const [popSize, setPopSize] = useState<number>(35);
  const [generations, setGenerations] = useState<number>(30);
  const [carbonTax, setCarbonTax] = useState<number>(100.0);
  const [weatherMultiplier, setWeatherMultiplier] = useState<number>(1.0);
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.0);
  const [seed, setSeed] = useState<number>(42);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunOptimization({
      algorithm,
      population_size: popSize,
      generations,
      carbon_tax_per_ton: carbonTax,
      weather_severity_multiplier: weatherMultiplier,
      demand_multiplier: demandMultiplier,
      random_seed: seed,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm no-print">
      <div className="bg-oceanic-hull border border-telemetry-cyan/50 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl glow-cyan animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-oceanic-border bg-oceanic-panel/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-telemetry-cyan" />
            <h3 className="font-bold text-slate-100 font-sans text-base">
              Scenario Simulation & Policy Sandbox
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-oceanic-void transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-mono text-xs max-h-[80vh] overflow-y-auto">
          {/* Algorithm Selection */}
          <div>
            <label className="text-slate-300 font-bold block mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-telemetry-cyan" />
              Optimization Engine Algorithm
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'MO-QIEA', label: 'MO-QIEA (Proposed)' },
                { id: 'NSGA-II', label: 'NSGA-II (Baseline)' },
                { id: 'MO-PSO', label: 'MO-PSO (Baseline)' },
              ].map((algo) => (
                <button
                  type="button"
                  key={algo.id}
                  onClick={() => setAlgorithm(algo.id)}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    algorithm === algo.id
                      ? 'bg-telemetry-cyan/20 border-telemetry-cyan text-telemetry-cyan font-bold'
                      : 'bg-oceanic-void border-oceanic-border text-slate-400 hover:text-white'
                  }`}
                >
                  {algo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Parameters: Pop size & Generations */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-oceanic-void p-3 rounded-lg border border-oceanic-border">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Population Size:</span>
                <span className="text-telemetry-cyan font-bold">{popSize}</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={popSize}
                onChange={(e) => setPopSize(parseInt(e.target.value))}
                className="w-full accent-telemetry-cyan"
              />
            </div>
            <div className="bg-oceanic-void p-3 rounded-lg border border-oceanic-border">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Generations:</span>
                <span className="text-telemetry-cyan font-bold">{generations}</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={generations}
                onChange={(e) => setGenerations(parseInt(e.target.value))}
                className="w-full accent-telemetry-cyan"
              />
            </div>
          </div>

          {/* Policy Levers: Carbon Tax */}
          <div className="bg-oceanic-void p-3 rounded-lg border border-oceanic-border">
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-telemetry-amber" />
                Carbon Tax Levy:
              </span>
              <span className="text-telemetry-amber font-bold">${carbonTax.toFixed(0)} / ton CO₂e</span>
            </div>
            <input
              type="range"
              min="0"
              max="250"
              step="10"
              value={carbonTax}
              onChange={(e) => setCarbonTax(parseFloat(e.target.value))}
              className="w-full accent-telemetry-amber"
            />
          </div>

          {/* Market & Weather Levers: Weather Multiplier & Cargo Demand */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-oceanic-void p-3 rounded-lg border border-oceanic-border">
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-slate-400" />
                  Weather Severity:
                </span>
                <span className="text-slate-200 font-bold">{weatherMultiplier.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={weatherMultiplier}
                onChange={(e) => setWeatherMultiplier(parseFloat(e.target.value))}
                className="w-full accent-slate-400"
              />
            </div>
            <div className="bg-oceanic-void p-3 rounded-lg border border-oceanic-border">
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-telemetry-seafoam" />
                  Demand Surge:
                </span>
                <span className="text-telemetry-seafoam font-bold">{demandMultiplier.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={demandMultiplier}
                onChange={(e) => setDemandMultiplier(parseFloat(e.target.value))}
                className="w-full accent-telemetry-seafoam"
              />
            </div>
          </div>

          {/* Reproducibility Seed */}
          <div className="bg-oceanic-void p-3 rounded-lg border border-oceanic-border flex items-center justify-between">
            <span className="text-slate-400">Deterministic Seed (RNG):</span>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value) || 42)}
              className="w-24 bg-oceanic-panel border border-oceanic-border rounded px-2 py-1 text-right text-slate-200"
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isRunning}
            className={`w-full py-3 rounded-xl font-mono font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isRunning
                ? 'bg-telemetry-cyan/20 text-telemetry-cyan border border-telemetry-cyan/40 animate-pulse'
                : 'bg-telemetry-cyan text-oceanic-void hover:bg-telemetry-cyan/90 hover:glow-cyan'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isRunning ? 'OPTIMIZING FLEET...' : `SOLVE WITH ${algorithm}`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
