import React from 'react';
import { CorridorInfo, VesselInfo, ParetoSolution, FuelType } from '../../../types';
import { Fuel, DollarSign, Leaf, Award, Compass, Ship, Navigation } from '@/components/icons';

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
}) => {
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
      <div className="bg-white rounded-lg border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
              Active Commercial Corridor
            </div>
            <h2 className="text-sm font-semibold text-stone-900 mt-0.5">
              {activeCorridor?.name || 'Selected Route'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-stone-500">
            <span>{activeCorridor?.origin_port?.port_id} ({activeCorridor?.origin_port?.name})</span>
            <span className="text-stone-300">→</span>
            <span>{activeCorridor?.destination_port?.port_id} ({activeCorridor?.destination_port?.name})</span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-700 font-semibold">{activeCorridor?.distance_nm?.toLocaleString()} NM</span>
          </div>
        </div>

        {/* Clean Vector Visual Map Canvas */}
        <div className="relative bg-[#FAFAFA] p-6 flex flex-col items-center justify-center min-h-[280px]">
          <svg className="w-full max-w-4xl h-56" viewBox="0 0 800 300" fill="none">
            {/* World background continent silhouettes (soft minimalist gray) */}
            <path
              d="M 120,60 Q 200,40 260,80 T 320,140 Q 300,200 240,240 T 160,220 Z"
              fill="#E5E7EB"
              opacity="0.6"
            />
            <path
              d="M 380,40 Q 480,30 580,70 T 700,120 Q 680,220 560,250 T 420,200 Z"
              fill="#E5E7EB"
              opacity="0.6"
            />
            <path
              d="M 300,130 Q 350,110 380,140 T 370,220 Q 320,240 290,200 Z"
              fill="#E5E7EB"
              opacity="0.5"
            />

            {/* Geodesic Route Path */}
            <path
              d="M 180,110 Q 320,70 420,150 T 640,110"
              stroke="#EA580C"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="animate-pulse"
            />

            {/* Waypoint Nodes */}
            <g transform="translate(180, 110)">
              <circle r="7" fill="#EA580C" />
              <circle r="14" fill="#EA580C" opacity="0.2" />
              <text x="-10" y="-14" fill="#111827" fontSize="11" fontWeight="bold">
                {activeCorridor?.origin_port?.port_id || 'ORIGIN'}
              </text>
            </g>

            <g transform="translate(330, 95)">
              <circle r="4" fill="#4B5563" />
              <text x="-15" y="16" fill="#6B7280" fontSize="10">
                Malacca (WP1)
              </text>
            </g>

            <g transform="translate(420, 150)">
              <circle r="4" fill="#4B5563" />
              <text x="-10" y="18" fill="#6B7280" fontSize="10">
                Suez (WP2)
              </text>
            </g>

            <g transform="translate(530, 125)">
              <circle r="4" fill="#4B5563" />
              <text x="-15" y="16" fill="#6B7280" fontSize="10">
                Gibraltar (WP3)
              </text>
            </g>

            <g transform="translate(640, 110)">
              <circle r="7" fill="#EA580C" />
              <circle r="14" fill="#EA580C" opacity="0.2" />
              <text x="-25" y="-14" fill="#111827" fontSize="11" fontWeight="bold">
                {activeCorridor?.destination_port?.port_id || 'DEST'}
              </text>
            </g>
          </svg>
        </div>

        {/* Integrated Chart HUD Telemetry Strip */}
        <div className="border-t border-stone-100 bg-stone-50/70 px-5 py-2.5 flex flex-wrap items-center justify-between text-xs font-mono text-stone-600 gap-3">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-stone-400">Cruising Speed:</span>{' '}
              <strong className="text-stone-900 font-semibold">{speedKnots.toFixed(1)} kts</strong>
            </div>
            <div>
              <span className="text-stone-400">Cold Ironing:</span>{' '}
              <span className="text-stone-700">{activeCorridor?.destination_port?.has_cold_ironing ? 'Available' : 'Auxiliary'}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-stone-400">Projection:</span>{' '}
              <span className="text-stone-700">WGS-84 Geodesic</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('physics')}
            className="text-stone-600 hover:text-stone-900 font-medium transition-colors"
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
      </div>
  );
};
