import React, { useState } from 'react';
import { OptimizeRunResponse, ParetoSolution } from '../../types';

interface Props {
  latestOptimization: OptimizeRunResponse | null;
  selectedSolution: ParetoSolution | null;
  setSelectedSolution: (sol: ParetoSolution) => void;
  isSolving: boolean;
  onExecuteSolver: () => void;
}

interface PlotPoint {
  hours: number;
  fuel: number;
  cost: number;
  speed: number;
  id: string;
  isKnee?: boolean;
  raw?: ParetoSolution;
}

const DEFAULT_PARETO_POINTS: PlotPoint[] = [
  { hours: 620, fuel: 3100, cost: 2.15, speed: 17.2, id: 'SOL-01' },
  { hours: 660, fuel: 2680, cost: 1.84, speed: 16.0, id: 'SOL-02' },
  { hours: 712, fuel: 2240, cost: 1.52, speed: 14.6, id: 'SOL-KNEE', isKnee: true },
  { hours: 780, fuel: 1980, cost: 1.34, speed: 13.2, id: 'SOL-04' },
  { hours: 860, fuel: 1820, cost: 1.23, speed: 12.0, id: 'SOL-05' },
];

const WAYPOINT_SPEED_PROFILE = [
  { segment: 'Leg 1: Shanghai Departure', dist: 0, speed: 12.5, seaState: 'Calm (1.1m)' },
  { segment: 'Leg 2: East China Sea', dist: 850, speed: 15.2, seaState: 'Moderate (2.4m)' },
  { segment: 'Leg 3: Malacca Strait (Chokepoint)', dist: 2400, speed: 12.0, seaState: 'Shallow (1.4m)' },
  { segment: 'Leg 4: Bay of Bengal', dist: 3800, speed: 16.0, seaState: 'Calm (1.6m)' },
  { segment: 'Leg 5: South Indian Ocean', dist: 6500, speed: 13.8, seaState: 'Heavy Swell (4.2m)' },
  { segment: 'Leg 6: Cape of Good Hope', dist: 9800, speed: 11.5, seaState: 'Rough Gale (5.4m)' },
  { segment: 'Leg 7: South Atlantic', dist: 11500, speed: 15.8, seaState: 'Moderate (2.1m)' },
  { segment: 'Leg 8: English Channel', dist: 13400, speed: 12.0, seaState: 'Traffic ECA (1.5m)' },
  { segment: 'Leg 9: Rotterdam Arrival', dist: 13800, speed: 9.5, seaState: 'Berth Transition' },
];

