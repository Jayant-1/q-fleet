import React, { useState } from 'react';
import { FuelSpecification } from '../types';
import { Flame, Zap, ShieldCheck, ExternalLink, Leaf, ArrowRight } from '@/components/icons';

interface FuelPathwayLifecycleProps {
  fuels: FuelSpecification[];
}

export const FuelPathwayLifecycle: React.FC<FuelPathwayLifecycleProps> = ({ fuels }) => {
  const [selectedFuelCode, setSelectedFuelCode] = useState<string>('BIO_METHANOL');

  const selectedFuel = fuels.find((f) => f.code === selectedFuelCode) || fuels[0];
  const maxWtw = Math.max(...fuels.map((f) => f.total_wtw_gco2e_per_mj));

  return (
    <div className="bg-oceanic-hull border border-oceanic-border rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-oceanic-border bg-oceanic-panel/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-telemetry-seafoam" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
            Alternative Fuel Pathways & Well-to-Wake Lifecycle Accounting
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-oceanic-void px-2.5 py-0.5 rounded border border-oceanic-border">
          IMO MEPC.376(80) & FuelEU Maritime EU 2023/1805
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Comparative Carbon Intensity Bars (Data as Art) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
            Total Well-to-Wake Carbon Intensity (gCO₂e / MJ Energy Delivered)
          </h3>

          <div className="space-y-3">
            {fuels.map((fuel) => {
              const isSelected = fuel.code === selectedFuelCode;
              const wtwPct = (fuel.total_wtw_gco2e_per_mj / maxWtw) * 100;
              const isZeroDirect = fuel.ttw_factor_gco2_per_g === 0;

              return (
                <div
                  key={fuel.code}
                  onClick={() => setSelectedFuelCode(fuel.code)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-oceanic-panel border-telemetry-cyan glow-cyan'
                      : 'bg-oceanic-void/70 border-oceanic-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-100 flex items-center gap-2">
                      {fuel.display_name}
                      {fuel.is_cryogenic && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-800">
                          CRYOGENIC
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {fuel.total_wtw_gco2e_per_mj} <span className="text-[10px] text-slate-400">g/MJ</span>
                    </span>
                  </div>

                  {/* Horizontal Bar Breakdown */}
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
                    {/* WTT Segment */}
                    <div
                      style={{ width: `${(fuel.wtt_factor_gco2e_per_mj / maxWtw) * 100}%` }}
                      className="bg-telemetry-amber h-full"
                      title={`Well-to-Tank: ${fuel.wtt_factor_gco2e_per_mj} gCO2e/MJ`}
                    />
                    {/* TTW Segment */}
                    <div
                      style={{
                        width: `${Math.max(
                          0,
                          ((fuel.total_wtw_gco2e_per_mj - fuel.wtt_factor_gco2e_per_mj) / maxWtw) * 100
                        )}%`,
                      }}
                      className="bg-telemetry-cyan h-full"
                      title={`Tank-to-Wake: ${(fuel.total_wtw_gco2e_per_mj - fuel.wtt_factor_gco2e_per_mj).toFixed(1)} gCO2e/MJ`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1">
                    <span>WTT: {fuel.wtt_factor_gco2e_per_mj} g/MJ</span>
                    <span>
                      {isZeroDirect ? 'Zero Carbon TTW' : `TTW: ${(fuel.total_wtw_gco2e_per_mj - fuel.wtt_factor_gco2e_per_mj).toFixed(1)} g/MJ`}
                    </span>
                    <span className="text-telemetry-seafoam">${fuel.default_cost_usd_per_mt}/MT</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-telemetry-amber rounded-sm inline-block" />
              <span>Well-to-Tank (Upstream Extraction/Synthesis)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-telemetry-cyan rounded-sm inline-block" />
              <span>Tank-to-Wake (Combustion Exhaust)</span>
            </span>
          </div>
        </div>

        {/* Selected Fuel Deep Dive Card & Port Shore Power Callout */}
        <div className="lg:col-span-5 space-y-4">
          {selectedFuel && (
            <div className="bg-oceanic-panel/70 border border-oceanic-border rounded-lg p-4 space-y-3">
              <div className="border-b border-oceanic-border pb-2">
                <span className="text-[10px] font-mono uppercase text-telemetry-cyan tracking-wider">
                  Technical Specification
                </span>
                <h4 className="text-base font-bold text-slate-100">{selectedFuel.display_name}</h4>
                <p className="text-xs text-slate-400 mt-1">{selectedFuel.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-oceanic-void p-2.5 rounded border border-oceanic-border">
                  <span className="text-[10px] uppercase text-slate-400 block">Lower Heating Value</span>
                  <span className="font-bold text-slate-200">{selectedFuel.lhv_mj_per_kg} MJ/kg</span>
                </div>
                <div className="bg-oceanic-void p-2.5 rounded border border-oceanic-border">
                  <span className="text-[10px] uppercase text-slate-400 block">Fuel Density</span>
                  <span className="font-bold text-slate-200">{selectedFuel.density_kg_per_m3} kg/m³</span>
                </div>
                <div className="bg-oceanic-void p-2.5 rounded border border-oceanic-border">
                  <span className="text-[10px] uppercase text-slate-400 block">Baseline Bunkering</span>
                  <span className="font-bold text-telemetry-amber">${selectedFuel.default_cost_usd_per_mt} / MT</span>
                </div>
                <div className="bg-oceanic-void p-2.5 rounded border border-oceanic-border">
                  <span className="text-[10px] uppercase text-slate-400 block">Carbon Mass Fraction</span>
                  <span className="font-bold text-slate-200">
                    {(selectedFuel.carbon_content_mass_fraction * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="bg-oceanic-void/80 p-2.5 rounded border border-oceanic-border text-[11px] text-slate-300">
                <span className="text-[10px] uppercase text-slate-400 block font-mono">Regulatory Citation</span>
                <span className="text-telemetry-cyan font-mono">{selectedFuel.regulatory_source}</span>
              </div>
            </div>
          )}

          {/* Port Shore Power (Cold Ironing) Operational Logic Card */}
          <div className="bg-oceanic-panel/70 border border-telemetry-seafoam/40 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-telemetry-seafoam">
              <Zap className="w-4 h-4" />
              <h4 className="font-bold text-xs uppercase tracking-wider font-mono">
                Port Shore Power (Cold Ironing) Standard
              </h4>
            </div>
            <p className="text-xs text-slate-300">
              When berthed at compatible operational hubs with modeled shore-power connectivity (e.g. Gothenburg at 45 gCO₂/kWh, Rotterdam at 160 gCO₂/kWh), 
              vessels connect to high-voltage shore power, eliminating onboard auxiliary diesel combustion.
            </p>
            <div className="text-[11px] font-mono text-telemetry-seafoam bg-telemetry-seafoam/10 p-2 rounded border border-telemetry-seafoam/30">
              ✓ Complies with IEC/IEEE 80005 High Voltage Shore Connection (HVSC).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
