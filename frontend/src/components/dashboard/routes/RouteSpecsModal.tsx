import React from 'react';
import { CorridorInfo } from '../../../types';
import {
  Compass,
  ArrowRight,
  Check,
  Xmark,
  Globe,
  Anchor,
  ShieldCheck,
  Ship,
} from '@/components/icons';

interface RouteSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  corridors: CorridorInfo[];
  activeCorridorId: string;
  onSelectCorridor: (routeId: string) => void;
}

const cleanPortLabel = (port?: { name: string; country?: string }) => {
  if (!port) return '';
  const cleanName = port.name.replace(/^Port of\s+/i, '').replace(/\(JNPA Mumbai\)/i, '(JNPA)');
  return port.country ? `${cleanName}, ${port.country}` : cleanName;
};

export const RouteSpecsModal: React.FC<RouteSpecsModalProps> = ({
  isOpen,
  onClose,
  corridors,
  activeCorridorId,
  onSelectCorridor,
}) => {
  if (!isOpen) return null;

  const totalDistance = corridors.reduce((acc, c) => acc + (c.distance_nm || 0), 0);
  const totalCargo = corridors.reduce((acc, c) => acc + (c.cargo_demand || 0), 0);
  const ecaCount = corridors.filter((c) => c.is_eca_corridor).length;

  return (
    <div
      data-testid="route-specs-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-6xl xl:max-w-7xl bg-white rounded-2xl shadow-2xl border border-stone-200/90 overflow-hidden flex flex-col font-mono text-xs max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/60 shadow-2xs">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 font-sans tracking-tight">
                Global Liner Corridors & Transport Matrix
              </h3>
              <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                Official Sagarmala, Transoceanic & IMO ECA Commercial Network Specifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            title="Close (ESC)"
          >
            <Xmark className="w-4 h-4" />
          </button>
        </div>

        {/* Global Summary Statistics Dock */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-100 border-b border-stone-100 bg-stone-50/40">
          <div className="py-3.5 px-6">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
              Active Trade Lanes
            </span>
            <div className="text-base sm:text-lg font-bold text-stone-900 font-mono mt-0.5 whitespace-nowrap">
              {corridors.length} Corridors
            </div>
            <span className="text-[10px] text-stone-400 font-sans block mt-0.5">
              Global Liner Network
            </span>
          </div>
          <div className="py-3.5 px-6">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
              Network Mileage
            </span>
            <div className="text-base sm:text-lg font-bold text-stone-900 font-mono mt-0.5 whitespace-nowrap">
              {totalDistance.toLocaleString()} NM
            </div>
            <span className="text-[10px] text-stone-400 font-sans block mt-0.5">
              Great-Circle Vectors
            </span>
          </div>
          <div className="py-3.5 px-6">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
              Total Cargo Demand
            </span>
            <div className="text-base sm:text-lg font-bold text-stone-900 font-mono mt-0.5 whitespace-nowrap">
              {totalCargo.toLocaleString()} MT
            </div>
            <span className="text-[10px] text-stone-400 font-sans block mt-0.5">
              Transport Allocation
            </span>
          </div>
          <div className="py-3.5 px-6">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
              ECA Regulatory Zones
            </span>
            <div className="text-base sm:text-lg font-bold text-stone-900 font-mono mt-0.5 whitespace-nowrap">
              {ecaCount} ECA {ecaCount === 1 ? 'Zone' : 'Zones'}
            </div>
            <span className="text-[10px] text-stone-400 font-sans block mt-0.5">
              0.10% Sulfur Restricted
            </span>
          </div>
        </div>

        {/* Breathable Table View */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-5 min-w-0">
          <table className="w-full text-left text-xs font-mono border-separate border-spacing-0">
            <thead className="bg-stone-50 text-stone-400 font-medium uppercase text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Corridor & Trade Lane</th>
                <th className="py-2.5 px-4 font-semibold">Voyage Routing (Origin → Destination)</th>
                <th className="py-2.5 px-4 text-right font-semibold whitespace-nowrap">Distance</th>
                <th className="py-2.5 px-4 text-right font-semibold whitespace-nowrap">Cargo Demand</th>
                <th className="py-2.5 px-4 text-right font-semibold whitespace-nowrap">Max Transit</th>
                <th className="py-2.5 px-4 text-center font-semibold whitespace-nowrap">Cold Ironing</th>
                <th className="py-2.5 px-4 text-center font-semibold whitespace-nowrap">ECA / Sulfur</th>
                <th className="py-2.5 px-4 text-right font-semibold whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {corridors.map((c) => {
                const isActive = c.route_id === activeCorridorId;
                const isSagarmala = c.route_id.includes('INDIA') || c.route_id.includes('IND_OCEAN');

                return (
                  <tr
                    key={c.route_id}
                    className={`transition-colors ${
                      isActive
                        ? 'bg-amber-50/40 font-medium'
                        : 'hover:bg-stone-50/70'
                    }`}
                  >
                    {/* 1. Name & Trade Lane */}
                    <td className="py-2.5 sm:py-3 px-4">
                      <div className="font-semibold text-stone-900 font-sans text-xs sm:text-[13px] leading-snug">
                        {c.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                        <span className="font-mono text-stone-400">{c.route_id}</span>
                        {isSagarmala && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-sans font-semibold bg-orange-100 text-orange-800 border border-orange-200/80">
                            Sagarmala
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Routing (Origin -> Destination) */}
                    <td className="py-2.5 sm:py-3 px-4">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-xs border border-stone-200/70">
                          {c.origin_port?.port_id}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-xs border border-stone-200/70">
                          {c.destination_port?.port_id}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 font-sans mt-0.5">
                        {cleanPortLabel(c.origin_port)} → {cleanPortLabel(c.destination_port)}
                      </div>
                    </td>

                    {/* 3. Distance */}
                    <td className="py-2.5 sm:py-3 px-4 text-right tabular-nums whitespace-nowrap">
                      <span className="font-bold text-stone-900 text-xs">
                        {c.distance_nm.toLocaleString()}
                      </span>{' '}
                      <span className="text-stone-400 text-[11px]">NM</span>
                    </td>

                    {/* 4. Cargo Demand */}
                    <td className="py-2.5 sm:py-3 px-4 text-right tabular-nums whitespace-nowrap">
                      <span className="font-medium text-stone-800 text-xs">
                        {c.cargo_demand?.toLocaleString()}
                      </span>{' '}
                      <span className="text-stone-400 text-[11px]">t</span>
                    </td>

                    {/* 5. Max Transit */}
                    <td className="py-2.5 sm:py-3 px-4 text-right tabular-nums whitespace-nowrap">
                      <span className="font-medium text-stone-800 text-xs">
                        {c.max_transit_time_days}
                      </span>{' '}
                      <span className="text-stone-400 text-[11px]">days</span>
                    </td>

                    {/* 6. Cold Ironing */}
                    <td className="py-2.5 sm:py-3 px-4 text-center whitespace-nowrap">
                      {c.origin_port?.has_cold_ironing && c.destination_port?.has_cold_ironing ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Both Ports
                        </span>
                      ) : c.destination_port?.has_cold_ironing ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
                          Destination
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">Auxiliary</span>
                      )}
                    </td>

                    {/* 7. ECA / Status */}
                    <td className="py-2.5 sm:py-3 px-4 text-center whitespace-nowrap">
                      {c.is_eca_corridor ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          0.1% S ECA
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-stone-100 text-stone-600 border border-stone-200">
                          0.5% S Global
                        </span>
                      )}
                    </td>

                    {/* 8. Action Button */}
                    <td className="py-2.5 sm:py-3 px-4 text-right whitespace-nowrap">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-600 text-white shadow-2xs tracking-wide">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>ACTIVE</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onSelectCorridor(c.route_id);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 rounded-lg text-[11px] font-medium transition-all cursor-pointer border border-stone-200 hover:border-stone-900 shadow-2xs"
                        >
                          Activate →
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500 font-sans">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Nautical distances derived from WGS-84 rhumb-line & Great-Circle waypoint vectors.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200/80 hover:bg-stone-300 text-stone-800 rounded-lg font-medium transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
