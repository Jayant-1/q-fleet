import React from 'react';
import { VesselInfo } from '../../../types';
import { HydrodynamicCalculation } from '../../../store/useDispatchStore';
import { Gauge, Waves, Anchor, Zap, AlertCircle, ArrowRight } from '@/components/icons';
import { TacticalRangeSlider } from '../../common/TacticalRangeSlider';

interface Props {
  activeVessel: VesselInfo | null;
  speedKnots: number;
  setSpeedKnots: (speed: number) => void;
  draftMeters: number;
  setDraftMeters: (draft: number) => void;
  waveHeight: number;
  setWaveHeight: (waves: number) => void;
  calc: HydrodynamicCalculation;
  onNavigateTab: (tabId: string) => void;
  onRunSolver?: () => void;
}

export const DashboardPhysicsTab: React.FC<Props> = ({
  activeVessel,
  speedKnots,
  setSpeedKnots,
  draftMeters,
  setDraftMeters,
  waveHeight,
  setWaveHeight,
  calc,
  onNavigateTab,
  onRunSolver,
}) => {
  // Estimated fuel cost at $620/MT
  const dailyFuelCostUsd = calc.dailyFuelConsumptionMt * 620;

  return (
    <div className="space-y-8">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">
            Naval Towing Resistance & Hydrodynamics
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Holtrop-Mennen viscous and wave drag combined with Kwon (1987) irregular seaway added resistance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Physics Controls */}
        <div className="lg:col-span-1 bg-white p-5 rounded-lg border border-stone-200/90 shadow-2xs space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
              Vessel Hydrodynamics
            </div>
            <h3 className="text-sm font-semibold text-stone-900 mt-0.5">
              Operational Parameters
            </h3>
            <span className="text-xs font-mono text-stone-400 mt-0.5 block">
              {activeVessel?.name || 'Oceanic Apex'} · {activeVessel?.vessel_type || 'Ultra Large Container'}
            </span>
          </div>

          {/* 1. Cruising Speed Slider (Tour Target) */}
          {/* 1. Target Speed Slider */}
          <div id="tour-speed-slider" data-testid="speed-slider-container" className="p-3 bg-stone-50/60 rounded-none border border-stone-200/80">
            <TacticalRangeSlider
              theme="light"
              label={
                <span className="flex items-center gap-1.5 font-mono text-stone-700">
                  <Gauge className="w-3.5 h-3.5 text-stone-500" />
                  Cruising Speed
                </span>
              }
              displayValue={speedKnots.toFixed(1)}
              unit="kts"
              min={10.0}
              max={22.0}
              step={0.1}
              value={speedKnots}
              onChange={setSpeedKnots}
              ticks={[
                { value: 10.0, label: '10.0 kts (Eco)' },
                { value: 14.6, label: '14.6 kts (Pareto Knee)', highlight: true },
                { value: 22.0, label: '22.0 kts (Max)' },
              ]}
            />
          </div>

          {/* 2. Vessel Draft Slider */}
          <div className="p-3 bg-stone-50/60 rounded-none border border-stone-200/80">
            <TacticalRangeSlider
              theme="light"
              label={
                <span className="flex items-center gap-1.5 font-mono text-stone-700">
                  <Anchor className="w-3.5 h-3.5 text-stone-500" />
                  Operating Draft
                </span>
              }
              displayValue={draftMeters.toFixed(1)}
              unit="m"
              min={11.0}
              max={16.5}
              step={0.1}
              value={draftMeters}
              onChange={setDraftMeters}
              ticks={[
                { value: 11.0, label: '11.0 m (Ballast)' },
                { value: 13.5, label: '13.5 m (Medium)' },
                { value: 16.5, label: '16.5 m (Full Scantling)' },
              ]}
            />
          </div>

          {/* 3. Significant Wave Height */}
          <div className="p-3 bg-stone-50/60 rounded-none border border-stone-200/80">
            <TacticalRangeSlider
              theme="light"
              label={
                <span className="flex items-center gap-1.5 font-mono text-stone-700">
                  <Waves className="w-3.5 h-3.5 text-stone-500" />
                  Wave Swell Height (Hs)
                </span>
              }
              displayValue={waveHeight.toFixed(1)}
              unit="m"
              min={0.5}
              max={6.0}
              step={0.1}
              value={waveHeight}
              onChange={setWaveHeight}
              ticks={[
                { value: 0.5, label: '0.5 m (Calm)' },
                { value: 2.4, label: '2.4 m (Moderate)' },
                { value: 6.0, label: '6.0 m (Heavy Storm)' },
              ]}
            />
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (onRunSolver) onRunSolver();
                onNavigateTab('optimization');
              }}
              data-testid="apply-target-speed-btn"
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Apply Target ({speedKnots.toFixed(1)} kts) to Optimizer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Hydrodynamic Output & Resistance Spectrum */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-2xs">
              <span className="text-[11px] font-mono font-medium text-stone-400 uppercase tracking-wider block mb-1">
                Required Propulsion Power
              </span>
              <div data-testid="calc-power-mw" className="text-2xl font-semibold text-stone-900 tabular-nums font-mono">
                {(calc.brakePowerKw / 1000).toFixed(2)} <span className="text-sm font-normal text-stone-400">MW</span>
              </div>
              <div className="mt-2 text-xs font-mono text-stone-500">
                Main Engine MCR Loading: <strong className="text-stone-800 font-semibold">{Math.round((calc.brakePowerKw / (activeVessel?.main_engine_mcr_kw || 68000)) * 100)}%</strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-stone-200/90 shadow-2xs">
              <span className="text-[11px] font-mono font-medium text-stone-400 uppercase tracking-wider block mb-1">
                Daily Fuel Consumption
              </span>
              <div data-testid="calc-fuel-burn" className="text-2xl font-semibold text-orange-600 tabular-nums font-mono">
                {calc.dailyFuelConsumptionMt} <span className="text-sm font-normal text-stone-400">MT / Day</span>
              </div>
              <div className="mt-2 text-xs font-mono text-stone-500">
                Daily Bunkering Cost: <strong className="text-stone-800 font-semibold">${Math.round(dailyFuelCostUsd).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Hydrodynamic Drag Breakdown Table */}
          <div className="bg-white rounded-lg border border-stone-200/90 shadow-2xs p-5">
            <h3 className="text-sm font-semibold text-stone-900 mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600" />
              Hydrodynamic Towing Resistance Spectrum (Holtrop-Mennen & Kwon 1987)
            </h3>
            <p className="text-xs text-stone-500 font-mono mb-4">
              Calculated dynamically via naval architecture first principles based on vessel wetted surface area and Froude number.
            </p>

            <div className="border border-stone-200 rounded-lg w-full max-w-full overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-stone-50/80 border-b border-stone-100 text-stone-400 uppercase text-[11px] font-normal tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Component Force</th>
                    <th className="py-2.5 px-4 font-medium">Physical Mechanism</th>
                    <th className="py-2.5 px-4 text-right font-medium">Magnitude</th>
                    <th className="py-2.5 px-4 text-right font-medium">Share of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-stone-900">Frictional Drag (R<sub>F</sub>)</td>
                    <td className="py-2.5 px-4 text-stone-600">Skin friction along wetted hull surface (ITTC-1957)</td>
                    <td className="py-2.5 px-4 text-right font-medium text-stone-800 tabular-nums">
                      {calc.frictionalResistanceKn.toFixed(1)} kN
                    </td>
                    <td className="py-2.5 px-4 text-right text-stone-600 tabular-nums">
                      {Math.round((calc.frictionalResistanceKn / calc.totalResistanceKn) * 100)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-stone-900">Wave-Making Surge (R<sub>W</sub>)</td>
                    <td className="py-2.5 px-4 text-stone-600">Bow & stern transverse wave systems (Fn<sup>4.2</sup> exponential)</td>
                    <td className="py-2.5 px-4 text-right font-medium text-stone-800 tabular-nums">
                      {calc.waveMakingResistanceKn.toFixed(1)} kN
                    </td>
                    <td className="py-2.5 px-4 text-right text-stone-600 tabular-nums">
                      {Math.round((calc.waveMakingResistanceKn / calc.totalResistanceKn) * 100)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-stone-900">Added Wave Resistance (R<sub>AW</sub>)</td>
                    <td className="py-2.5 px-4 text-stone-600">Motion dissipation in irregular seaway swell (Kwon)</td>
                    <td className="py-2.5 px-4 text-right font-medium text-stone-800 tabular-nums">
                      {calc.kwonAddedResistanceKn.toFixed(1)} kN
                    </td>
                    <td className="py-2.5 px-4 text-right text-stone-600 tabular-nums">
                      {Math.round((calc.kwonAddedResistanceKn / calc.totalResistanceKn) * 100)}%
                    </td>
                  </tr>
                  <tr className="bg-orange-50/40 font-medium border-t-2 border-orange-200">
                    <td className="py-2.5 px-4 text-orange-950 font-semibold">Total Towing Resistance (R<sub>T</sub>)</td>
                    <td className="py-2.5 px-4 text-orange-800">Sum of viscous, wave, and wind drag forces</td>
                    <td className="py-2.5 px-4 text-right text-orange-950 tabular-nums font-semibold">
                      {calc.totalResistanceKn.toFixed(1)} kN
                    </td>
                    <td className="py-2.5 px-4 text-right text-orange-950">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-stone-50/70 rounded-lg text-xs font-mono text-stone-600 flex flex-wrap justify-between items-center gap-2">
              <span>Current Froude Number: <strong className="text-stone-900">{calc.froudeNumber}</strong></span>
              <span className="text-stone-500">Quasi-propulsive efficiency: 68%</span>
              <span className="text-stone-500">Specific Fuel Oil Consumption: ~165 g/kWh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
