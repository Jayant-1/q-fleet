"""
Audit-Grade Maritime Decarbonization and Green Fleet Deployment Report Generator.
Generates comprehensive printable HTML and audit JSON ledgers adhering to IMO MEPC.376(80) standards.
"""

import html
import hashlib
import json
import time
from typing import Dict, Any, List, Optional
from backend.app.domain.models import FleetDeploymentSolution
from backend.app.domain.fuels import FuelType, FUEL_REGISTRY


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
        benchmark_metrics: Optional[Dict[str, Any]] = None,
        audit_hash: Optional[str] = None
    ) -> str:
        """Renders an executive, self-contained, printable HTML audit report."""
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        if not audit_hash:
            audit_hash = AuditReportGenerator.compute_audit_hash({
                "scenario": scenario_name,
                "solution_id": solution.solution_id,
                "fuel_mt": solution.total_fuel_mt,
                "cost_usd": solution.total_cost_usd,
                "ghg_tco2e": solution.total_lifecycle_ghg_tco2e
            })

        scenario_name_safe = html.escape(str(scenario_name))
        alloc_rows = ""
        for a in solution.allocations:
            f_type = a.fuel_type if isinstance(a.fuel_type, FuelType) else FuelType(a.fuel_type)
            fuel_spec = FUEL_REGISTRY.get(f_type, FUEL_REGISTRY[FuelType.VLSFO])
            cii_gr = getattr(a, "cii_rating", "C")
            aer_val = getattr(a, "attained_aer", 0.0)
            fueleu_pen = getattr(a, "fueleu_deficit_penalty_usd", 0.0)
            ets_cost = getattr(a, "eu_ets_cost_usd", 0.0)

            # Safe HTML escaping
            vessel_name_safe = html.escape(str(a.vessel_name))
            vessel_type_safe = html.escape(str(a.vessel_type).replace('Container_', ''))
            route_name_safe = html.escape(str(a.route_name))
            fuel_disp_safe = html.escape(str(fuel_spec.display_name))

            applied_spd = getattr(a, "applied_speed_knots", getattr(a, "speed_knots", 0.0))
            target_spd = getattr(a, "target_speed_knots", None)
            spd_reason = getattr(a, "speed_adjustment_reason", "")
            fuel_reason = getattr(a, "fuel_adjustment_reason", "")
            applied_draft = getattr(a, "applied_draft_meters", 0.0)

            spd_html = f"{applied_spd:.1f} kts"
            if target_spd is not None and abs(target_spd - applied_spd) > 0.05:
                spd_html += f'<br><span style="font-size: 10px; color: #94a3b8;">(tgt: {target_spd:.1f})</span>'
            if spd_reason:
                spd_html += f'<br><span style="font-size: 9px; color: #f59e0b;">{html.escape(spd_reason)}</span>'

            fuel_html = f'<span class="badge badge-fuel">{fuel_disp_safe}</span>'
            if fuel_reason:
                fuel_html += f'<br><span style="font-size: 9px; color: #94a3b8;">{html.escape(fuel_reason)}</span>'

            draft_info = f'<br><span style="font-size: 10px; color: #64748b;">Draft: {applied_draft:.1f}m</span>' if applied_draft > 0 else ''

            alloc_rows += f"""
            <tr>
                <td style="font-weight: 600; color: #00e5ff;">{vessel_name_safe}{draft_info}</td>
                <td>{vessel_type_safe}</td>
                <td>{route_name_safe}</td>
                <td style="text-align: right;">{spd_html}</td>
                <td>{fuel_html}</td>
                <td style="text-align: center;">{'✓ Active' if a.shore_power_used else '—'}</td>
                <td style="text-align: center;"><b>{cii_gr}</b></td>
                <td style="text-align: right;">{aer_val:.2f}</td>
                <td style="text-align: right;">{a.cargo_carried:,.0f}</td>
                <td style="text-align: right;">{a.total_fuel_mt:,.1f} MT</td>
                <td style="text-align: right;">${a.operational_cost_usd:,.0f}</td>
                <td style="text-align: right; color: #ef4444;">${fueleu_pen:,.0f}</td>
                <td style="text-align: right; color: #f59e0b;">${ets_cost:,.0f}</td>
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

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maritime ESG Audit Report - {scenario_name_safe}</title>
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
            <p class="report-subtitle">Scenario: {scenario_name_safe} | Optimizer: {solution.algorithm} | Generated: {timestamp}</p>
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
            <div class="kpi-label">Fleet IMO CII Grade</div>
            <div class="kpi-value" style="color: #ff6b00;">Grade {getattr(solution, 'fleet_average_cii_rating', 'C')}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">FuelEU Deficit Penalty</div>
            <div class="kpi-value" style="color: #ef4444;">${getattr(solution, 'total_fueleu_penalty_usd', 0.0):,.0f}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">EU ETS Allowance Cost</div>
            <div class="kpi-value" style="color: #f59e0b;">${getattr(solution, 'total_eu_ets_cost_usd', 0.0):,.0f}</div>
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
                <th style="text-align: center;">CII Grade</th>
                <th style="text-align: right;">AER</th>
                <th style="text-align: right;">Cargo</th>
                <th style="text-align: right;">Fuel</th>
                <th style="text-align: right;">Cost</th>
                <th style="text-align: right;">FuelEU Pen</th>
                <th style="text-align: right;">EU ETS</th>
                <th style="text-align: right;">WTW GHG</th>
            </tr>
        </thead>
        <tbody>
            {alloc_rows}
        </tbody>
    </table>

    {bench_section}

    <div class="disclaimer">
        <strong>Data Provenance & Mathematical Simulation Footnote:</strong> This audit report was synthesized by the Quantum-Inspired Fleet Optimization Engine (SIH26138).
        The SHA-256 fingerprint documents mathematical input/output simulation determinism under the specified random seed and configuration (rather than statutory third-party verifier certification).
        Emission factors, Lower Heating Values (LHV), and Well-to-Tank (WTT) / Tank-to-Wake (TTW) splits comply with IMO Resolution MEPC.376(80), IMO MEPC.354(78) (CII Calculation Guidelines), Directive (EU) 2023/959 (EU ETS), and European Union Regulation (EU) 2023/1805 (FuelEU Maritime).
        Cryptographic verification fingerprint: <code>{audit_hash}</code>.
    </div>
</body>
</html>
"""
        return html_content

    @staticmethod
    def generate_pdf_report(
        scenario_name: str,
        solution: FleetDeploymentSolution,
        problem_params: Dict[str, Any],
        benchmark_metrics: Optional[Dict[str, Any]] = None,
        audit_hash: Optional[str] = None
    ) -> bytes:
        """
        Generates an audit-grade binary PDF report using ReportLab.
        Adheres to IMO MEPC.354(78) and FuelEU Maritime audit standards.
        """
        import io
        from reportlab.lib.pagesizes import letter, landscape
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(letter),
            leftMargin=24,
            rightMargin=24,
            topMargin=22,
            bottomMargin=22
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#08080a"),
            fontName="Helvetica-Bold"
        )
        subtitle_style = ParagraphStyle(
            "DocSubtitle",
            parent=styles["Normal"],
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#555555"),
            fontName="Helvetica"
        )
        section_style = ParagraphStyle(
            "SectionHeader",
            parent=styles["Heading2"],
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#ff6b00"),
            fontName="Helvetica-Bold",
            spaceBefore=6,
            spaceAfter=4
        )
        table_cell = ParagraphStyle(
            "TableCell",
            fontSize=6.5,
            leading=8,
            fontName="Helvetica"
        )
        table_cell_bold = ParagraphStyle(
            "TableCellBold",
            fontSize=6.5,
            leading=8,
            fontName="Helvetica-Bold"
        )

        story = []

        # 1. Header
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        if not audit_hash:
            audit_hash = AuditReportGenerator.compute_audit_hash({
                "scenario": scenario_name,
                "solution_id": solution.solution_id,
                "fuel_mt": solution.total_fuel_mt,
                "cost_usd": solution.total_cost_usd,
                "ghg_tco2e": solution.total_lifecycle_ghg_tco2e
            })

        scenario_name_safe = html.escape(str(scenario_name))
        story.append(Paragraph("GREEN FLEET DEPLOYMENT & ESG AUDIT LEDGER", title_style))
        story.append(Paragraph(
            f"Scenario: <b>{scenario_name_safe}</b> | Generated: {timestamp} | Cryptographic SHA-256 Hash: {audit_hash}",
            subtitle_style
        ))
        story.append(Spacer(1, 6))

        # 2. Executive KPIs Table
        kpi_data = [
            ["Total Fuel Burn", "Operating Cost (USD)", "Lifecycle GHG (WTW)", "Fleet IMO CII", "FuelEU Penalty", "EU ETS Cost", "Demand Feasibility"],
            [
                f"{solution.total_fuel_mt:,.1f} MT",
                f"${solution.total_cost_usd:,.0f}",
                f"{solution.total_lifecycle_ghg_tco2e:,.1f} tCO2e",
                f"Grade {getattr(solution, 'fleet_average_cii_rating', 'C')}",
                f"${getattr(solution, 'total_fueleu_penalty_usd', 0.0):,.0f}",
                f"${getattr(solution, 'total_eu_ets_cost_usd', 0.0):,.0f}",
                f"{solution.demand_satisfaction_pct:.1f}% ({'Feasible' if solution.is_feasible else 'Deficit'})"
            ]
        ]
        kpi_table = Table(kpi_data, colWidths=[105, 115, 115, 85, 100, 95, 105])
        kpi_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f1115")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#ffffff")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
            ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#f4f4f6")),
            ("TEXTCOLOR", (0, 1), (-1, 1), colors.HexColor("#08080a")),
            ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 1), (-1, 1), 9),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dddddd"))
        ]))
        story.append(kpi_table)
        story.append(Spacer(1, 12))

        # 3. Vessel Allocation Table
        story.append(Paragraph("Optimal Vessel Mix & Corridor Deployment Schedule", section_style))
        headers = [
            Paragraph("<b>Vessel</b>", table_cell_bold),
            Paragraph("<b>Type</b>", table_cell_bold),
            Paragraph("<b>Corridor</b>", table_cell_bold),
            Paragraph("<b>Speed</b>", table_cell_bold),
            Paragraph("<b>Fuel</b>", table_cell_bold),
            Paragraph("<b>CII</b>", table_cell_bold),
            Paragraph("<b>AER</b>", table_cell_bold),
            Paragraph("<b>Cargo</b>", table_cell_bold),
            Paragraph("<b>Fuel (MT)</b>", table_cell_bold),
            Paragraph("<b>Cost ($)</b>", table_cell_bold),
            Paragraph("<b>FuelEU ($)</b>", table_cell_bold),
            Paragraph("<b>ETS ($)</b>", table_cell_bold),
            Paragraph("<b>GHG (t)</b>", table_cell_bold)
        ]
        alloc_table_data = [headers]

        for a in solution.allocations:
            f_type = a.fuel_type if isinstance(a.fuel_type, FuelType) else FuelType(a.fuel_type)
            fuel_spec = FUEL_REGISTRY.get(f_type, FUEL_REGISTRY[FuelType.VLSFO])
            cii_gr = getattr(a, "cii_rating", "C")
            aer_val = getattr(a, "attained_aer", 0.0)
            fueleu_pen = getattr(a, "fueleu_deficit_penalty_usd", 0.0)
            ets_cost = getattr(a, "eu_ets_cost_usd", 0.0)

            # Safe XML escaping for ReportLab Paragraph
            vessel_name_safe = html.escape(str(a.vessel_name))
            vessel_type_safe = html.escape(str(a.vessel_type).replace("Container_", ""))
            route_name_safe = html.escape(str(a.route_name))
            fuel_name_safe = html.escape(str(fuel_spec.display_name))

            applied_spd = getattr(a, "applied_speed_knots", getattr(a, "speed_knots", 0.0))
            target_spd = getattr(a, "target_speed_knots", None)
            spd_reason = getattr(a, "speed_adjustment_reason", "")
            fuel_reason = getattr(a, "fuel_adjustment_reason", "")
            applied_draft = getattr(a, "applied_draft_meters", 0.0)

            spd_cell = f"{applied_spd:.1f} kn"
            if target_spd is not None and abs(target_spd - applied_spd) > 0.05:
                spd_cell += f"<br/><font size=5.5 color='#666666'>(tgt {target_spd:.1f})</font>"
            if spd_reason:
                spd_cell += f"<br/><font size=5 color='#b45309'>{html.escape(spd_reason[:24])}</font>"

            fuel_cell = fuel_name_safe[:12]
            if fuel_reason:
                fuel_cell += f"<br/><font size=5 color='#666666'>{html.escape(fuel_reason[:20])}</font>"

            vessel_cell = vessel_name_safe[:18]
            if applied_draft > 0:
                vessel_cell += f"<br/><font size=5.5 color='#666666'>T: {applied_draft:.1f}m</font>"

            row = [
                Paragraph(vessel_cell, table_cell),
                Paragraph(vessel_type_safe[:10], table_cell),
                Paragraph(route_name_safe[:16], table_cell),
                Paragraph(spd_cell, table_cell),
                Paragraph(fuel_cell, table_cell),
                Paragraph(f"<b>{cii_gr}</b>", table_cell_bold),
                Paragraph(f"{aer_val:.1f}", table_cell),
                Paragraph(f"{a.cargo_carried:,.0f}", table_cell),
                Paragraph(f"{a.total_fuel_mt:,.1f}", table_cell),
                Paragraph(f"${a.operational_cost_usd:,.0f}", table_cell),
                Paragraph(f"${fueleu_pen:,.0f}", table_cell),
                Paragraph(f"${ets_cost:,.0f}", table_cell),
                Paragraph(f"{a.lifecycle_ghg_tco2e:,.1f}", table_cell)
            ]
            alloc_table_data.append(row)

        alloc_table = Table(alloc_table_data, colWidths=[70, 52, 85, 38, 65, 28, 32, 45, 48, 56, 50, 50, 48])
        alloc_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e5e7eb")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ("ALIGN", (3, 1), (-1, -1), "RIGHT")
        ]))
        story.append(alloc_table)
        story.append(Spacer(1, 10))

        # 4. Footnote
        footnote = Paragraph(
            "<b>Data Provenance & Mathematical Simulation Footnote:</b> Calculated in accordance with IMO Resolution MEPC.376(80), "
            "IMO MEPC.354(78) (CII Calculation Guidelines), Directive (EU) 2023/959 (EU ETS), and European Union Regulation (EU) 2023/1805 (FuelEU Maritime). "
            "The SHA-256 fingerprint documents mathematical input/output simulation determinism under the specified random seed and configuration (it does NOT constitute statutory third-party verifier certification): " + audit_hash,
            subtitle_style
        )
        story.append(footnote)

        doc.build(story)
        return buffer.getvalue()

