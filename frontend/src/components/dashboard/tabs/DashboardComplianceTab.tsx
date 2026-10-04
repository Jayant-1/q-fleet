import React from 'react';
import { ParetoSolution, FuelType, FuelSpecification } from '../../../types';
import { Award, ShieldCheck, DollarSign, Sliders, Leaf, AlertCircle } from '@/components/icons';

interface Props {
  selectedSolution: ParetoSolution | null;
  selectedFuel: FuelType;
  setSelectedFuel: (f: FuelType) => void;
  carbonPriceEur: number;
  setCarbonPriceEur: (p: number) => void;
  fuels: FuelSpecification[];
}

const FUEL_PROFILES: { code: FuelType; name: string; wtt: number; ttw: number; wtw: number; priceUsd: number; parityTax: number }[] = [
  { code: 'VLSFO', name: 'Very Low Sulfur Fuel Oil (Fossil)', wtt: 13.5, ttw: 78.0, wtw: 91.5, priceUsd: 620, parityTax: 0 },
  { code: 'LNG', name: 'Fossil Liquefied Natural Gas', wtt: 18.2, ttw: 59.8, wtw: 78.0, priceUsd: 740, parityTax: 85 },
  { code: 'BIO_METHANOL', name: 'Bio-Methanol (Sustainable Pathway)', wtt: 18.4, ttw: 0.0, wtw: 18.4, priceUsd: 1100, parityTax: 165 },
  { code: 'GREEN_NH3', name: 'Green Ammonia (e-Fuel)', wtt: 4.2, ttw: 0.0, wtw: 4.2, priceUsd: 1350, parityTax: 210 },
  { code: 'GREEN_H2', name: 'Liquid Hydrogen (Zero Emission)', wtt: 0.0, ttw: 0.0, wtw: 0.0, priceUsd: 1900, parityTax: 295 },
];

