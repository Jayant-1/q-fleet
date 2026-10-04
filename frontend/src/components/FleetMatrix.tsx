import React, { useState } from 'react';
import { VesselInfo, VesselAllocationItem } from '../types';
import { Ship, Zap, Gauge, DollarSign, Wind, ShieldAlert, CheckCircle2 } from '@/components/icons';

interface FleetMatrixProps {
  fleet: VesselInfo[];
  allocations: VesselAllocationItem[];
  selectedVesselId: string | null;
  onSelectVessel: (vesselId: string) => void;
}

export const FleetMatrix: React.FC<FleetMatrixProps> = ({
  fleet,
  allocations,
  selectedVesselId,
  onSelectVessel,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'ACTIVE' | 'CONTAINER' | 'BULK_TANKER'>('ALL');

  const allocationMap = new Map<string, VesselAllocationItem>();
  allocations.forEach((a) => allocationMap.set(a.vessel_id, a));

  const filteredFleet = fleet.filter((v) => {
    const isAllocated = allocationMap.has(v.vessel_id);
    if (filterType === 'ACTIVE') return isAllocated;
    if (filterType === 'CONTAINER') return v.vessel_type.includes('Container');
    if (filterType === 'BULK_TANKER') return v.vessel_type.includes('Bulk') || v.vessel_type.includes('Tanker');
    return true;
  });

  return (
    <div className="bg-oceanic-hull border border-oceanic-border rounded-xl overflow-hidden shadow-xl">
      {/* Matrix Controls Header */}
      <div className="p-4 border-b border-oceanic-border bg-oceanic-panel/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Ship className="w-4 h-4 text-telemetry-cyan" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
            Fleet Deployment Matrix & Vessel Allocation
          </h2>
          <span className="text-xs font-mono text-slate-400 bg-oceanic-void px-2 py-0.5 rounded border border-oceanic-border">
            {allocations.length} / {fleet.length} Deployed
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterType === 'ALL'
                ? 'bg-telemetry-cyan text-oceanic-void font-bold'
                : 'bg-oceanic-void text-slate-400 hover:text-white'
            }`}
          >
            ALL ({fleet.length})
          </button>
          <button
            onClick={() => setFilterType('ACTIVE')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterType === 'ACTIVE'
                ? 'bg-telemetry-cyan text-oceanic-void font-bold'
                : 'bg-oceanic-void text-slate-400 hover:text-white'
            }`}
          >
            ACTIVE ({allocations.length})
          </button>
          <button
            onClick={() => setFilterType('CONTAINER')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterType === 'CONTAINER'
                ? 'bg-telemetry-cyan text-oceanic-void font-bold'
                : 'bg-oceanic-void text-slate-400 hover:text-white'
            }`}
          >
            CONTAINER
          </button>
          <button
            onClick={() => setFilterType('BULK_TANKER')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterType === 'BULK_TANKER'
                ? 'bg-telemetry-cyan text-oceanic-void font-bold'
                : 'bg-oceanic-void text-slate-400 hover:text-white'
            }`}
          >
            BULK/TANKER
          </button>
        </div>
      </div>

      {/* Desktop Dense Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-oceanic-panel/80 text-slate-400 font-mono uppercase text-[11px] border-b border-oceanic-border">
            <tr>
              <th className="py-2.5 px-4">Vessel Identifier</th>
              <th className="py-2.5 px-3">Class & DWT</th>
              <th className="py-2.5 px-3">Assigned Corridor</th>
              <th className="py-2.5 px-3">Speed</th>
              <th className="py-2.5 px-3">Fuel Pathway</th>
              <th className="py-2.5 px-3 text-center">Cold Ironing</th>
              <th className="py-2.5 px-3 text-right">Voyage Fuel</th>
              <th className="py-2.5 px-3 text-right">Cost</th>
              <th className="py-2.5 px-4 text-right">WTW GHG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-oceanic-border font-mono text-[11px]">
            {filteredFleet.map((v) => {
              const alloc = allocationMap.get(v.vessel_id);
              const isSelected = selectedVesselId === v.vessel_id;

              return (
                <tr
                  key={v.vessel_id}
                  onClick={() => onSelectVessel(v.vessel_id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-telemetry-cyan/15 border-l-2 border-l-telemetry-cyan'
                      : alloc
                      ? 'hover:bg-oceanic-panel/50'
                      : 'opacity-40 hover:opacity-75'
                  }`}
                >
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-100">{v.name}</div>
                    <div className="text-[10px] text-slate-400">{v.vessel_id}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-slate-300">{v.vessel_type.replace('_', ' ')}</div>
                    <div className="text-[10px] text-slate-400">{v.dwt.toLocaleString()} DWT</div>
                  </td>
                  <td className="py-2.5 px-3">
                    {alloc ? (
                      <span className="text-telemetry-cyan font-medium">{alloc.route_name.split(' ')[0]}</span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned (Reserve)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {alloc ? (
                      <span className="text-slate-200">{alloc.speed_knots} kts</span>
                    ) : (
                      <span className="text-slate-400">{v.design_speed_knots} kts</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {alloc ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-telemetry-seafoam/15 text-telemetry-seafoam border border-telemetry-seafoam/30">
                        {alloc.fuel_type}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">{v.compatible_fuels.join(', ')}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {alloc?.shore_power_used ? (
                      <span className="inline-flex items-center gap-1 text-telemetry-seafoam text-[10px]">
                        <Zap className="w-3 h-3" /> FITTED
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {alloc ? `${alloc.total_fuel_mt.toLocaleString()} MT` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {alloc ? `$${alloc.operational_cost_usd.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-telemetry-seafoam">
                    {alloc ? `${alloc.lifecycle_ghg_tco2e.toLocaleString()} t` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid (Responsive Adaptive Composition) */}
      <div className="md:hidden p-3 space-y-3">
        {filteredFleet.map((v) => {
          const alloc = allocationMap.get(v.vessel_id);
          const isSelected = selectedVesselId === v.vessel_id;

          return (
            <div
              key={v.vessel_id}
              onClick={() => onSelectVessel(v.vessel_id)}
              className={`p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-oceanic-panel border-telemetry-cyan glow-cyan'
                  : alloc
                  ? 'bg-oceanic-void border-oceanic-border'
                  : 'bg-oceanic-void/40 border-oceanic-border/40 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{v.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {v.vessel_type.replace('_', ' ')} • {v.dwt.toLocaleString()} DWT
                  </p>
                </div>
                {alloc ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-telemetry-seafoam/20 text-telemetry-seafoam border border-telemetry-seafoam/40">
                    {alloc.fuel_type}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">IDLE</span>
                )}
              </div>

              {alloc && (
                <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px] font-mono border-t border-oceanic-border pt-2">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Route</span>
                    <span className="text-telemetry-cyan font-semibold truncate block">
                      {alloc.route_name.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Speed</span>
                    <span className="text-slate-200">{alloc.speed_knots} kts</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[9px] uppercase">WTW GHG</span>
                    <span className="text-telemetry-seafoam font-semibold">
                      {alloc.lifecycle_ghg_tco2e.toLocaleString()} t
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
