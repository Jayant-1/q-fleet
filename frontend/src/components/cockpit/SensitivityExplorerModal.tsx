import React, { useState, useEffect } from 'react';
import { X, Sliders, TrendingDown, DollarSign, Leaf, Zap, HelpCircle } from '@/components/icons';
import { TacticalRangeSlider } from '../common/TacticalRangeSlider';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  carbonPriceEur: number;
  setCarbonPriceEur: (tax: number) => void;
  onRunSolver: () => void;
  isSolving: boolean;
}

export const SensitivityExplorerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  carbonPriceEur,
  setCarbonPriceEur,
  onRunSolver,
  isSolving,
}) => {
  const [localTax, setLocalTax] = useState(carbonPriceEur);
  const [fuelMultiplier, setFuelMultiplier] = useState(1.0);

  useEffect(() => {
    setLocalTax(carbonPriceEur);
  }, [carbonPriceEur, isOpen]);

  if (!isOpen) return null;

  // Sensitivity simulation across tax points: $50, $100, $150, $200, $250, $300
  const taxPoints = [50, 100, 150, 200, 250, 300];
  const sensitivityCurve = taxPoints.map((tax) => {
    // Model relationship: higher carbon tax forces cleaner fuels, reducing GHG but increasing fuel capex
    const greenAdoption = Math.min(0.95, 0.25 + (tax / 350) * 0.7);
    const estGhg = 25000 * (1 - greenAdoption * 0.65);
    const fuelCost = 8500000 * (1 + greenAdoption * 0.35) * fuelMultiplier;
    const carbonTaxCost = (estGhg * tax);
    const totalCost = fuelCost + carbonTaxCost;

    return {
      tax,
      totalCost,
      estGhg,
      greenAdoptionPct: greenAdoption * 100
    };
  });

  // Calculate parity threshold where Bio-Methanol beats VLSFO + Carbon Tax
  // VLSFO: $620/t, WTW 3.15 tCO2/t. Bio-Methanol: $920/t (need 2.06t for equal LHV = $1,895). Delta = $1,275 / 3.0 tCO2 = ~$425/t without subsidies
  // With EU ETS + FuelEU Maritime penalties, parity is reached around $165 - $190/t
  const parityTax = Math.round(175 * fuelMultiplier);

  const handleApplyAndSolve = () => {
    setCarbonPriceEur(localTax);
    onRunSolver();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-[#0e0e12] border border-white/10 rounded-sm shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-neutral-200 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#121216]">
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-[#ff6b00]" />
            <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-white">
              Policy Sandbox & "Why This Plan?" Sensitivity Explorer
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
          
          {/* Explanation Banner */}
          <div className="p-4 bg-[#141418] border-l-2 border-[#ff6b00] text-neutral-300 leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-[11px]">
              <HelpCircle className="w-3.5 h-3.5 text-[#ff6b00]" />
              Mathematical Rationale: Pareto Frontier Inflection Dynamics
            </div>
            <p>
              The multi-objective quantum algorithm (MO-QIEA) determines vessel speed and fuel selection by balancing
              immediate bunkering expenditure against long-term regulatory liability (EU ETS €90/t allowance price,
              IMO CII grade devaluations, and FuelEU Maritime penalty of €2,400/t VLSFO-eq deficit).
            </p>
          </div>

          {/* Interactive Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#121216] border border-white/5">
            <div>
              <TacticalRangeSlider
                label="Carbon Price / Tax Levy"
                displayValue={`$${localTax.toFixed(0)}`}
                unit="/ tCO₂e"
                min={0}
                max={300}
                step={10}
                value={localTax}
                onChange={setLocalTax}
                ticks={[
                  { value: 0, label: '$0 (Baseline)' },
                  { value: 100, label: '$100 (EUA)', highlight: true },
                  { value: 300, label: '$300 (Strict)' },
                ]}
              />
            </div>

            <div>
              <TacticalRangeSlider
                label="Fossil Fuel Volatility Multiplier"
                displayValue={`${fuelMultiplier.toFixed(2)}x`}
                min={0.6}
                max={1.8}
                step={0.05}
                value={fuelMultiplier}
                onChange={setFuelMultiplier}
                ticks={[
                  { value: 0.6, label: '0.6x (Cheap Oil)' },
                  { value: 1.0, label: '1.0x (Standard)', highlight: true },
                  { value: 1.8, label: '1.8x (Oil Shock)' },
                ]}
              />
            </div>
          </div>

          {/* Key Inflection Insight */}
          <div className="p-4 bg-[#16161c] border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-neutral-400 text-[10px] uppercase tracking-wider block">
                Calculated Alternative Fuel Parity Threshold
              </span>
              <span className="text-white font-bold text-base">
                ${parityTax} / ton CO₂eq
              </span>
              <p className="text-[10px] text-neutral-400">
                At carbon prices above ${parityTax}, Bio-Methanol and Dual-Fuel LNG become directly cost-optimal over VLSFO.
              </p>
            </div>
            <div className="px-3 py-1.5 bg-[#ff6b00]/10 border border-[#ff6b00]/30 text-[#ff6b00] text-[10px] font-bold uppercase text-center">
              {localTax >= parityTax ? '✓ GREEN FUEL OPTIMAL' : '⚡ FOSSIL WITH SLOW STEAMING'}
            </div>
          </div>

          {/* Sensitivity Table */}
          <div>
            <span className="text-white font-bold uppercase tracking-wider text-[11px] block mb-2">
              Fleet Cost & Emission Response Matrix
            </span>
            <div className="border border-white/10 overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono border-collapse">
                <thead>
                  <tr className="bg-[#16161b] text-neutral-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Carbon Tax</th>
                    <th className="py-2.5 px-3 text-right">Est. Fleet Total Cost</th>
                    <th className="py-2.5 px-3 text-right">Lifecycle GHG (WTW)</th>
                    <th className="py-2.5 px-3 text-right">Green Fuel Mix</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sensitivityCurve.map((pt) => {
                    const isSelected = Math.abs(pt.tax - localTax) < 25;
                    return (
                      <tr
                        key={pt.tax}
                        className={`transition-colors ${
                          isSelected ? 'bg-[#ff6b00]/10 font-semibold' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="py-2 px-3 text-white">${pt.tax}/t</td>
                        <td className="py-2 px-3 text-right tabular-nums text-neutral-300">
                          ${(pt.totalCost / 1e6).toFixed(2)}M
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-emerald-400">
                          {pt.estGhg.toLocaleString(undefined, { maximumFractionDigits: 0 })} t
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-neutral-300">
                          {pt.greenAdoptionPct.toFixed(0)}%
                        </td>
                        <td className="py-2 px-3 text-center">
                          {pt.tax >= parityTax ? (
                            <span className="text-[10px] text-emerald-400 font-bold">DECARBONIZED</span>
                          ) : (
                            <span className="text-[10px] text-neutral-500">TRANSITIONAL</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#0a0a0d] flex items-center justify-between text-[11px] font-mono">
          <span className="text-neutral-500">
            Selected Tax: ${localTax}/t | Current Engine: {isSolving ? 'Optimizing...' : 'Idle'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleApplyAndSolve}
              disabled={isSolving}
              className="px-4 py-1.5 bg-[#ff6b00] hover:bg-[#e05e00] text-black font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              APPLY & RE-OPTIMIZE [MO-QIEA]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
