import React, { useState } from 'react';
import { FuelType, VesselInfo, ParetoSolution } from '../../types';
import { TacticalRangeSlider } from '../common/TacticalRangeSlider';

interface Props {
  fleet: VesselInfo[];
  selectedFuel: FuelType;
  setSelectedFuel: (fuel: FuelType) => void;
  carbonPriceEur: number;
  setCarbonPriceEur: (p: number) => void;
  selectedSolution?: ParetoSolution | null;
}

const FUEL_OPTIONS: { code: FuelType; label: string; wtw: number; bunkerUsd: number }[] = [
  { code: 'VLSFO', label: 'VLSFO (Fossil)', wtw: 91.5, bunkerUsd: 620 },
  { code: 'LNG', label: 'Fossil LNG', wtw: 78.0, bunkerUsd: 740 },
  { code: 'BIO_METHANOL', label: 'Bio-Methanol', wtw: 18.4, bunkerUsd: 1100 },
  { code: 'GREEN_NH3', label: 'Green Ammonia', wtw: 4.2, bunkerUsd: 1350 },
  { code: 'GREEN_H2', label: 'Liquid Hydrogen', wtw: 0.0, bunkerUsd: 1900 },
];

export const RegulatoryDock: React.FC<Props> = ({
  fleet,
  selectedFuel,
  setSelectedFuel,
  carbonPriceEur,
  setCarbonPriceEur,
  selectedSolution,
}) => {
  const [activeTab, setActiveTab] = useState<'fuel' | 'cii' | 'fleet'>('fuel');

  // Selected fuel object
  const currentFuel = FUEL_OPTIONS.find((f) => f.code === selectedFuel) || FUEL_OPTIONS[0];

  // Baseline voyage calculations
  const voyageFuelMt = selectedSolution ? selectedSolution.total_fuel_mt : 2240;
  const carbonTons = currentFuel.code === 'VLSFO' ? voyageFuelMt * 3.151 : currentFuel.code === 'LNG' ? voyageFuelMt * 2.75 : currentFuel.code === 'BIO_METHANOL' ? voyageFuelMt * 0.2 : 0;
  const carbonTaxEur = selectedSolution?.total_eu_ets_cost_usd !== undefined ? Math.round(selectedSolution.total_eu_ets_cost_usd) : Math.round(carbonTons * carbonPriceEur);
  const bunkerCostUsd = selectedSolution ? Math.round(selectedSolution.total_cost_usd) : Math.round(voyageFuelMt * currentFuel.bunkerUsd);
  const fueleuPenaltyEur = selectedSolution?.total_fueleu_penalty_usd || 0;

  // CII Score
  const ciiGco2PerDwtNm = currentFuel.code === 'VLSFO' ? 4.92 : currentFuel.code === 'LNG' ? 4.15 : currentFuel.code === 'BIO_METHANOL' ? 1.25 : 0.4;
  const defaultGrade = ciiGco2PerDwtNm > 4.5 ? 'D' : ciiGco2PerDwtNm > 3.8 ? 'C' : ciiGco2PerDwtNm > 2.5 ? 'B' : 'A';
  const ciiGrade = selectedSolution?.fleet_average_cii_rating || defaultGrade;

  return (
    <aside className="w-80 lg:w-88 bg-[#0c0c0f] border-l border-white/10 flex flex-col justify-between overflow-y-auto select-none p-4 text-xs font-mono">
      <div className="space-y-4">
        {/* Dock Header & Tabs */}
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <div className="flex bg-[#18181e] p-0.5 border border-white/10">
            <button
              onClick={() => setActiveTab('fuel')}
              className={`px-2.5 py-0.5 uppercase tracking-wider text-[10px] transition-all ${
                activeTab === 'fuel' ? 'bg-[#ff6b00] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              FUELS
            </button>
            <button
              onClick={() => setActiveTab('cii')}
              className={`px-2.5 py-0.5 uppercase tracking-wider text-[10px] transition-all ${
                activeTab === 'cii' ? 'bg-[#ff6b00] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              IMO CII
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-2.5 py-0.5 uppercase tracking-wider text-[10px] transition-all ${
                activeTab === 'fleet' ? 'bg-[#ff6b00] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              FLEET
            </button>
          </div>

          <span className="text-[10px] text-zinc-500 uppercase">EU ETS 2026</span>
        </div>

        {/* TAB 1: FUELS & LIFECYCLE EMISSIONS */}
        {activeTab === 'fuel' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Bunker Fuel Selection
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {FUEL_OPTIONS.map((f) => (
                  <button
                    key={f.code}
                    onClick={() => setSelectedFuel(f.code)}
                    className={`p-2 border text-left flex justify-between items-center transition-all ${
                      selectedFuel === f.code
                        ? 'border-[#ff6b00] bg-[#1a1410] text-white'
                        : 'border-white/5 bg-[#121216] text-zinc-400 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{f.label}</div>
                      <div className="text-[9px] text-zinc-500">WtW: {f.wtw} gCO2e/MJ</div>
                    </div>
                    <span className="font-bold tabular-nums text-xs">${f.bunkerUsd}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* EU ETS Carbon Price Slider */}
            <div className="pt-2 border-t border-white/5">
              <TacticalRangeSlider
                label="EU ETS Carbon Tax"
                displayValue={`€${carbonPriceEur}`}
                unit="/ TONNE"
                min={50}
                max={150}
                step={5}
                value={carbonPriceEur}
                onChange={setCarbonPriceEur}
                ticks={[
                  { value: 50, label: '€50' },
                  { value: 85, label: '€85 (2026)', highlight: true },
                  { value: 150, label: '€150' },
                ]}
              />
            </div>

            {/* Cost Exposure Ledger */}
            <div className="bg-[#121216] border border-white/5 p-3 space-y-2">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider pb-1 border-b border-white/5">
                VOYAGE REGULATORY EXPOSURE
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Total Bunker Cost:</span>
                <span className="text-white font-bold tabular-nums">${(bunkerCostUsd / 1e6).toFixed(2)}M</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">ETS Carbon Obligation:</span>
                <span className={`font-bold tabular-nums ${carbonTaxEur > 0 ? 'text-[#ff6b00]' : 'text-emerald-400'}`}>
                  {carbonTaxEur > 0 ? `€${(carbonTaxEur / 1e3).toFixed(1)}k` : '€0.00 (Exempt)'}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">FuelEU Deficit Penalty:</span>
                <span className={`font-bold tabular-nums ${fueleuPenaltyEur > 0 ? 'text-[#ff6b00]' : 'text-emerald-400'}`}>
                  {fueleuPenaltyEur > 0 ? `€${(fueleuPenaltyEur / 1e3).toFixed(1)}k` : '€0.00 (Compliant)'}
                </span>
              </div>
              <div className="flex justify-between text-[11px] pt-1.5 border-t border-white/10 font-bold">
                <span className="text-zinc-300">Total Voyage Outlay:</span>
                <span className="text-white tabular-nums">
                  ${((bunkerCostUsd + (carbonTaxEur * 1.08) + (fueleuPenaltyEur * 1.08)) / 1e6).toFixed(2)}M
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IMO CII AUDITOR */}
        {activeTab === 'cii' && (
          <div className="space-y-4">
            <div className="bg-[#121216] border border-white/5 p-4 text-center space-y-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">
                {selectedSolution ? 'OPTIMIZED FLEET CII RATING' : 'ANNUAL CII RATING'}
              </span>
              <div
                className={`text-5xl font-extrabold ${
                  ciiGrade === 'A'
                    ? 'text-emerald-400'
                    : ciiGrade === 'B'
                    ? 'text-teal-400'
                    : ciiGrade === 'C'
                    ? 'text-yellow-400'
                    : 'text-[#ff6b00]'
                }`}
              >
                {ciiGrade}
              </div>
              <div className="text-[10px] text-zinc-400">
                Carbon Intensity: <span className="text-white font-bold">{ciiGco2PerDwtNm}</span> gCO2/DWT-NM
              </div>
              {selectedSolution?.cii_grade_counts && (
                <div className="flex justify-center gap-1.5 pt-2 border-t border-white/5 text-[10px]">
                  {Object.entries(selectedSolution.cii_grade_counts).map(([grade, count]) => (
                    <span
                      key={grade}
                      className={`px-1.5 py-0.5 border ${
                        grade === 'A' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' :
                        grade === 'B' ? 'text-teal-400 border-teal-500/30 bg-teal-950/20' :
                        grade === 'C' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20' :
                        'text-[#ff6b00] border-[#ff6b00]/30 bg-[#ff6b00]/10'
                      }`}
                    >
                      {grade}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                IMO Decarbonization Boundaries (2026)
              </div>
              <div className="space-y-1 font-mono text-[10px]">
                <div className="flex justify-between p-1.5 bg-emerald-950/40 border border-emerald-800/30 text-emerald-300">
                  <span>Grade A (Superior)</span>
                  <span>&lt; 2.50</span>
                </div>
                <div className="flex justify-between p-1.5 bg-teal-950/40 border border-teal-800/30 text-teal-300">
                  <span>Grade B (Minor)</span>
                  <span>2.50 – 3.80</span>
                </div>
                <div className="flex justify-between p-1.5 bg-yellow-950/40 border border-yellow-800/30 text-yellow-300">
                  <span>Grade C (Standard)</span>
                  <span>3.80 – 4.50</span>
                </div>
                <div className="flex justify-between p-1.5 bg-[#ff6b00]/10 border border-[#ff6b00]/30 text-[#ff6b00]">
                  <span>Grade D/E (Corrective Action)</span>
                  <span>&gt; 4.50</span>
                </div>
              </div>
            </div>

            <div className="bg-[#121216] border border-white/5 p-3 text-[10px] text-zinc-400 leading-relaxed font-sans">
              Under IMO MEPC.328(76), three consecutive Grade D ratings or one Grade E rating requires a mandatory Ship Energy Efficiency Management Plan (SEEMP Part III) corrective overhaul.
            </div>
          </div>
        )}

        {/* TAB 3: FLEET ALLOCATION MATRIX */}
        {activeTab === 'fleet' && (
          <div className="space-y-3">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
              Fleet Assignment Roster ({fleet.length} Vessels)
            </div>
            <div className="space-y-2">
              {fleet.slice(0, 4).map((v) => (
                <div key={v.vessel_id} className="p-2.5 bg-[#121216] border border-white/5 space-y-1">
                  <div className="flex justify-between text-white font-semibold">
                    <span>{v.name}</span>
                    <span className="text-[10px] text-[#ff6b00]">{v.vessel_type}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>DWT: {v.dwt.toLocaleString()} MT</span>
                    <span>Baseline CII: {v.cii_rating_baseline}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 pt-1 border-t border-white/5">
                    <span>Speed Range: {v.min_speed_knots} - {v.max_speed_knots} kts</span>
                    <span>Shore Power: {v.has_shore_power_connection ? 'YES' : 'NO'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audit Hash Seal */}
      <div className="pt-3 border-t border-white/10 text-[9px] text-zinc-500 flex justify-between items-center">
        <span>LEDGER HASH: SHA-256</span>
        <span className="text-zinc-400">MODELED-COMPLIANCE</span>
      </div>
    </aside>
  );
};
