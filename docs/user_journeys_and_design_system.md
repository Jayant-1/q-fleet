# User Journeys and Maritime "Data as Art" Design System
## UX Architecture, Responsive Art Direction, and Design Tokens

### 1. User Journey
1. **Scenario Selection**: Officer loads "Global Liner Decarbonization 2026" scenario with pre-configured cargo demands across 5 corridors (Asia-Europe, Transpacific, Intra-Europe, Transatlantic, Indian Ocean).
2. **Policy Sandbox Tuning**: Modifies carbon tax lever ($120/ton), toggles extreme winter sea state multiplier, tests methanol bunkering price drop.
3. **Execution & Telemetry**: Launches Quantum-Inspired Fleet Optimization (MO-QIEA); watches real-time generation convergence telemetry.
4. **Pareto Trade-Off Inspection**: Explores interactive 3D/2D Pareto curve comparing cost vs emissions vs fuel. Clicks knee-point solution to inspect vessel assignment matrix.
5. **Fuel Lifecycle & Shore Power Audit**: Reviews Well-to-Tank vs Tank-to-Wake breakdown and cold-ironing emission offsets at port.
6. **Benchmark Validation**: Inspects Quantum vs Classical lab showing hypervolume and convergence curves against NSGA-II.
7. **Executive Audit Report Export**: Downloads official ESG compliance ledger with run hashes and IMO-compliant carbon accounting.

---

### 2. "Data as Art" Maritime Design System

#### Color Palette
- **Abyssal Base**: `#070d18` (deep oceanic void)
- **Hull Surface**: `#0f172a` (slate navigation panel)
- **Border Stroke**: `#1e293b` (subtle bulkhead seam)
- **Bioluminescent Cyan (Primary Data)**: `#00e5ff` (clean telemetry, active routes)
- **Seafoam Emerald (Green/Zero-Emission)**: `#10b981` (green fuels, feasible solutions)
- **Solar Amber (Cost/Warning)**: `#f59e0b` (fuel expense, weather alert)
- **Quantum Violet (Superposition/Algorithm)**: `#d946ef` (Q-bits, rotation gates, Pareto knee)
- **Clean Polar White (Typography)**: `#f8fafc`

#### Responsive Art Direction ("The Design Adapts, Not Shrinks")
- **Desktop (≥ 1280px)**: 12-column asymmetric spatial composition. Canvas route map spans 7 columns with live weather vectors; 5-column live telemetry and Pareto inspector on right.
- **Tablet (768px - 1279px)**: Balanced editorial layout. Route map switches to a high-contrast corridor card matrix with integrated micro-charts.
- **Mobile (< 768px)**: Intimate touch-first vertical stack. Sticky corridor status bar, swipeable Pareto trade-off cards, and thumb-accessible scenario controls. Zero horizontal clipping.
