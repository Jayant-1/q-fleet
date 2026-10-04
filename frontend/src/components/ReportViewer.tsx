import React from 'react';
import { ParetoSolution } from '../types';
import { getReportHtmlUrl, getReportJsonUrl } from '../services/api';
import { FileText, Printer, Download, ShieldCheck, CheckCircle2, AlertTriangle } from '@/components/icons';

interface ReportViewerProps {
  runId: string;
  solution: ParetoSolution | null;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ runId, solution }) => {
  if (!solution || !runId) {
    return (
      <div className="bg-oceanic-hull border border-oceanic-border rounded-xl p-8 text-center text-slate-400">
        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm">Execute an optimization run to generate an audit-grade compliance report.</p>
      </div>
    );
  }

  const htmlUrl = getReportHtmlUrl(runId, solution.solution_id);
  const jsonUrl = getReportJsonUrl(runId);

  return (
    <div className="bg-oceanic-hull border border-oceanic-border rounded-xl overflow-hidden shadow-2xl">
      {/* Report Controls Header */}
      <div className="p-4 border-b border-oceanic-border bg-oceanic-panel/60 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-telemetry-seafoam" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
            Audit-Grade Maritime ESG Compliance Ledger
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-oceanic-void hover:bg-oceanic-panel text-slate-200 border border-oceanic-border rounded text-xs font-mono transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / SAVE PDF</span>
          </button>
          <a
            href={htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-oceanic-void hover:bg-oceanic-panel text-slate-200 border border-oceanic-border rounded text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>VIEW HTML</span>
          </a>
          <a
            href={jsonUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-telemetry-cyan/15 hover:bg-telemetry-cyan/25 text-telemetry-cyan border border-telemetry-cyan/40 rounded text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON AUDIT LEDGER</span>
          </a>
        </div>
      </div>

      {/* Report Canvas Content */}
      <div className="p-6 space-y-6">
        {/* Ledger Header Banner */}
        <div className="border-b border-oceanic-border pb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-telemetry-cyan tracking-wider">
              IMO MEPC.376(80) & FuelEU Maritime Modeled Compliance
            </span>
            <h1 className="text-xl font-black text-slate-100 font-sans tracking-tight mt-1">
              MARITIME GREEN FLEET DEPLOYMENT & DISPATCH REPORT
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Run ID: <span className="text-slate-200">{runId}</span> • Plan: {solution.solution_id} ({solution.algorithm})
            </p>
          </div>

          <div className="bg-oceanic-void p-3 rounded-lg border border-oceanic-border text-right font-mono text-xs">
            <span className="text-slate-400 block text-[10px] uppercase">Compliance Status</span>
            <span className={`font-bold flex items-center justify-end gap-1.5 ${solution.is_feasible ? 'text-telemetry-seafoam' : 'text-telemetry-amber'}`}>
              {solution.is_feasible ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> 100% FEASIBLE
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" /> PENALIZED DEFICIT
                </>
              )}
            </span>
          </div>
        </div>

        {/* Executive KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
          <div className="bg-oceanic-void p-3.5 rounded-lg border border-oceanic-border">
            <span className="text-slate-400 block text-[10px] uppercase">Total Voyage Fuel Burn</span>
            <span className="text-lg font-bold text-slate-100">{solution.total_fuel_mt.toLocaleString()} MT</span>
          </div>
          <div className="bg-oceanic-void p-3.5 rounded-lg border border-oceanic-border">
            <span className="text-slate-400 block text-[10px] uppercase">Total Operating Cost</span>
            <span className="text-lg font-bold text-slate-100">${solution.total_cost_usd.toLocaleString()}</span>
          </div>
          <div className="bg-oceanic-void p-3.5 rounded-lg border border-oceanic-border">
            <span className="text-slate-400 block text-[10px] uppercase">Lifecycle GHG (WTW)</span>
            <span className="text-lg font-bold text-telemetry-seafoam">
              {solution.total_lifecycle_ghg_tco2e.toLocaleString()} tCO₂e
            </span>
          </div>
          <div className="bg-oceanic-void p-3.5 rounded-lg border border-oceanic-border">
            <span className="text-slate-400 block text-[10px] uppercase">Cargo Delivered</span>
            <span className="text-lg font-bold text-telemetry-cyan">
              {solution.total_cargo_delivered.toLocaleString()} TEU
            </span>
          </div>
        </div>

        {/* Full Allocation Table */}
        <div>
          <h3 className="text-xs font-mono uppercase text-slate-300 tracking-wider mb-2 font-bold">
            Corridor Allocation and Fuel Pathway Ledger
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-oceanic-panel/80 text-slate-400 text-[10px] uppercase border-b border-oceanic-border">
                <tr>
                  <th className="py-2 px-3">Vessel</th>
                  <th className="py-2 px-3">Corridor</th>
                  <th className="py-2 px-2 text-right">Speed</th>
                  <th className="py-2 px-3">Fuel</th>
                  <th className="py-2 px-2 text-center">Shore</th>
                  <th className="py-2 px-2 text-right">Trips</th>
                  <th className="py-2 px-3 text-right">Cargo</th>
                  <th className="py-2 px-3 text-right">Fuel (MT)</th>
                  <th className="py-2 px-3 text-right">Cost ($)</th>
                  <th className="py-2 px-3 text-right">WTW GHG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-oceanic-border text-[11px]">
                {solution.allocations.map((a) => (
                  <tr key={a.vessel_id} className="hover:bg-oceanic-panel/40">
                    <td className="py-2 px-3 font-bold text-slate-200">{a.vessel_name}</td>
                    <td className="py-2 px-3 text-telemetry-cyan">{a.route_name.split(' ')[0]}</td>
                    <td className="py-2 px-2 text-right">{a.speed_knots} kt</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-telemetry-seafoam/15 text-telemetry-seafoam">
                        {a.fuel_type}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">{a.shore_power_used ? '✓' : '—'}</td>
                    <td className="py-2 px-2 text-right">{a.round_trips}</td>
                    <td className="py-2 px-3 text-right">{a.cargo_carried.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{a.total_fuel_mt.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">${a.operational_cost_usd.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold text-telemetry-seafoam">
                      {a.lifecycle_ghg_tco2e.toLocaleString()} t
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regulatory Disclosure Footnote */}
        <div className="pt-4 border-t border-oceanic-border text-[11px] text-slate-400 font-mono space-y-1">
          <p>
            <strong>Compliance & Currency Notice:</strong> Lifecycle greenhouse gas emissions (Well-to-Wake) account for Well-to-Tank (upstream production/synthesis)
            and Tank-to-Wake (propulsion combustion). Shore power is exclusively applied during port dwell periods at compatible operational hubs with modeled shore-power connectivity.
            Bunker fuel and operating expenditures are denominated in USD ($); EU regulatory penalties (EU ETS Directive 2023/959, FuelEU Regulation 2023/1805) are assessed in EUR (€) and converted at the ECB reference benchmark of 1.08 USD/EUR.
          </p>
          <p className="text-[10px] text-slate-400">
            Developed in accordance with Smart India Hackathon Problem Statement 2 (SIH26138) Technical Specification.
          </p>
        </div>
      </div>
    </div>
  );
};