export const ParetoDock: React.FC<Props> = ({
  latestOptimization,
  selectedSolution,
  setSelectedSolution,
  isSolving,
  onExecuteSolver,
}) => {
  const [activeTab, setActiveTab] = useState<'pareto' | 'speed_profile'>('pareto');
  const [hoveredPoint, setHoveredPoint] = useState<PlotPoint | null>(null);

  // Map backend Pareto solutions to chart data
  const chartData: PlotPoint[] =
    latestOptimization?.pareto_front && latestOptimization.pareto_front.length > 0
      ? latestOptimization.pareto_front.map((s, idx) => ({
          hours: Math.round(
            s.allocations?.[0]?.transit_time_days
              ? s.allocations[0].transit_time_days * 24
              : 620 + idx * 45
          ),
          fuel: Math.round(s.total_fuel_mt),
          cost: Number((s.total_cost_usd / 1e6).toFixed(2)),
          speed: s.allocations?.[0]?.speed_knots || 14.6,
          id: s.solution_id,
          isKnee: s.solution_id === latestOptimization.compromise_solution_id || idx === 2,
          raw: s,
        }))
      : DEFAULT_PARETO_POINTS;

  // Coordinate scales for SVG (viewBox 0 0 800 120)
  // X: 580..950 hrs -> 60..760 px
  // Y: 1600..3500 MT -> 100..15 px
  const mapX = (h: number) => 60 + ((h - 580) / (950 - 580)) * 700;
  const mapY = (f: number) => 100 - ((f - 1600) / (3500 - 1600)) * 85;

  // Speed profile scale (0..13800 NM -> 60..760 px, 8..18 kts -> 100..15 px)
  const mapDistX = (d: number) => 60 + (d / 13800) * 700;
  const mapSpeedY = (s: number) => 100 - ((s - 8) / (18 - 8)) * 85;

  return (
    <div className="h-56 bg-[#0c0c0f] border-t border-white/10 flex flex-col justify-between px-4 py-2 select-none font-mono">
      {/* Top Header & Tab Controls */}
      <div className="flex justify-between items-center pb-1.5 border-b border-white/10">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#ff6b00]" />
            QUANTUM DISPATCH DOCK
          </span>

          <div className="flex bg-[#18181e] p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('pareto')}
              className={`px-3 py-0.5 uppercase tracking-wider text-[10px] transition-all ${
                activeTab === 'pareto'
                  ? 'bg-[#ff6b00] text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              PARETO OBJECTIVES (FUEL VS TIME)
            </button>
            <button
              onClick={() => setActiveTab('speed_profile')}
              className={`px-3 py-0.5 uppercase tracking-wider text-[10px] transition-all ${
                activeTab === 'speed_profile'
                  ? 'bg-[#ff6b00] text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              WAYPOINT SPEED PROFILE
            </button>
          </div>
        </div>

        {/* Solver Controls */}
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-zinc-400 hidden md:block">
            ACTIVE SOLUTION: <span className="text-white font-bold">{selectedSolution?.solution_id || 'Q-KNEE'}</span>
          </div>

          <button
            onClick={onExecuteSolver}
            disabled={isSolving}
            className="px-3 py-1 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
            title="Re-run MO-QIEA quantum optimization (Space)"
          >
            <span>{isSolving ? 'SOLVING...' : 'EXECUTE MO-QIEA'}</span>
            <span className="text-[9px] bg-black/20 px-1 py-0.5 rounded-none">[SPACE]</span>
          </button>
        </div>
      </div>

      {/* Main SVG Visualizer Stage */}
      <div className="h-32 w-full relative">
        {activeTab === 'pareto' ? (
          <svg viewBox="0 0 800 120" className="w-full h-full">
            {/* Grid & Ticks */}
            {[600, 700, 800, 900].map((h) => (
              <g key={h}>
                <line x1={mapX(h)} y1={10} x2={mapX(h)} y2={100} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 3" />
                <text x={mapX(h)} y={114} fill="#71717a" fontSize="9" textAnchor="middle">{h}h</text>
              </g>
            ))}

            {[2000, 3000].map((f) => (
              <g key={f}>
                <line x1={60} y1={mapY(f)} x2={760} y2={mapY(f)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 3" />
                <text x={52} y={mapY(f) + 3} fill="#71717a" fontSize="9" textAnchor="end">{f} MT</text>
              </g>
            ))}

            {/* Baseline Curve */}
            <path
              d={chartData.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.hours)} ${mapY(p.fuel)}`).join(' ')}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            {/* Points */}
            {chartData.map((p, i) => {
              const isKnee = p.isKnee;
              const isSelected = selectedSolution?.solution_id === p.id;

              return (
                <g key={i}>
                  {isKnee && (
                    <circle
                      cx={mapX(p.hours)}
                      cy={mapY(p.fuel)}
                      r={6}
                      fill="none"
                      stroke="#ff6b00"
                      strokeWidth={1.5}
                      className="pointer-events-none"
                    >
                      <animate attributeName="r" values="6;16" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.85;0" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={mapX(p.hours)}
                    cy={mapY(p.fuel)}
                    r={isKnee ? 6 : isSelected ? 5 : 3.5}
                    fill={isKnee ? '#ff6b00' : isSelected ? '#ffffff' : '#a1a1aa'}
                    stroke="#08080a"
                    strokeWidth={1.5}
                    className="cursor-pointer"
                    onClick={() => {
                      if (p.raw) setSelectedSolution(p.raw);
                    }}
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>
        ) : (
          <svg viewBox="0 0 800 120" className="w-full h-full">
            {/* Speed Grid Lines */}
            {[10, 14, 18].map((s) => (
              <g key={s}>
                <line x1={60} y1={mapSpeedY(s)} x2={760} y2={mapSpeedY(s)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 3" />
                <text x={52} y={mapSpeedY(s) + 3} fill="#71717a" fontSize="9" textAnchor="end">{s} KTS</text>
              </g>
            ))}

            {/* Step-line Speed Curve */}
            <path
              d={WAYPOINT_SPEED_PROFILE.map((w, i) => {
                const x = mapDistX(w.dist);
                const y = mapSpeedY(w.speed);
                if (i === 0) return `M ${x} ${y}`;
                const prevX = mapDistX(WAYPOINT_SPEED_PROFILE[i - 1].dist);
                return `H ${x} V ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#ff6b00"
              strokeWidth="2"
            />

            {/* Waypoint Markers */}
            {WAYPOINT_SPEED_PROFILE.map((w, i) => (
              <circle
                key={i}
                cx={mapDistX(w.dist)}
                cy={mapSpeedY(w.speed)}
                r={3}
                fill="#ffffff"
                stroke="#ff6b00"
                strokeWidth={1}
              />
            ))}
          </svg>
        )}

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-1 right-4 bg-[#18181c] border border-white/20 px-3 py-1 font-mono text-[10px] text-white flex gap-4">
            <span className="text-[#ff6b00] font-bold">{hoveredPoint.id}</span>
            <span>Transit: {hoveredPoint.hours}h</span>
            <span>Fuel: {hoveredPoint.fuel} MT</span>
            <span>Speed: {hoveredPoint.speed} kts</span>
          </div>
        )}
      </div>

      {/* Micro-Telemetry Footer Strip */}
      <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1 border-t border-white/5">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#ff6b00] inline-block" />
          SAFETY AMBER KNEE: 14.6 KTS (PARETO KNEE COMPROMISE)
        </span>
        <span className="hidden sm:inline">
          DIVERSITY METRIC: 0.942 · CATASTROPHE RATE: 0.05 · GIVENS Δθ: 0.05π
        </span>
      </div>
    </div>
  );
};