export const DashboardComplianceTab: React.FC<Props> = ({
  selectedSolution,
  selectedFuel,
  setSelectedFuel,
  carbonPriceEur,
  setCarbonPriceEur,
}) => {
  const hasSolution = !!selectedSolution;
  const ciiGrade = selectedSolution?.fleet_average_cii_rating;
  const ciiGradeCounts = selectedSolution?.cii_grade_counts || {};
  const fueleuPenalty = selectedSolution?.total_fueleu_penalty_usd || 0;
  const etsCost = selectedSolution?.total_eu_ets_cost_usd || 0;

  return (
    <div className="space-y-8">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">
            Compliance, CII & Decarbonization Mandates
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Statutory IMO CII (MEPC.354(78)), FuelEU Maritime GHG intensity limits, and EU ETS carbon trading sandbox.
          </p>
        </div>
      </div>

      {/* 1. IMO CII Decarbonization Card (Tour Target) */}
      <div id="tour-cii-badge" className="bg-white rounded-lg border border-stone-200/90 shadow-2xs p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-4 mb-5">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
              Decarbonization Mandate
            </div>
            <h3 className="text-sm font-semibold text-stone-900 mt-0.5">
              IMO Carbon Intensity Indicator (CII) Rating — MEPC.354(78)
            </h3>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              Operational carbon intensity per transport work (gCO₂ / DWT-NM) evaluated with 2026 reduction factor (Z = 11%).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-mono">Fleet Rating:</span>
            <span className="px-2.5 py-1 rounded font-mono text-sm font-semibold border border-stone-200 bg-stone-100 text-stone-800">
              {hasSolution && ciiGrade ? `Grade ${ciiGrade}` : 'Pending'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Explanation & SEEMP rule */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
              Compliance Status & Legal Standing
            </h4>
            {hasSolution ? (
              <>
                <p className="text-xs text-stone-600 leading-relaxed font-mono">
                  Indicative voyage allocation achieves <strong className="text-stone-900 font-semibold">Grade {ciiGrade}</strong> under MEPC.354(78).
                  Official statutory compliance under IMO MEPC.328(76) requires annual assessment in the Ship Energy Efficiency Management Plan (SEEMP Part III). Vessels with three consecutive D or a single E rating must implement a mandatory Plan of Corrective Actions.
                </p>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded text-xs font-mono text-stone-700 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${ciiGrade === 'D' || ciiGrade === 'E' ? 'bg-rose-500' : 'bg-emerald-500'} shrink-0`} />
                  <span>
                    {ciiGrade === 'D' || ciiGrade === 'E'
                      ? 'Corrective action plan required under SEEMP Part III for vessels at this rating.'
                      : 'Indicative voyage plan is within acceptable operational carbon intensity limits.'}
                  </span>
                </div>
              </>
            ) : (
              <div className="p-4 bg-stone-50 border border-stone-200 rounded text-xs font-mono text-stone-500 leading-relaxed">
                Awaiting optimization solver execution. Run the multi-objective optimizer to evaluate voyage CII compliance and EU ETS liability against regulatory thresholds.
              </div>
            )}
          </div>

          {/* Boundaries breakdown */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-2">
              IMO 2026 Decarbonization Tier Thresholds
            </h4>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded bg-emerald-50/70 border border-emerald-200 text-emerald-800">
                <span className="font-sans font-medium">Grade A (Superior Efficiency)</span>
                <span className="tabular-nums">&lt; 2.50 gCO₂/tNM</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-teal-50/70 border border-teal-200 text-teal-800 font-semibold">
                <span className="font-sans font-semibold">Grade B (Standard Compliance) ★</span>
                <span className="tabular-nums">2.50 – 3.80 gCO₂/tNM</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-amber-50/70 border border-amber-200 text-amber-800">
                <span className="font-sans font-medium">Grade C (Marginal Standard)</span>
                <span className="tabular-nums">3.80 – 4.50 gCO₂/tNM</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-rose-50/70 border border-rose-200 text-rose-800">
                <span className="font-sans font-medium">Grade D/E (Corrective SEEMP Action)</span>
                <span className="tabular-nums">&gt; 4.50 gCO₂/tNM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FuelEU Maritime & EU ETS Sandbox Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FuelEU Maritime Card */}
        <div className="bg-white rounded-lg border border-stone-200/90 shadow-2xs p-5 space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
              Regulation (EU) 2023/1805
            </div>
            <h3 className="text-sm font-semibold text-stone-900 mt-0.5">
              FuelEU Maritime GHG Intensity Limit
            </h3>
            <span className="text-xs text-stone-400 font-mono mt-0.5 block">
              Mandatory Well-to-Wake GHG intensity reduction for European voyages
            </span>
          </div>

          <div className="space-y-3 font-mono">
            <div className="flex justify-between text-xs py-1 border-b border-stone-100">
              <span className="text-stone-500">2020 Reference Baseline:</span>
              <strong className="text-stone-900 tabular-nums">91.16 gCO₂eq / MJ</strong>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-stone-100">
              <span className="text-stone-500">2026 Legally Binding Limit:</span>
              <strong className="text-emerald-700 tabular-nums">89.34 gCO₂eq / MJ (-2.0%)</strong>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-stone-100">
              <span className="text-stone-500">Non-Compliance Deficit Tariff:</span>
              <strong className="text-stone-900 tabular-nums">€2,400 / MT VLSFO-eq</strong>
            </div>
            <div className="flex justify-between items-center p-3 bg-stone-50 border border-stone-200 rounded text-xs mt-2">
              <span className="font-medium text-stone-700">Compliance Balance:</span>
              <span className={`px-2.5 py-1 rounded font-mono font-semibold text-xs border ${
                !hasSolution
                  ? 'bg-stone-100 text-stone-600 border-stone-200'
                  : fueleuPenalty > 0
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {!hasSolution
                  ? 'Awaiting Run'
                  : fueleuPenalty > 0
                  ? `€${Math.round(fueleuPenalty).toLocaleString()} Deficit Penalty`
                  : '€0.00 (Fully Compliant)'}
              </span>
            </div>
          </div>
        </div>

        {/* EU ETS Carbon Price Slider */}
        <div className="bg-white rounded-lg border border-stone-200/90 shadow-2xs p-5 space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
              Directive (EU) 2023/959
            </div>
            <h3 className="text-sm font-semibold text-stone-900 mt-0.5">
              EU ETS Maritime Policy Sandbox
            </h3>
            <span className="text-xs text-stone-400 font-mono mt-0.5 block">
              100% Phase-In for intra-EU voyages & 50% for extra-EU port calls
            </span>
          </div>

          <div className="space-y-4 font-mono">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-stone-700">Carbon Allowance Price (EUA):</span>
                <span className="text-sm font-semibold text-stone-900 tabular-nums">
                  €{carbonPriceEur} / tonne CO₂
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                step={5}
                value={carbonPriceEur}
                onChange={(e) => setCarbonPriceEur(parseInt(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>€50 (Low Market)</span>
                <span>€85 (Current 2026 EUA)</span>
                <span>€150 (Strict Target)</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded border border-stone-200 flex justify-between items-center text-xs">
              <span className="text-stone-600 font-medium">Estimated ETS Carbon Liability:</span>
              <span className="text-sm font-semibold text-stone-900 tabular-nums">
                {hasSolution ? `€${Math.round(etsCost).toLocaleString()}` : 'Awaiting Run'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Alternative Fuels Lifecycle Accounting Table */}
      <div className="bg-white rounded-lg border border-stone-200/90 shadow-2xs p-5">
        <div className="border-b border-stone-100 pb-3 mb-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
            Decarbonization Pathways
          </div>
          <h3 className="text-sm font-semibold text-stone-900 mt-0.5">
            Alternative Fuels Well-to-Wake (WTW) Lifecycle Emissions & Parity
          </h3>
          <span className="text-xs text-stone-400 font-mono mt-0.5 block">
            Comparing conventional marine fuel oils against IMO MEPC 81 modeled clean fuel pathways.
          </span>
        </div>

        <div className="border border-stone-200 rounded-lg overflow-x-auto w-full max-w-full min-w-0">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-50/80 border-b border-stone-100 text-stone-400 uppercase text-[11px] font-normal tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-medium">Fuel Pathway</th>
                <th className="py-2.5 px-4 text-right font-medium">Well-to-Tank (WTT)</th>
                <th className="py-2.5 px-4 text-right font-medium">Tank-to-Wake (TTW)</th>
                <th className="py-2.5 px-4 text-right font-medium">Total WTW Intensity</th>
                <th className="py-2.5 px-4 text-right font-medium">Bunker Price</th>
                <th className="py-2.5 px-4 text-right font-medium">Carbon Parity Price</th>
                <th className="py-2.5 px-4 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {FUEL_PROFILES.map((f) => (
                <tr
                  key={f.code}
                  className={`transition-colors ${selectedFuel === f.code ? 'bg-orange-50/40 font-semibold' : 'hover:bg-stone-50/60'}`}
                >
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-stone-900 font-sans">{f.name}</div>
                    <div className="text-[11px] text-stone-400 font-mono">{f.code}</div>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-stone-600">{f.wtt.toFixed(1)} gCO₂e/MJ</td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-stone-600">{f.ttw.toFixed(1)} gCO₂e/MJ</td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-stone-900">{f.wtw.toFixed(1)} gCO₂e/MJ</td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-stone-800">${f.priceUsd} / MT</td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-medium text-sky-700">
                    {f.parityTax === 0 ? 'Baseline' : `$${f.parityTax} / tCO₂`}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={() => setSelectedFuel(f.code)}
                      className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                        selectedFuel === f.code
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {selectedFuel === f.code ? 'Selected' : 'Select'}
                    </button>
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
