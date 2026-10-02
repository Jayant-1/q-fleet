"""
Audit-Grade Maritime Decarbonization and Green Fleet Deployment Report Generator.
Generates comprehensive printable HTML and audit JSON ledgers adhering to IMO MEPC.376(80) standards.
"""

import hashlib
import json
import time
from typing import Dict, Any, List
from backend.app.domain.models import FleetDeploymentSolution
from backend.app.domain.fuels import FUEL_REGISTRY


class AuditReportGenerator:
    """
    Generates regulatory-grade compliance reports with cryptographic hashes,
    Well-to-Wake emissions inventories, and fleet assignment schedules.
    """
    @staticmethod
    def compute_audit_hash(run_data: Dict[str, Any]) -> str:
        """Computes deterministic SHA-256 fingerprint for scenario run auditability."""
        serialized = json.dumps(run_data, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    @staticmethod
    def generate_html_report(
        scenario_name: str,
        solution: FleetDeploymentSolution,
        problem_params: Dict[str, Any],
        benchmark_metrics: Optional[Dict[str, Any]] = None
    ) -> str:
        """Renders an executive, self-contained, printable HTML audit report."""
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        audit_hash = AuditReportGenerator.compute_audit_hash({
            "scenario": scenario_name,
            "solution_id": solution.solution_id,
            "fuel_mt": solution.total_fuel_mt,
            "cost_usd": solution.total_cost_usd,
            "ghg_tco2e": solution.total_lifecycle_ghg_tco2e
        })

        alloc_rows = ""
        for a in solution.allocations:
            fuel_spec = FUEL_REGISTRY[a.fuel_type]
            alloc_rows += f"""
            <tr>
                <td style="font-weight: 600; color: #00e5ff;">{a.vessel_name}</td>
                <td>{a.vessel_type}</td>
                <td>{a.route_name}</td>
                <td style="text-align: right;">{a.speed_knots} kts</td>
                <td><span class="badge badge-fuel">{fuel_spec.display_name}</span></td>
                <td style="text-align: center;">{'✓ Active' if a.shore_power_used else '—'}</td>
                <td style="text-align: right;">{a.round_trips}</td>
                <td style="text-align: right;">{a.cargo_carried:,.0f}</td>
                <td style="text-align: right;">{a.total_fuel_mt:,.1f} MT</td>
                <td style="text-align: right;">${a.operational_cost_usd:,.0f}</td>
                <td style="text-align: right; color: #10b981; font-weight: 600;">{a.lifecycle_ghg_tco2e:,.1f} t</td>
            </tr>
            """

        bench_section = ""
        if benchmark_metrics and "algorithms_compared" in benchmark_metrics:
            bench_rows = ""
            for bm in benchmark_metrics["algorithms_compared"]:
                bench_rows += f"""
                <tr>
                    <td style="font-weight: 600;">{bm['algorithm']}</td>
                    <td style="text-align: right;">{bm['total_evaluations']}</td>
                    <td style="text-align: right;">{bm['execution_time_seconds']}s</td>
                    <td style="text-align: right;">{bm['pareto_front_size']}</td>
                    <td style="text-align: right; color: #00e5ff;">{bm['hypervolume']:.4f}</td>
                    <td style="text-align: right;">{bm['min_fuel_mt']:,.1f} MT</td>
                    <td style="text-align: right;">${bm['min_cost_usd']:,.0f}</td>
                    <td style="text-align: right; color: #10b981;">{bm['min_lifecycle_ghg_tco2e']:,.1f} t</td>
                </tr>
                """
            bench_section = f"""
            <h2 class="section-title">Comparative Algorithm Benchmark (Budget Parity)</h2>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Algorithm</th>
                        <th>Evaluations</th>
                        <th>Runtime</th>
                        <th>Front Size</th>
                        <th>Hypervolume</th>
                        <th>Min Fuel</th>
                        <th>Min Cost</th>
                        <th>Min GHG (WTW)</th>
                    </tr>
                </thead>
                <tbody>
                    {bench_rows}
                </tbody>
            </table>
            """

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maritime ESG Audit Report - {scenario_name}</title>
    <style>
        @page {{ size: A4 landscape; margin: 15mm; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #070d18;
            color: #f8fafc;
            margin: 0;
            padding: 24px;
            font-size: 13px;
            line-height: 1.5;
        }}
        .report-header {{
            border-bottom: 2px solid #00e5ff;
            padding-bottom: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }}
        .report-title {{
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #f8fafc;
            margin: 0 0 6px 0;
        }}
        .report-subtitle {{
            color: #94a3b8;
            font-size: 12px;
            margin: 0;
        }}
        .hash-badge {{
            background: rgba(0, 229, 255, 0.1);
            border: 1px solid rgba(0, 229, 255, 0.3);
            color: #00e5ff;
            padding: 6px 12px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            text-align: right;
        }}
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }}
        .kpi-card {{
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 8px;
            padding: 14px 18px;
        }}
        .kpi-label {{
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #94a3b8;
            margin-bottom: 4px;
        }}
        .kpi-value {{
            font-size: 20px;
            font-weight: 700;
            color: #f8fafc;
        }}
        .section-title {{
            font-size: 15px;
            font-weight: 700;
            margin: 24px 0 12px 0;
            color: #00e5ff;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #1e293b;
            padding-bottom: 6px;
        }}
        .report-table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
        }}
        .report-table th {{
            background: #0f172a;
            color: #94a3b8;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #334155;
            font-weight: 600;
        }}
        .report-table td {{
            padding: 8px 10px;
            border-bottom: 1px solid #1e293b;
        }}
        .badge-fuel {{
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
        }}
        .disclaimer {{
            margin-top: 30px;
            padding-top: 12px;
            border-top: 1px solid #1e293b;
            font-size: 10px;
            color: #64748b;
        }}
        @media print {{
            body {{ background-color: #ffffff; color: #000000; }}
            .kpi-card {{ background: #f8fafc; border-color: #cbd5e1; }}
            .kpi-value {{ color: #000000; }}
            .report-table th {{ background: #f1f5f9; color: #334155; border-color: #cbd5e1; }}
            .report-table td {{ border-color: #e2e8f0; color: #000000; }}
            .section-title {{ color: #0284c7; border-color: #cbd5e1; }}
            .hash-badge {{ border-color: #94a3b8; color: #334155; }}
            .badge-fuel {{ background: #e0f2fe; color: #0369a1; }}
        }}
    </style>
</head>
<body>
    <div class="report-header">
        <div>
            <h1 class="report-title">GREEN FLEET DEPLOYMENT & ESG AUDIT LEDGER</h1>
            <p class="report-subtitle">Scenario: {scenario_name} | Optimizer: {solution.algorithm} | Generated: {timestamp}</p>
        </div>
        <div class="hash-badge">
            Audit Hash: {audit_hash[:16]}...<br>
            Standard: IMO MEPC.376(80) / FuelEU
        </div>
    </div>

    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="kpi-label">Total Voyage Fuel</div>
            <div class="kpi-value">{solution.total_fuel_mt:,.1f} MT</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Operating Cost</div>
            <div class="kpi-value">${solution.total_cost_usd:,.0f}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Lifecycle GHG (Well-to-Wake)</div>
            <div class="kpi-value" style="color: #10b981;">{solution.total_lifecycle_ghg_tco2e:,.1f} tCO₂e</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Demand Satisfaction</div>
            <div class="kpi-value">{solution.demand_satisfaction_pct:.1f}% ({'Feasible' if solution.is_feasible else 'Deficit'})</div>
        </div>
    </div>

    <h2 class="section-title">Optimal Vessel Mix & Corridor Deployment Schedule</h2>
    <table class="report-table">
        <thead>
            <tr>
                <th>Vessel</th>
                <th>Type</th>
                <th>Assigned Corridor</th>
                <th style="text-align: right;">Speed</th>
                <th>Fuel Pathway</th>
                <th style="text-align: center;">Cold Ironing</th>
                <th style="text-align: right;">Trips</th>
                <th style="text-align: right;">Cargo Delivered</th>
                <th style="text-align: right;">Fuel</th>
                <th style="text-align: right;">Cost</th>
                <th style="text-align: right;">WTW GHG</th>
            </tr>
        </thead>
        <tbody>
            {alloc_rows}
        </tbody>
    </table>

    {bench_section}

    <div class="disclaimer">
        <strong>Data Provenance & Regulatory Footnote:</strong> This audit report was synthesized by the Quantum-Inspired Fleet Optimization Engine (SIH26138).
        Emission factors, Lower Heating Values (LHV), and Well-to-Tank (WTT) / Tank-to-Wake (TTW) splits comply with IMO Resolution MEPC.376(80) and European Union Regulation (EU) 2023/1805 (FuelEU Maritime).
        Shore power is strictly applied during port berth dwell at compatible electrified berths and does not power open-ocean voyaging.
        Synthetic operational records and simulation scenarios are labeled [SYNTHETIC-SIMULATED].
    </div>
</body>
</html>
"""
        return html
