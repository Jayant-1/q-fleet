import React, { useState } from 'react';
import { CorridorInfo, VesselInfo, ParetoSolution, FuelType } from '../../../types';
import { Fuel, DollarSign, Leaf, Award, Compass, Ship, Navigation, AlertTriangle, Globe } from '@/components/icons';
import { RouteSpecsModal } from '../routes/RouteSpecsModal';
import { MaritimeRealisticMap } from '../map/MaritimeRealisticMap';

interface Props {
  corridors: CorridorInfo[];
  activeCorridorId: string;
  setActiveCorridorId: (id: string) => void;
  activeCorridor: CorridorInfo | null;
  fleet: VesselInfo[];
  selectedSolution: ParetoSolution | null;
  speedKnots: number;
  carbonPriceEur: number;
  onNavigateTab: (tabId: string) => void;
  onOpenDisruption?: () => void;
}

export const DashboardOverviewTab: React.FC<Props> = ({
  corridors,
  activeCorridorId,
  setActiveCorridorId,
  activeCorridor,
  fleet,
  selectedSolution,
  speedKnots,
  carbonPriceEur,
  onNavigateTab,
  onOpenDisruption,
}) => {
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const hasSolution = !!selectedSolution;
  const totalFuelMt = selectedSolution?.total_fuel_mt;
  const totalCostUsd = selectedSolution?.total_cost_usd;
  const totalGhgTons = selectedSolution?.total_lifecycle_ghg_tco2e;
  const ciiGrade = selectedSolution?.fleet_average_cii_rating;
  const ciiGradeColor =
    ciiGrade === 'A'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : ciiGrade === 'B'
      ? 'bg-teal-50 text-teal-700 border-teal-200'
      : ciiGrade === 'C'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <div className="space-y-6">
      {/* 1. Precision Naval Telemetry Dock (Unified Minimalist Strip) */}
      <div className="bg-white border border-stone-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
          {/* Cell 1: Fuel Consumption */}
          <div className="p-4 sm:p-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-medium">
              Total Fuel Burn
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight text-stone-900 tabular-nums font-mono">
                {hasSolution && totalFuelMt != null ? totalFuelMt.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—'}
              </span>
              {hasSolution && <span className="text-xs font-mono text-stone-400">MT</span>}
            </div>
            <div className="mt-2 text-[11px] text-stone-500 font-mono">
              {hasSolution ? (
                <span>Pareto knee · <strong className="text-stone-700 font-medium">{selectedSolution.algorithm}</strong></span>
              ) : (
                <span className="text-stone-400">Awaiting optimizer execution</span>
              )}
            </div>
          </div>

          {/* Cell 2: Operating Outlay */}
          <div className="p-4 sm:p-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-medium">
              Estimated Outlay
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight text-stone-900 tabular-nums font-mono">
                {hasSolution && totalCostUsd != null ? `$${(totalCostUsd / 1e6).toFixed(2)}` : '—'}
              </span>
              {hasSolution && <span className="text-xs font-mono text-stone-400">M</span>}
            </div>
            <div className="mt-2 text-[11px] text-stone-500 font-mono">
              {hasSolution ? (
                <span>Includes ${carbonPriceEur}/t carbon price</span>
              ) : (
                <span className="text-stone-400">Awaiting optimizer execution</span>
              )}
            </div>
          </div>

          {/* Cell 3: Lifecycle GHG Emissions */}
          <div className="p-4 sm:p-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-medium">
              Lifecycle GHG (WTW)
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight text-stone-900 tabular-nums font-mono">
                {hasSolution && totalGhgTons != null ? totalGhgTons.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}
              </span>
              {hasSolution && <span className="text-xs font-mono text-stone-400">tCO₂e</span>}
            </div>
            <div className="mt-2 text-[11px] text-stone-500 font-mono">
              {hasSolution ? (
                <span>Well-to-Wake · IMO MEPC.376</span>
              ) : (
                <span className="text-stone-400">Awaiting optimizer execution</span>
              )}
            </div>
          </div>

          {/* Cell 4: IMO CII Grade */}
          <div className="p-4 sm:p-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-medium">
              IMO CII Compliance
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-stone-900 tabular-nums font-mono">
                {hasSolution && ciiGrade ? `Grade ${ciiGrade}` : 'Pending'}
              </span>
              {hasSolution && ciiGrade && (
                <span className="text-xs font-mono text-stone-400">
                  {ciiGrade === 'A' ? 'Superior' : ciiGrade === 'B' ? 'Compliant' : ciiGrade === 'C' ? 'Standard' : 'Action Req.'}
                </span>
              )}
            </div>
            <div className="mt-2 text-[11px] text-stone-500 font-mono">
              {hasSolution ? (
                <span>Indicative voyage estimate (MEPC.354(78))</span>
              ) : (
                <span className="text-stone-400">Run optimizer to evaluate</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Route & Interactive Map Card */}
      <div data-testid="active-corridor-card" className="bg-white rounded-lg border border-stone-200/90 shadow-2xs overflow-hidden">
        {/* Card Header with Port Telemetry & Actions */}
        <div className="px-5 py-3.5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
              Active Commercial Corridor
            </div>
            <h2 className="text-sm font-semibold text-stone-900 mt-0.5">
              {activeCorridor?.name || 'Selected Route'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-stone-500">
              <span>{activeCorridor?.origin_port?.port_id} ({activeCorridor?.origin_port?.name})</span>
              <span className="text-stone-300">→</span>
              <span>{activeCorridor?.destination_port?.port_id} ({activeCorridor?.destination_port?.name})</span>
              <span className="text-stone-300">·</span>
              <span className="text-stone-700 font-semibold">{activeCorridor?.distance_nm?.toLocaleString()} NM</span>
            </div>

            {/* Route Specs Matrix Comparison Trigger */}
            <button
              onClick={() => setIsSpecsOpen(true)}
              data-testid="open-route-specs-btn"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/90 hover:border-stone-300 rounded-md transition-colors shadow-2xs cursor-pointer"
              title="Compare All 7 Global Corridors & Transport Specs"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>Route Specs</span>
            </button>

            {onOpenDisruption && (
              <button
                onClick={onOpenDisruption}
                data-testid="nav-disruption-lab-btn"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 border border-amber-200/90 rounded-md transition-colors shadow-2xs cursor-pointer"
                title="Simulate Route Disruptions (Sea-state surge, Port delays, Carbon tax spikes)"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Disruption Lab</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Corridor Quick-Switcher Strip (Breathable, zero horizontal scrollbar) */}
        <div className="px-5 py-2.5 bg-stone-50/70 border-b border-stone-100 flex flex-wrap items-center gap-2.5 overflow-hidden">
          <span className="text-xs font-mono text-stone-500 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Corridors:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {corridors.map((c) => {
              const isActive = c.route_id === activeCorridorId;
              return (
                <button
                  key={c.route_id}
                  onClick={() => setActiveCorridorId(c.route_id)}
                  data-testid={`corridor-chip-${c.route_id}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs ${
                    isActive
                      ? 'bg-stone-900 text-white font-semibold ring-1 ring-stone-900 shadow-xs'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/90 hover:border-stone-300'
                  }`}
                  title={`${c.name} (${c.distance_nm.toLocaleString()} NM)`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                  <span className="font-semibold">{c.origin_port?.port_id}→{c.destination_port?.port_id}</span>
                  <span className={`text-[11px] ${isActive ? 'text-stone-300' : 'text-stone-400'}`}>
                    ({(c.distance_nm / 1000).toFixed(1)}k NM)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Realistic Maritime Interactive GIS Map Engine */}
        <MaritimeRealisticMap
          corridors={corridors}
          activeCorridorId={activeCorridorId}
          onSelectCorridor={setActiveCorridorId}
          speedKnots={speedKnots}
        />

        {/* Integrated Chart HUD Telemetry Strip */}
        <div className="border-t border-stone-100 bg-stone-50/70 px-5 py-2.5 flex flex-wrap items-center justify-between text-xs font-mono text-stone-600 gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-stone-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-stone-500">Live Cartography:</span>{' '}
              <strong className="text-stone-900 font-semibold">WGS-84</strong>
            </div>
            <div>
              <span className="text-stone-400">Cruising Speed:</span>{' '}
              <strong className="text-stone-900 font-semibold">{speedKnots.toFixed(1)} kts</strong>
            </div>
            <div>
              <span className="text-stone-400">Max Transit:</span>{' '}
              <span className="text-stone-800 font-semibold">{activeCorridor?.max_transit_time_days}d</span>
            </div>
            <div>
              <span className="text-stone-400">Cold Ironing:</span>{' '}
              <span className="text-stone-700">{activeCorridor?.destination_port?.has_cold_ironing ? 'Available' : 'Auxiliary'}</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('physics')}
            className="text-stone-600 hover:text-stone-900 font-medium transition-colors cursor-pointer"
          >
            Adjust Physics →
          </button>
        </div>
      </div>

      {/* 3. Fleet Deployment Table */}
      <div className="bg-white rounded-lg border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
              Fleet Assignment
            </div>
            <h3 className="text-sm font-semibold text-stone-900 mt-0.5">
              Corridor Vessel Allocation & Hydrodynamics
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-400">
            {selectedSolution?.allocations ? selectedSolution.allocations.length : Math.min(fleet.length, 3)} Vessels Deployed
          </span>
        </div>

        <div className="w-full max-w-full overflow-x-auto min-w-0">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-50/80 border-b border-stone-100 text-stone-400 font-medium uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-normal">Vessel Name</th>
                <th className="py-2.5 px-4 font-normal">Class</th>
                <th className="py-2.5 px-4 text-right font-normal">Deadweight (DWT)</th>
                <th className="py-2.5 px-4 text-center font-normal">Fuel</th>
                <th className="py-2.5 px-4 text-right font-normal">Speed</th>
                <th className="py-2.5 px-4 text-center font-normal">Shore Power</th>
                <th className="py-2.5 px-4 text-center font-normal">CII</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
                {selectedSolution?.allocations && selectedSolution.allocations.length > 0 ? (
                  selectedSolution.allocations.map((a, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-stone-900">{a.vessel_name}</td>
                      <td className="py-2.5 px-4 text-stone-500">{a.vessel_type}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-stone-700">{a.cargo_carried?.toLocaleString()} t</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-stone-100 text-stone-700 border border-stone-200">
                          {a.fuel_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-stone-900 tabular-nums">
                        {a.speed_knots.toFixed(1)} kts
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-[11px]">
                        {a.shore_power_used ? (
                          <span className="text-emerald-700">Cold Ironed</span>
                        ) : (
                          <span className="text-stone-400">Auxiliary</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-1.5 py-0.5 rounded font-mono text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                          Grade {a.cii_rating || 'B'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  fleet.slice(0, 3).map((v) => (
                    <tr key={v.vessel_id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-stone-900">{v.name}</td>
                      <td className="py-2.5 px-4 text-stone-500">{v.vessel_type}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-stone-700">{v.dwt?.toLocaleString()} t</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-stone-100 text-stone-700 border border-stone-200">
                          {v.compatible_fuels[0]}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-stone-900 tabular-nums">
                        {speedKnots.toFixed(1)} kts
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-[11px]">
                        {v.has_shore_power_connection ? (
                          <span className="text-emerald-700">Available</span>
                        ) : (
                          <span className="text-stone-400">No</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-1.5 py-0.5 rounded font-mono text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                          Grade {v.cii_rating_baseline || 'B'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* 4. Global Corridors Specifications & Trade Matrix Drawer Modal */}
      <RouteSpecsModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
        corridors={corridors}
        activeCorridorId={activeCorridorId}
        onSelectCorridor={setActiveCorridorId}
      />
    </div>
  );
};
