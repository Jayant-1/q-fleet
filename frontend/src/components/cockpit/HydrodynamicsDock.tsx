import React from 'react';
import { VesselInfo } from '../../types';
import { HydrodynamicCalculation } from '../../store/useDispatchStore';

interface Props {
  activeVessel: VesselInfo | null;
  speedKnots: number;
  setSpeedKnots: (v: number) => void;
  draftMeters: number;
  setDraftMeters: (v: number) => void;
  waveHeight: number;
  setWaveHeight: (v: number) => void;
  calc: HydrodynamicCalculation;
}

export const HydrodynamicsDock: React.FC<Props> = ({
  activeVessel,
  speedKnots,
  setSpeedKnots,
  draftMeters,
  setDraftMeters,
  waveHeight,
  setWaveHeight,
  calc,
}) => {
  return (
    <aside className="w-80 bg-[#0c0c0f] border-r border-white/10 flex flex-col justify-between overflow-y-auto select-none p-4 text-xs font-mono">
      <div className="space-y-5">
        {/* Section Header */}
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
            HYDRODYNAMICS & PROPULSION
          </span>
          <span className="text-[10px] text-[#ff6b00]">KWON-HOLTROP</span>
        </div>

        {/* Vessel Particulars */}
        <div className="bg-[#121216] border border-white/5 p-3 space-y-1.5">
          <div className="text-white font-semibold text-xs">
            {activeVessel?.name || 'MV OCEAN TITAN (15K TEU)'}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 pt-1 border-t border-white/5">
            <div>LBP: <span className="text-zinc-200">{activeVessel?.length_overall_meters || 366}m</span></div>
            <div>BEAM: <span className="text-zinc-200">{activeVessel?.beam_meters || 48.2}m</span></div>
            <div>MCR: <span className="text-zinc-200">{((activeVessel?.main_engine_mcr_kw || 68000) / 1000).toFixed(0)}MW</span></div>
            <div>DWT: <span className="text-zinc-200">{(activeVessel?.dwt || 145000).toLocaleString()} MT</span></div>
          </div>
        </div>

        {/* Speed Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <label className="text-[10px] uppercase text-zinc-400">Cruising Speed</label>
            <span className="text-white font-bold tabular-nums">
              {speedKnots.toFixed(1)} <span className="text-zinc-500 font-normal">KTS</span>
            </span>
          </div>
          <input
            type="range"
            min={10.0}
            max={22.0}
            step={0.1}
            value={speedKnots}
            onChange={(e) => setSpeedKnots(parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-[#ff6b00]"
          />
          <div className="flex justify-between text-[9px] text-zinc-500">
            <span>10 KTS</span>
            <span className="text-[#ff6b00]">14.6 KNEE</span>
            <span>22 KTS</span>
          </div>
        </div>

        {/* Draft Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <label className="text-[10px] uppercase text-zinc-400">Operating Draft</label>
            <span className="text-white font-bold tabular-nums">
              {draftMeters.toFixed(1)} <span className="text-zinc-500 font-normal">M</span>
            </span>
          </div>
          <input
            type="range"
            min={11.0}
            max={16.5}
            step={0.1}
            value={draftMeters}
            onChange={(e) => setDraftMeters(parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-[#ff6b00]"
          />
          <div className="flex justify-between text-[9px] text-zinc-500">
            <span>11.0M (BALLAST)</span>
            <span>15.5M (SCANTLING)</span>
          </div>
        </div>

        {/* Sea State Wave Height Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <label className="text-[10px] uppercase text-zinc-400">Significant Wave (Hs)</label>
            <span className="text-white font-bold tabular-nums">
              {waveHeight.toFixed(1)} <span className="text-zinc-500 font-normal">M</span>
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={6.0}
            step={0.1}
            value={waveHeight}
            onChange={(e) => setWaveHeight(parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-[#ff6b00]"
          />
          <div className="flex justify-between text-[9px] text-zinc-500">
            <span>0.5M (CALM)</span>
            <span>3.0M (MOD)</span>
            <span>6.0M (ROUGH)</span>
          </div>
        </div>

        {/* Resistance Breakdown Telemetry Card */}
        <div className="bg-[#121216] border border-white/5 p-3 space-y-2">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider pb-1 border-b border-white/5">
            DRAG VECTOR SPECTRUM
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Frictional (Rf):</span>
            <span className="text-zinc-200 tabular-nums">{calc.frictionalResistanceKn} kN</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Wave-Making (Rw):</span>
            <span className="text-zinc-200 tabular-nums">{calc.waveMakingResistanceKn} kN</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Kwon Wave Drag (Raw):</span>
            <span className="text-zinc-200 tabular-nums">{calc.kwonAddedResistanceKn} kN</span>
          </div>
          <div className="flex justify-between text-[11px] pt-1.5 border-t border-white/10 font-bold">
            <span className="text-[#ff6b00]">Total Resistance (Rt):</span>
            <span className="text-[#ff6b00] tabular-nums">{calc.totalResistanceKn} kN</span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Indicators */}
      <div className="pt-4 border-t border-white/10 space-y-2 bg-[#0c0c0f]">
        <div className="bg-[#18181e] p-2.5 border border-white/5">
          <span className="text-[9px] uppercase text-zinc-400 block">Required Brake Power</span>
          <span className="text-lg font-bold text-white tabular-nums">
            {(calc.brakePowerKw / 1000).toFixed(2)} MW
          </span>
          <span className="text-[9px] text-zinc-500 block">MCR Margin: 48% (Optimal)</span>
        </div>

        <div className="bg-[#18181e] p-2.5 border border-[#ff6b00]/30">
          <span className="text-[9px] uppercase text-zinc-400 block">Daily Fuel Rate</span>
          <span className="text-lg font-bold text-[#ff6b00] tabular-nums">
            {calc.dailyFuelConsumptionMt} MT/DAY
          </span>
        </div>
      </div>
    </aside>
  );
};
