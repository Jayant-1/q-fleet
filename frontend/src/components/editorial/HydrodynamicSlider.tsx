import React from 'react';
import { computeLocalHydrodynamics } from '../../store/useDispatchStore';

interface Props {
  speedKnots: number;
  setSpeedKnots: (v: number) => void;
  waveHeight: number;
  setWaveHeight: (v: number) => void;
  onEnterCockpit: () => void;
}

export const HydrodynamicSlider: React.FC<Props> = ({
  speedKnots,
  setSpeedKnots,
  waveHeight,
  setWaveHeight,
  onEnterCockpit,
}) => {
  const calc = computeLocalHydrodynamics(speedKnots, 15.5, waveHeight, 366.0, 48.2, 0.65);

  // Compute percentage of wave resistance vs total
  const wavePct = Math.min(100, Math.round(((calc.waveMakingResistanceKn + calc.kwonAddedResistanceKn) / calc.totalResistanceKn) * 100));
  const frictionPct = 100 - wavePct;

  return (
    <div className="border border-white/10 bg-[#0e0e12] p-6 md:p-8 relative">
      {/* Blueprint Grid Watermark */}
      <div className="absolute top-3 right-4 font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
        REF: HOLTROP-MENNEN-1984 // KWON-1987
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                Cruising Speed (Knots)
              </label>
              <span className="font-mono text-2xl font-bold tabular-nums text-white">
                {speedKnots.toFixed(1)} <span className="text-xs text-zinc-500 font-normal">KTS</span>
              </span>
            </div>
            <input
              type="range"
              min={10.0}
              max={22.0}
              step={0.1}
              value={speedKnots}
              onChange={(e) => setSpeedKnots(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-[#ff6b00]"
            />
            <div className="flex justify-between font-mono text-[10px] text-zinc-500 mt-1">
              <span>10.0 (SLOW STEAM)</span>
              <span>14.6 (OPTIMAL KNEE)</span>
              <span>22.0 (FLANK SPEED)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                Significant Wave Height (Hs)
              </label>
              <span className="font-mono text-xl font-bold tabular-nums text-white">
                {waveHeight.toFixed(1)} <span className="text-xs text-zinc-500 font-normal">M</span>
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={6.0}
              step={0.1}
              value={waveHeight}
              onChange={(e) => setWaveHeight(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-[#ff6b00]"
            />
            <div className="flex justify-between font-mono text-[10px] text-zinc-500 mt-1">
              <span>0.5M (BEAUFORT 2)</span>
              <span>3.0M (BEAUFORT 5)</span>
              <span>6.0M (BEAUFORT 7 GALE)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400">Froude Number (Fn)</span>
            <span className={`font-mono text-sm font-semibold tabular-nums ${calc.froudeNumber > 0.20 ? 'text-[#ff6b00]' : 'text-zinc-200'}`}>
              {calc.froudeNumber} {calc.froudeNumber > 0.20 && '— CRITICAL WAVE SURGE'}
            </span>
          </div>
        </div>

        {/* Right Telemetry Readouts (7 Cols) */}
        <div className="lg:col-span-7 bg-[#08080a] border border-white/10 p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-white/5">
            <div>
              <span className="block font-mono text-[10px] uppercase text-zinc-500 tracking-wider">Frictional (Rf)</span>
              <span className="font-mono text-lg font-bold tabular-nums text-zinc-200">{calc.frictionalResistanceKn}</span>
              <span className="font-mono text-[10px] text-zinc-500 ml-1">kN</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-zinc-500 tracking-wider">Wave-Making (Rw)</span>
              <span className="font-mono text-lg font-bold tabular-nums text-zinc-200">{calc.waveMakingResistanceKn}</span>
              <span className="font-mono text-[10px] text-zinc-500 ml-1">kN</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-zinc-500 tracking-wider">Kwon Added (Raw)</span>
              <span className="font-mono text-lg font-bold tabular-nums text-zinc-200">{calc.kwonAddedResistanceKn}</span>
              <span className="font-mono text-[10px] text-zinc-500 ml-1">kN</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-[#ff6b00] tracking-wider font-semibold">Total Drag (Rt)</span>
              <span className="font-mono text-xl font-bold tabular-nums text-[#ff6b00]">{calc.totalResistanceKn}</span>
              <span className="font-mono text-[10px] text-zinc-400 ml-1">kN</span>
            </div>
          </div>

          {/* Drag Composition Bar */}
          <div>
            <div className="flex justify-between font-mono text-[11px] text-zinc-400 mb-1.5">
              <span>FRICTIONAL VISCOUS DRAG ({frictionPct}%)</span>
              <span className="text-[#ff6b00]">WAVE & WEATHER SURGE ({wavePct}%)</span>
            </div>
            <div className="h-3 w-full bg-zinc-800 flex overflow-hidden">
              <div style={{ width: `${frictionPct}%` }} className="bg-zinc-400 h-full transition-all duration-150" />
              <div style={{ width: `${wavePct}%` }} className="bg-[#ff6b00] h-full transition-all duration-150" />
            </div>
          </div>

          {/* Engine Power & Fuel Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="border border-white/5 bg-[#121216] p-4">
              <span className="font-mono text-[11px] uppercase text-zinc-400 block mb-1">Required Brake Power (Pb)</span>
              <span className="font-mono text-2xl font-bold tabular-nums text-white">
                {(calc.brakePowerKw / 1000).toFixed(2)} <span className="text-sm font-normal text-zinc-400">MW</span>
              </span>
              <span className="block font-mono text-[10px] text-zinc-500 mt-1">Quasi-propulsive ηD = 0.68</span>
            </div>

            <div className="border border-white/5 bg-[#121216] p-4 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] uppercase text-zinc-400 block mb-1">Daily Fuel Burn (VLSFO)</span>
                <span className="font-mono text-2xl font-bold tabular-nums text-[#ff6b00]">
                  {calc.dailyFuelConsumptionMt} <span className="text-sm font-normal text-zinc-400">MT/DAY</span>
                </span>
              </div>
              <button
                onClick={onEnterCockpit}
                className="mt-3 text-left font-mono text-xs uppercase tracking-wider text-white hover:text-[#ff6b00] transition-colors flex items-center gap-1.5"
              >
                <span>OPEN IN COCKPIT DISPATCH</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
