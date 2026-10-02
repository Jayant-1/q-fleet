import React, { useState } from 'react';
import { CorridorInfo, VesselAllocationItem } from '../types';
import { Anchor, Wind, Waves, Navigation, Zap, AlertCircle } from 'lucide-react';

interface RouteMapProps {
  corridors: CorridorInfo[];
  allocations: VesselAllocationItem[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  corridors,
  allocations,
  selectedRouteId,
  onSelectRoute,
}) => {
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);

  // Geographic projection helper: Map [lon (-180..180), lat (-60..70)] to SVG [0..1000, 0..500]
  const projectCoords = (lon: number, lat: number): [number, number] => {
    // Equirectangular projection with margin offsets
    const x = ((lon + 180) / 360) * 1000;
    const y = ((75 - lat) / 135) * 500;
    return [Math.round(x), Math.round(y)];
  };

  const activeRouteId = hoveredRoute || selectedRouteId || (corridors[0]?.route_id ?? '');
  const activeCorridor = corridors.find((c) => c.route_id === activeRouteId);
  const activeAllocations = allocations.filter((a) => a.route_id === activeRouteId);

  return (
    <div className="bg-oceanic-hull border border-oceanic-border rounded-xl overflow-hidden shadow-2xl">
      {/* Map Header with Real-time Telemetry Status */}
      <div className="p-4 border-b border-oceanic-border bg-oceanic-panel/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-telemetry-cyan animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
            Global Maritime Corridors & Weather Telemetry
          </h2>
          <span className="text-xs font-mono text-slate-400 bg-oceanic-void px-2 py-0.5 rounded border border-oceanic-border">
            {corridors.length} Liner Corridors
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-telemetry-cyan inline-block" />
            <span>Standard Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-telemetry-seafoam inline-block" />
            <span>ECA 0.1% Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-telemetry-seafoam border border-white/60 inline-block" />
            <span>Cold Ironing Berth</span>
          </div>
        </div>
      </div>

      {/* Main Vector Map Canvas */}
      <div className="relative w-full aspect-[2/1] min-h-[300px] sm:min-h-[380px] bg-[#050914] bg-radar-grid overflow-hidden">
        {/* Subtle World Ocean Outlines SVG */}
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full object-cover select-none"
          aria-label="Interactive Maritime Corridor Map"
        >
          {/* Subtle Oceanic Continents Silhouette */}
          <path
            d="M 120,90 Q 150,70 200,90 T 260,140 Q 230,220 280,260 T 320,380 L 260,420 Q 200,320 160,240 Z 
               M 450,80 Q 520,60 580,100 T 640,150 Q 600,240 680,280 T 780,260 L 800,320 Q 720,380 620,360 Z 
               M 720,100 Q 820,80 920,120 T 960,220 Q 880,260 840,320 Z"
            fill="#091322"
            stroke="#132238"
            strokeWidth="1.2"
          />

          {/* Graticule Latitude/Longitude Lines */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="#0e1b2d" strokeWidth="0.8" strokeDasharray="4 4" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="#0e1b2d" strokeWidth="0.8" strokeDasharray="4 4" />
          <text x="12" y="244" fill="#334155" fontSize="10" fontFamily="monospace">EQUATOR 0°</text>
          <text x="492" y="490" fill="#334155" fontSize="10" fontFamily="monospace" textAnchor="end">PRIME MERIDIAN 0°</text>

          {/* Shipping Corridor Vector Tracks */}
          {corridors.map((corridor) => {
            const isSelected = corridor.route_id === activeRouteId;
            const isEca = corridor.is_eca_corridor;
            const pts = corridor.coordinates.map((c) => projectCoords(c[0], c[1]));
            if (pts.length < 2) return null;

            let pathD = `M ${pts[0][0]} ${pts[0][1]}`;
            for (let i = 1; i < pts.length; i++) {
              pathD += ` L ${pts[i][0]} ${pts[i][1]}`;
            }

            const strokeColor = isEca
              ? '#10b981'
              : isSelected
              ? '#00e5ff'
              : '#38bdf888';

            return (
              <g
                key={corridor.route_id}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelectRoute(corridor.route_id)}
                onMouseEnter={() => setHoveredRoute(corridor.route_id)}
                onMouseLeave={() => setHoveredRoute(null)}
              >
                {/* Invisible thick hover stroke */}
                <path d={pathD} fill="none" stroke="transparent" strokeWidth="24" />

                {/* Outer Glow Path */}
                {isSelected && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="7"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Core Nautical Track */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '3' : '1.8'}
                  strokeDasharray={isSelected ? 'none' : isEca ? '6 3' : 'none'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Animated Ship Vessel Ping along route */}
                {isSelected && pts.length >= 2 && (
                  <circle
                    cx={pts[Math.floor(pts.length / 2)][0]}
                    cy={pts[Math.floor(pts.length / 2)][1]}
                    r="4"
                    fill="#00e5ff"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}

          {/* Port Nodes */}
          {corridors.map((corridor) => {
            const originPt = projectCoords(corridor.origin_port.lon, corridor.origin_port.lat);
            const destPt = projectCoords(corridor.destination_port.lon, corridor.destination_port.lat);

            return (
              <React.Fragment key={`ports-${corridor.route_id}`}>
                {/* Origin Port */}
                <circle cx={originPt[0]} cy={originPt[1]} r="3.5" fill="#f8fafc" stroke="#00e5ff" strokeWidth="1.5" />
                {/* Destination Port (with Cold Ironing highlight) */}
                <circle
                  cx={destPt[0]}
                  cy={destPt[1]}
                  r="4"
                  fill={corridor.destination_port.has_cold_ironing ? '#10b981' : '#f8fafc'}
                  stroke="#070d18"
                  strokeWidth="1.5"
                />
              </React.Fragment>
            );
          })}
        </svg>

        {/* Floating Active Corridor HUD Overlay (Data as Art) */}
        {activeCorridor && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-oceanic-hull/95 border border-telemetry-cyan/30 rounded-lg p-3 sm:p-4 backdrop-blur-md shadow-2xl text-xs space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-telemetry-cyan tracking-wider">
                  Active Corridor Telemetry
                </span>
                <h3 className="font-bold text-slate-100 text-sm">{activeCorridor.name}</h3>
              </div>
              {activeCorridor.is_eca_corridor && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-telemetry-seafoam/20 text-telemetry-seafoam border border-telemetry-seafoam/40">
                  ECA COMPLIANT
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-oceanic-void/70 p-2 rounded border border-oceanic-border">
                <span className="text-slate-400 block text-[9px] uppercase">Distance</span>
                <span className="font-semibold text-slate-200">{activeCorridor.distance_nm.toLocaleString()} NM</span>
              </div>
              <div className="bg-oceanic-void/70 p-2 rounded border border-oceanic-border">
                <span className="text-slate-400 block text-[9px] uppercase">Demand</span>
                <span className="font-semibold text-slate-200">{activeCorridor.cargo_demand.toLocaleString()} TEU</span>
              </div>
              <div className="bg-oceanic-void/70 p-2 rounded border border-oceanic-border">
                <span className="text-slate-400 block text-[9px] uppercase">Transit Max</span>
                <span className="font-semibold text-slate-200">{activeCorridor.max_transit_time_days} days</span>
              </div>
              <div className="bg-oceanic-void/70 p-2 rounded border border-oceanic-border">
                <span className="text-slate-400 block text-[9px] uppercase">Weather Sea</span>
                <span className="font-semibold text-telemetry-amber">{activeCorridor.weather_severity_index.toFixed(2)}x</span>
              </div>
            </div>

            {/* Allocated Fleet Summary */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-300 border-t border-oceanic-border">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-telemetry-cyan" />
                <span>{activeAllocations.length} Vessels Assigned</span>
              </span>
              <span className="font-mono text-telemetry-seafoam">
                {activeAllocations.reduce((sum, a) => sum + a.cargo_carried, 0).toLocaleString()} TEU Capacity
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Corridor Quick Selector Strip (Touch-friendly for Mobile Art Direction) */}
      <div className="p-3 bg-oceanic-panel/80 border-t border-oceanic-border overflow-x-auto flex items-center gap-2">
        {corridors.map((c) => {
          const isSelected = c.route_id === activeRouteId;
          return (
            <button
              key={c.route_id}
              onClick={() => onSelectRoute(c.route_id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-telemetry-cyan/20 text-telemetry-cyan border border-telemetry-cyan/50 glow-cyan font-bold'
                  : 'bg-oceanic-void text-slate-300 hover:text-white border border-oceanic-border hover:border-slate-600'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${c.is_eca_corridor ? 'bg-telemetry-seafoam' : 'bg-telemetry-cyan'}`} />
              <span>{c.name.split(' ')[0]}</span>
              <span className="text-[10px] text-slate-400">({c.distance_nm} NM)</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
