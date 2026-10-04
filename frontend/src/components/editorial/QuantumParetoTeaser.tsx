import React, { useState } from 'react';

interface Props {
  onEnterCockpit: (e?: React.MouseEvent) => void;
}

interface Point {
  hours: number;
  fuel: number;
  cost: number;
  speed: number;
  id: string;
  isKnee?: boolean;
}

const QIEA_POINTS: Point[] = [
  { hours: 620, fuel: 3100, cost: 2.15, speed: 17.2, id: 'Q-FLANK (17.2 KTS)' },
  { hours: 660, fuel: 2680, cost: 1.84, speed: 16.0, id: 'Q-STANDARD (16.0 KTS)' },
  { hours: 712, fuel: 2240, cost: 1.52, speed: 14.6, id: 'Q-OPTIMAL KNEE', isKnee: true },
  { hours: 780, fuel: 1980, cost: 1.34, speed: 13.2, id: 'Q-SLOW STEAM (13.2 KTS)' },
  { hours: 860, fuel: 1820, cost: 1.23, speed: 12.0, id: 'Q-ECO MAX (12.0 KTS)' },
];

const NSGA_POINTS: Point[] = [
  { hours: 640, fuel: 3250, cost: 2.29, speed: 16.8, id: 'NSGA-II CANDIDATE 1' },
  { hours: 690, fuel: 2890, cost: 2.01, speed: 15.4, id: 'NSGA-II CANDIDATE 2' },
  { hours: 750, fuel: 2490, cost: 1.71, speed: 13.8, id: 'NSGA-II CANDIDATE 3' },
  { hours: 820, fuel: 2190, cost: 1.49, speed: 12.6, id: 'NSGA-II CANDIDATE 4' },
  { hours: 910, fuel: 1980, cost: 1.35, speed: 11.4, id: 'NSGA-II CANDIDATE 5' },
];

