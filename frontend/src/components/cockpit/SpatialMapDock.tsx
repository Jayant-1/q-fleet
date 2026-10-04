import React, { useState } from 'react';
import { CorridorInfo } from '../../types';

interface Props {
  corridors: CorridorInfo[];
  activeCorridorId: string;
  setActiveCorridorId: (id: string) => void;
  speedKnots: number;
}

export const SpatialMapDock: React.FC<Props> = ({
  corridors,
  activeCorridorId,
  setActiveCorridorId,
  speedKnots,
}) => {
  const [selectedWaypoint, setSelectedWaypoint] = useState<{
    lat: number;
    lon: number;
    name: string;
    depthM: number;
    waveHs: number;
    windKts: number;
  } | null>(null);

  // Geographic projection helper: Map [lon (-180..180), lat (-60..70)] to SVG [0..1000, 0..500]
  const projectCoords = (lon: number, lat: number): [number, number] => {
    const x = ((lon + 180) / 360) * 1000;
    const y = ((75 - lat) / 135) * 500;
    return [Math.round(x), Math.round(y)];
  };

  const activeCorridor = corridors.find((c) => c.route_id === activeCorridorId) || corridors[0];

  return (
    <div className="flex-1 bg-[#08080a] relative overflow-hidden flex flex-col justify-between">
      {/* Top Map Status Bar */}
      <div className="absolute top-3 left-4 z-20 flex flex-wrap items-center gap-3 font-mono text-[10px] text-zinc-400 select-none">
        <div className="bg-[#121216]/90 border border-white/10 px-2.5 py-1 text-white font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#ff6b00]" />
          <span>{activeCorridor?.name || 'SHANGHAI → ROTTERDAM'}</span>
          <span className="text-[#ff6b00]">({activeCorridor?.distance_nm?.toLocaleString() || '13,800'} NM)</span>
        </div>

        <div className="bg-[#121216]/90 border border-white/10 px-2.5 py-1">
          <span>ORIGIN: <strong className="text-zinc-200">{activeCorridor?.origin_port?.name || 'Shanghai'}</strong></span>
        </div>

        <div className="bg-[#121216]/90 border border-white/10 px-2.5 py-1">
          <span>DESTINATION: <strong className="text-zinc-200">{activeCorridor?.destination_port?.name || 'Rotterdam'}</strong></span>
        </div>

        <div className="bg-[#121216]/90 border border-white/10 px-2.5 py-1">
          <span>DISPATCH SPEED: <strong className="text-[#ff6b00]">{speedKnots.toFixed(1)} KTS</strong></span>
        </div>
      </div>

      {/* Corridor Quick Switcher Tabs at Top Right */}
      <div className="absolute top-3 right-4 z-20 hidden md:flex items-center gap-1 font-mono text-[10px] select-none bg-[#121216]/90 border border-white/10 p-0.5">
        {corridors.slice(0, 4).map((c) => (
          <button
            key={c.route_id}
            onClick={() => setActiveCorridorId(c.route_id)}
            className={`px-2 py-1 uppercase tracking-wider transition-all ${
              activeCorridorId === c.route_id
                ? 'bg-[#ff6b00] text-black font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {c.route_id.split('_')[0]}
          </button>
        ))}
      </div>

      {/* SVG Nautical Vector Cartography Stage */}
      <div className="w-full h-full relative select-none">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full object-cover"
          aria-label="High-Contrast Spatial Maritime Vector Chart"
        >
          {/* Subtle Swiss Coordinate Grid */}
          <defs>
            <pattern id="nauticalGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1000" height="500" fill="#08080a" />
          <rect width="1000" height="500" fill="url(#nauticalGrid)" />

          {/* Simplified Continental Shorelines (Dark Obsidian Fill with Hairline Stroke) */}
          <g fill="#101015" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8">
            {/* Eurasia / Africa */}
            <path d="M 460 120 L 510 110 L 590 125 L 680 140 L 780 180 L 820 230 L 760 300 L 710 260 L 640 280 L 620 340 L 580 420 L 520 440 L 490 380 L 460 320 L 420 300 L 410 220 L 440 180 Z" />
            {/* Americas */}
            <path d="M 140 110 L 220 120 L 260 180 L 290 260 L 260 290 L 310 340 L 340 400 L 310 480 L 260 450 L 240 370 L 210 320 L 160 260 L 110 200 Z" />
            {/* Australia */}
            <path d="M 750 360 L 820 350 L 860 390 L 840 440 L 770 430 Z" />
          </g>

          {/* Inactive Corridors (Muted Hairline Traces) */}
          {corridors.map((c) => {
            if (c.route_id === activeCorridorId || !c.coordinates || c.coordinates.length < 2) return null;
            const pts = c.coordinates.map(([lat, lon]) => projectCoords(lon, lat));
            const pathData = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
            return (
              <path
                key={c.route_id}
                d={pathData}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
                strokeDasharray="2 3"
                className="cursor-pointer hover:stroke-white/40 transition-colors"
                onClick={() => setActiveCorridorId(c.route_id)}
              />
            );
          })}

          {/* Active Geodesic Corridor Route Line (Illuminated White + Amber Pulse) */}
          {activeCorridor && activeCorridor.coordinates && (
            <g>
              {(() => {
                const pts = activeCorridor.coordinates.map(([lat, lon]) => projectCoords(lon, lat));
                const pathData = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

                return (
                  <>
                    {/* Route Glow */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#ff6b00"
                      strokeWidth="3"
                      opacity="0.3"
                    />
                    {/* Crisp Route Track */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />

                    {/* Interactive Waypoints */}
                    {activeCorridor.coordinates.map(([lat, lon], idx) => {
                      const [x, y] = projectCoords(lon, lat);
                      const isOrigin = idx === 0;
                      const isDest = idx === activeCorridor.coordinates.length - 1;
                      const isMid = idx === Math.floor(activeCorridor.coordinates.length / 2);

                      return (
                        <g
                          key={idx}
                          className="cursor-pointer group"
                          onClick={() =>
                            setSelectedWaypoint({
                              lat,
                              lon,
                              name: isOrigin
                                ? `Origin: ${activeCorridor.origin_port.name}`
                                : isDest
                                ? `Destination: ${activeCorridor.destination_port.name}`
                                : `Waypoint W-${idx + 1}`,
                              depthM: isOrigin || isDest ? 18.5 : 4200 - idx * 250,
                              waveHs: 1.5 + (idx % 3) * 0.9,
                              windKts: 12 + (idx % 4) * 4,
                            })
                          }
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={isOrigin || isDest ? 6 : 3.5}
                            fill={isOrigin || isDest ? '#ff6b00' : isMid ? '#ff6b00' : '#ffffff'}
                            stroke="#08080a"
                            strokeWidth={1.5}
                          />
                          {isMid && (
                            <circle
                              cx={x}
                              cy={y}
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
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </g>
          )}

          {/* Compass Rose (Bottom Left) */}
          <g transform="translate(45, 455)" className="font-mono text-[9px] fill-zinc-500">
            <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
            <line x1="0" y1="-14" x2="0" y2="14" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <line x1="-14" y1="0" x2="14" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <text x="0" y="-18" textAnchor="middle" fill="#ff6b00" fontWeight="bold">N</text>
          </g>
        </svg>
      </div>

      {/* Interactive Waypoint Telemetry HUD Popover */}
      {selectedWaypoint && (
        <div className="absolute bottom-4 left-4 z-30 bg-[#121216]/95 border border-white/20 p-4 font-mono text-xs shadow-2xl max-w-sm">
          <div className="flex justify-between items-start pb-2 border-b border-white/10">
            <div>
              <span className="text-[10px] text-[#ff6b00] uppercase tracking-wider font-bold">
                WAYPOINT TELEMETRY
              </span>
              <div className="text-white font-bold">{selectedWaypoint.name}</div>
            </div>
            <button
              onClick={() => setSelectedWaypoint(null)}
              className="text-zinc-400 hover:text-white px-1.5"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3 text-[11px]">
            <div>
              <span className="text-zinc-500 block">Coordinates</span>
              <span className="text-zinc-200">
                {selectedWaypoint.lat.toFixed(2)}°N {selectedWaypoint.lon.toFixed(2)}°E
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Water Depth</span>
              <span className="text-white font-bold tabular-nums">
                {selectedWaypoint.depthM.toLocaleString()} m
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Swell (Hs)</span>
              <span className="text-[#ff6b00] font-bold tabular-nums">
                {selectedWaypoint.waveHs.toFixed(1)} m
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">True Wind</span>
              <span className="text-zinc-200 tabular-nums">
                {selectedWaypoint.windKts} kts
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Cartography Footer Status */}
      <div className="bg-[#0c0c0f] border-t border-white/10 px-4 py-2 flex justify-between items-center font-mono text-[10px] text-zinc-500 select-none">
        <div className="flex items-center gap-4">
          <span>GEODESIC PROJECTION: WGS-84 / EQUIDISTANT</span>
          <span className="hidden sm:inline">OCEAN CURRENTS: HYCOM LIVE ASSIMILATION</span>
        </div>
        <div className="text-zinc-400">
          CLICK ANY WAYPOINT FOR LOCAL HYDRODYNAMIC SOUNDING
        </div>
      </div>
    </div>
  );
};