export const QuantumParetoTeaser: React.FC<Props> = ({ onEnterCockpit }) => {
  const [activeAlgorithm, setActiveAlgorithm] = useState<'MO-QIEA' | 'BOTH'>('BOTH');
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point>(QIEA_POINTS[2]);

  // Coordinate mapping for SVG plot (viewBox 0 0 600 320)
  // X: 580..950 hrs -> 60..560 px
  // Y: 1600..3500 MT -> 280..40 px
  const mapX = (h: number) => 60 + ((h - 580) / (950 - 580)) * 500;
  const mapY = (f: number) => 280 - ((f - 1600) / (3500 - 1600)) * 240;

  return (
    <div className="border border-white/10 bg-[#0e0e12] p-6 md:p-8">
      {/* Top Header & Algorithm Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#ff6b00]">
            MULTI-OBJECTIVE DECISION SUPPORT // PARETO TRADE-OFF FRONTIER
          </span>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Balancing Transit Duration vs Bunker Consumption
          </h3>
        </div>

        <div className="flex items-center gap-2 bg-[#08080a] border border-white/10 p-1">
          <button
            onClick={() => setActiveAlgorithm('MO-QIEA')}
            className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all ${
              activeAlgorithm === 'MO-QIEA'
                ? 'bg-[#ff6b00] text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            MO-QIEA ONLY
          </button>
          <button
            onClick={() => setActiveAlgorithm('BOTH')}
            className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all ${
              activeAlgorithm === 'BOTH'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            COMPARE VS NSGA-II
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Pure High-Performance SVG Plot Visualizer (7 Cols) */}
        <div className="lg:col-span-7 bg-[#08080a] border border-white/10 p-4 relative min-h-[360px] flex flex-col justify-between select-none">
          <div className="flex justify-between font-mono text-[10px] text-zinc-500 uppercase tracking-widest pb-2">
            <span>OBJECTIVE: FUEL BURN (MT) VS TRANSIT DURATION (HOURS)</span>
            <span className="text-[#ff6b00]">CLICK POINT TO INSPECT VOYAGE PLAN</span>
          </div>

          <div className="w-full relative">
            <svg viewBox="0 0 600 320" className="w-full h-auto">
              {/* Background Grid Lines */}
              {[600, 700, 800, 900].map((h) => (
                <g key={h}>
                  <line
                    x1={mapX(h)}
                    y1={30}
                    x2={mapX(h)}
                    y2={280}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <text
                    x={mapX(h)}
                    y={298}
                    fill="#71717a"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {h}h
                  </text>
                </g>
              ))}

              {[2000, 2500, 3000].map((f) => (
                <g key={f}>
                  <line
                    x1={60}
                    y1={mapY(f)}
                    x2={560}
                    y2={mapY(f)}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <text
                    x={52}
                    y={mapY(f) + 3}
                    fill="#71717a"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {f}
                  </text>
                </g>
              ))}

              {/* Axes Lines */}
              <line x1={60} y1={280} x2={560} y2={280} stroke="#27272a" strokeWidth="1.5" />
              <line x1={60} y1={30} x2={60} y2={280} stroke="#27272a" strokeWidth="1.5" />

              {/* Classical NSGA-II Curve Trace (Grey) */}
              {activeAlgorithm === 'BOTH' && (
                <path
                  d={NSGA_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.hours)} ${mapY(p.fuel)}`).join(' ')}
                  fill="none"
                  stroke="#52525b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Classical NSGA-II Points */}
              {activeAlgorithm === 'BOTH' &&
                NSGA_POINTS.map((p, i) => (
                  <circle
                    key={i}
                    cx={mapX(p.hours)}
                    cy={mapY(p.fuel)}
                    r={4}
                    fill="#71717a"
                    stroke="#08080a"
                    strokeWidth={1}
                    className="cursor-pointer hover:r-6 transition-all"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}

              {/* MO-QIEA Pareto Frontier Line (Stark White) */}
              <path
                d={QIEA_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.hours)} ${mapY(p.fuel)}`).join(' ')}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* MO-QIEA Pareto Points */}
              {QIEA_POINTS.map((p, i) => {
                const isSelected = selectedPoint.id === p.id;
                const isKnee = p.isKnee;

                return (
                  <g key={i}>
                    {isKnee && (
                      <circle
                        cx={mapX(p.hours)}
                        cy={mapY(p.fuel)}
                        r={7}
                        fill="none"
                        stroke="#ff6b00"
                        strokeWidth={1.5}
                        className="pointer-events-none"
                      >
                        <animate
                          attributeName="r"
                          values="7;20"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.85;0"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                    <circle
                      cx={mapX(p.hours)}
                      cy={mapY(p.fuel)}
                      r={isKnee ? 7 : isSelected ? 6 : 4.5}
                      fill={isKnee ? '#ff6b00' : isSelected ? '#ffffff' : '#e4e4e7'}
                      stroke="#08080a"
                      strokeWidth={1.5}
                      className="cursor-pointer transition-all"
                      onClick={() => setSelectedPoint(p)}
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none bg-[#18181c] border border-white/20 p-2.5 font-mono text-xs text-white shadow-xl"
                style={{
                  left: `${((hoveredPoint.hours - 580) / (950 - 580)) * 80 + 10}%`,
                  top: '20%',
                }}
              >
                <div className="text-[#ff6b00] font-bold">{hoveredPoint.id}</div>
                <div>Transit: {hoveredPoint.hours} hrs</div>
                <div>Fuel: {hoveredPoint.fuel} MT</div>
                <div>Speed: {hoveredPoint.speed} kts</div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-2 font-mono text-[10px] text-zinc-500 border-t border-white/5 pt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#ff6b00] rounded-none inline-block" />
              SAFETY AMBER: OPTIMAL PARETO KNEE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-white inline-block" />
              NON-DOMINATED QUANTUM CANDIDATES
            </span>
          </div>
        </div>

        {/* Right Metric Ledger & Mathematical Proof (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border border-white/10 bg-[#08080a] p-4">
              <span className="font-mono text-[10px] uppercase text-[#ff6b00] tracking-widest block">
                SELECTED DISPATCH CANDIDATE
              </span>
              <div className="flex justify-between items-baseline mt-1">
                <span className="font-mono text-xl font-bold text-white">
                  {selectedPoint.id}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  SPEED: {selectedPoint.speed} KTS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/5 font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Total Voyage Time</span>
                  <span className="text-base text-zinc-200 font-bold tabular-nums">
                    {selectedPoint.hours} hrs
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    ({(selectedPoint.hours / 24).toFixed(1)} days)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Total Fuel Consumption</span>
                  <span className="text-base text-[#ff6b00] font-bold tabular-nums">
                    {selectedPoint.fuel} MT
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    (${selectedPoint.cost}M USD cost)
                  </span>
                </div>
              </div>
            </div>

            {/* Matched-Budget Benchmark Metrics */}
            <div className="border border-white/10 bg-[#08080a] p-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Evaluation Budget</span>
                <span className="text-white font-bold tabular-nums">1,050 evals (Seed N=42)</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Pareto Spacing Spread (Δ)</span>
                <span className="text-[#ff6b00] font-bold tabular-nums">0.0254 (MO-QIEA widest diversity)</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Benchmark Hypervolume (HV)</span>
                <span className="text-zinc-200 tabular-nums">MO-PSO 0.2577 · NSGA-II 0.2366 · QIEA 0.1839</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Algorithm Strength</span>
                <span className="text-emerald-400 font-medium text-[11px]">MO-QIEA uncovers multi-fuel trade-offs</span>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => onEnterCockpit(e)}
            className="w-full py-3 bg-[#ff6b00] hover:bg-[#ff8533] text-black font-mono text-xs uppercase font-bold tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <span className="select-none">LOAD THIS CANDIDATE IN DASHBOARD</span>
            <span className="select-none">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
