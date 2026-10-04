import React from 'react';
import { Compass, ArrowDown } from 'iconoir-react';
import { QFleetLogo } from '../brand/QFleetLogo';
import { HydrodynamicSlider } from './HydrodynamicSlider';
import { QuantumParetoTeaser } from './QuantumParetoTeaser';
import { FuelTaxScrubber } from './FuelTaxScrubber';
import { BenchmarkTable } from './BenchmarkTable';
import { InteractiveHeroVessel } from './InteractiveHeroVessel';
import { MatteNoiseShaderBackground } from './MatteNoiseShaderBackground';

interface Props {
  speedKnots: number;
  setSpeedKnots: (v: number) => void;
  waveHeight: number;
  setWaveHeight: (v: number) => void;
  onEnterCockpit: (e?: React.MouseEvent | { clientX: number; clientY: number }) => void;
}

export const EditorialShowcase: React.FC<Props> = ({
  speedKnots,
  setSpeedKnots,
  waveHeight,
  setWaveHeight,
  onEnterCockpit,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#131315] text-[#fafafa] font-sans selection:bg-[#ff6b00] selection:text-black">
      {/* High-End GPU Procedural Matte Noise Shader Background */}
      <MatteNoiseShaderBackground intensity={1.0} />

      <div className="relative z-10">

      {/* Top Fixed Swiss Navigation Bar (Height: 64px) */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-[#131315]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 md:px-12 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 select-none">
          <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-white flex items-center gap-2.5 select-none">
            <QFleetLogo className="w-5 h-5 shrink-0" color="#ff6b00" dotColor="#ffffff" />
            Q-FLEET
          </span>
          <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-wider text-zinc-500 border-l border-white/10 pl-3 select-none">
            MARITIME DECISION SUPPORT
          </span>
        </div>

        {/* Essential Navigation Links */}
        <nav className="hidden xl:flex items-center justify-center gap-6 font-mono text-xs uppercase tracking-wider text-zinc-400">
          <button
            onClick={() => scrollTo('problem')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Problem
          </button>
          <button
            onClick={() => scrollTo('workflow')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Workflow
          </button>
          <button
            onClick={() => scrollTo('physics')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Physics
          </button>
          <button
            onClick={() => scrollTo('optimization')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Optimization
          </button>
          <button
            onClick={() => scrollTo('regulations')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Regulations
          </button>
          <button
            onClick={() => scrollTo('evidence')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Evidence
          </button>
          <button
            onClick={() => scrollTo('outputs')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Deliverables
          </button>
        </nav>

        {/* Primary Action CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => onEnterCockpit(e)}
            className="font-mono text-xs px-3 sm:px-4 py-2 bg-[#ff6b00] hover:bg-[#ff8533] text-black font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>OPEN DASHBOARD</span>
            <span className="hidden sm:inline text-[10px] bg-black/20 px-1 py-0.5 rounded-none">[⌘K]</span>
          </button>
        </div>
      </header>

      {/* SECTION 1: THE OUTCOME-LED HERO */}
      <section id="hero" className="relative min-h-[100dvh] pt-24 pb-16 px-4 sm:px-6 md:px-12 flex flex-col justify-center border-b border-white/10 max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-6">
          {/* Left Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow */}
            <div className="font-mono text-[11px] text-[#ff6b00] uppercase tracking-[0.2em] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-pulse" />
              MARITIME DECISION SUPPORT // IMO MEPC.354(78) · EU ETS · FUELEU MARITIME
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold uppercase tracking-tight text-white leading-[1.02] pb-1">
              Plan lower-carbon voyages without losing sight of cost or schedule.
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-zinc-300 font-sans leading-relaxed max-w-[58ch]">
              Q-FLEET compares fleet, route, speed, and fuel allocations across complex commercial constraints—showing the exact trade-offs between bunker consumption, operating expenditure, lifecycle emissions, and arrival deadlines.
            </p>

            {/* Supporting Micro-Note */}
            <p className="font-mono text-xs text-zinc-500 italic max-w-[55ch]">
              Powered by first-principles naval hydrodynamics, 25,691 official EMSA THETIS-MRV annual reports, and quantum-inspired multi-objective optimization.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={(e) => onEnterCockpit(e)}
                className="px-6 py-3.5 bg-[#ff6b00] hover:bg-[#ff8533] text-black font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>PLAN A SAMPLE VOYAGE →</span>
              </button>

              <button
                onClick={() => scrollTo('workflow')}
                className="px-5 py-3.5 border border-white/20 hover:border-white text-zinc-200 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>SEE HOW IT WORKS</span>
                <ArrowDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => scrollTo('evidence')}
                className="px-5 py-3.5 border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                REVIEW BENCHMARKS
              </button>
            </div>

            {/* Sub-hero Scenario Context Strip */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4 sm:gap-6 font-mono text-[11px] text-zinc-500">
              <div>SCENARIO: <span className="text-zinc-300">SHANGHAI → ROTTERDAM (10,500 NM)</span></div>
              <div>VESSEL: <span className="text-zinc-300">15,000 TEU CONTAINER</span></div>
              <div>BUDGET: <span className="text-[#ff6b00]">1,050 EVALS (SEED N=42)</span></div>
              <div>STATUS: <span className="text-zinc-400">MODELED DEMO · NOT LIVE AIS</span></div>
            </div>
          </div>

          {/* Right Column (5 Cols) — Interactive Vessel bow wave inspector */}
          <div className="lg:col-span-5 relative">
            <InteractiveHeroVessel />
          </div>
        </div>
      </section>

      {/* SECTION 2: THE OPERATIONAL PROBLEM (The Maritime Balancing Act) */}
      <section id="problem" className="py-20 md:py-28 px-4 sm:px-6 md:px-12 border-b border-white/10 max-w-[1500px] mx-auto scroll-mt-16">
        <div className="max-w-[1000px]">
          <div className="font-mono text-[11px] text-[#ff6b00] uppercase tracking-[0.2em] font-semibold mb-3">
            THE MARITIME BALANCING ACT
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold uppercase tracking-tight text-white leading-tight">
            Five conflicting realities on every voyage.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-sans max-w-[75ch]">
            Maritime decarbonization cannot be solved by simply instructing masters to slow steam. In commercial shipping, five physical, operational, and regulatory constraints conflict simultaneously:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {/* Problem Card 1 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-[#ff6b00] font-bold uppercase tracking-wider mb-2">
                01 // NON-LINEAR HYDRODYNAMIC DRAG
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Power Scales with the Cube of Speed (P ∝ V³)
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Gaining just half a knot can increase required main-engine brake power and fuel consumption by over 12%. Viscous friction dominates slow steaming, but wave-making drag surges exponentially once cruising speeds exceed Froude number Fn &gt; 0.20.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              Formula: P_B = (R_T · V) / (η_D · η_M)
            </div>
          </div>

          {/* Problem Card 2 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-[#ff6b00] font-bold uppercase tracking-wider mb-2">
                02 // ADVERSE WEATHER & SEA STATES
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Significant Wave Added Resistance
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Adverse wind, swell, and wave drift add substantial drag. A moderate Beaufort 6 sea state increases effective shaft power demand by 15% to 35% compared to calm water, turning a seemingly economical passage into an involuntary fuel spike.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              Formulation: Kwon (1987) irregular wave loss
            </div>
          </div>

          {/* Problem Card 3 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-[#ff6b00] font-bold uppercase tracking-wider mb-2">
                03 // ALTERNATIVE FUEL COST PREMIUMS
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                1.5× to 2.5× Bunker Price Disparity
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Low-carbon fuels like Bio-LNG and Green E-Methanol reduce lifecycle Well-to-Wake emissions by 25% to 85%, but their bunker costs are significantly higher than standard VLSFO. Operators must evaluate whether carbon penalty savings offset the fuel price premium.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              Fuel range: $620/MT VLSFO to $1,250/MT E-Methanol
            </div>
          </div>

          {/* Problem Card 4 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-[#ff6b00] font-bold uppercase tracking-wider mb-2">
                04 // STRICT CHARTERPARTY LAYCANS
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Arrival Windows & Congestion Costs
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Extreme slow steaming reduces bunker consumption but risks missing commercial charterparty laycan arrival windows. Delays can lead to costly terminal queueing, demurrage charges, or cancelled charter contracts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              Constraint: Hard arrival deadlines & hire rates
            </div>
          </div>

          {/* Problem Card 5 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 flex flex-col justify-between md:col-span-2 lg:col-span-2">
            <div>
              <div className="font-mono text-xs text-[#ff6b00] font-bold uppercase tracking-wider mb-2">
                05 // LAYERED MARITIME REGULATIONS
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Simultaneous IMO CII, EU ETS & FuelEU Maritime Requirements
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Vessels trading internationally face overlapping regulatory compliance hurdles: IMO annual Carbon Intensity Indicator (CII) grades A–E under MEPC.354(78), European Union ETS allowance surrenders (100% phase-in by 2026), and FuelEU Maritime GHG intensity limits penalizing non-compliant bunker energy at €2,400/t VLSFO equivalent.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500 flex flex-wrap gap-4">
              <span>IMO MEPC.354(78)</span>
              <span>EU ETS Directive 2023/959</span>
              <span>FuelEU Regulation (EU) 2023/1805</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW Q-FLEET WORKS (Workflow from Inputs to Deliverables) */}
      <section id="workflow" className="py-20 md:py-28 px-4 sm:px-6 md:px-12 border-b border-white/10 max-w-[1500px] mx-auto scroll-mt-16">
        <div className="max-w-[1000px]">
          <div className="font-mono text-[11px] text-[#ff6b00] uppercase tracking-[0.2em] font-semibold mb-3">
            DECISION SUPPORT WORKFLOW
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold uppercase tracking-tight text-white leading-tight">
            Four steps from voyage inputs to reproducible plans.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-sans max-w-[75ch]">
            Q-FLEET organizes complex multi-objective optimization into an intuitive, auditable workflow designed for voyage dispatchers, charterers, and sustainability leads:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {/* Step 1 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 relative flex flex-col justify-between">
            <div>
              <span className="font-mono text-3xl font-extrabold text-[#ff6b00]/40 block mb-3">01</span>
              <h3 className="font-mono text-sm font-bold uppercase text-white mb-2 tracking-wider">
                Choose Corridor & Fleet
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Select from pre-configured global liner routes (Asia–Europe, Transpacific, Transatlantic) or upload your fleet roster via standard CSV containing deadweight, design speed, and engine ratings.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              Input: Corridor & fleet specs
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 relative flex flex-col justify-between">
            <div>
              <span className="font-mono text-3xl font-extrabold text-[#ff6b00]/40 block mb-3">02</span>
              <h3 className="font-mono text-sm font-bold uppercase text-white mb-2 tracking-wider">
                Define Assumptions
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Specify operational constraints: target cruising speed, maximum transit hours to meet charter laycans, operating draft, seasonal wave height, and carbon allowance pricing (€/tCO₂e).
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              Input: Speed, draft, weather, EUA tax
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 relative flex flex-col justify-between">
            <div>
              <span className="font-mono text-3xl font-extrabold text-[#ff6b00]/40 block mb-3">03</span>
              <h3 className="font-mono text-sm font-bold uppercase text-white mb-2 tracking-wider">
                Generate Pareto Frontier
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                The optimization engine evaluates thousands of feasible vessel speed and fuel combinations under a matched 1,050-evaluation budget to compute the non-dominated Pareto front.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              Process: MO-QIEA, MO-PSO & NSGA-II
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 relative flex flex-col justify-between">
            <div>
              <span className="font-mono text-3xl font-extrabold text-[#ff6b00]/40 block mb-3">04</span>
              <h3 className="font-mono text-sm font-bold uppercase text-white mb-2 tracking-wider">
                Export Auditable Reports
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Review the knee compromise solution, compare alternative trade-offs, and export cryptographic HTML, JSON, or PDF compliance reports stamped with a SHA-256 run hash.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              Deliverable: SHA-256 stamped report
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: INTERACTIVE PHYSICS (Naval Hydrodynamics) */}
      <section id="physics" className="py-20 md:py-28 px-4 sm:px-6 md:px-12 border-b border-white/10 max-w-[1500px] mx-auto scroll-mt-16">
        <div className="mb-10 max-w-[850px]">
          <div className="font-mono text-[11px] text-[#ff6b00] uppercase tracking-[0.2em] font-semibold mb-2">
            FIRST-PRINCIPLES NAVAL ARCHITECTURE
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-tight text-white">
            See why one extra knot changes the voyage.
          </h2>
          <p className="mt-4 text-base text-zinc-400 leading-relaxed font-sans">
            Adjust cruising speed and significant wave height below. Observe how frictional resistance dominates at slow steaming speeds, but wave-making drag surges rapidly once the Froude number exceeds Fn &gt; 0.20, causing power demand and bunker burn to rise non-linearly.
          </p>
        </div>

        {/* Micro-Simulator Component */}
        <HydrodynamicSlider
          speedKnots={speedKnots}
          setSpeedKnots={setSpeedKnots}
          waveHeight={waveHeight}
          setWaveHeight={setWaveHeight}
          onEnterCockpit={onEnterCockpit}
        />

        {/* Technical Blueprint Integration */}
        <div className="mt-8 border border-white/10 bg-[#0e0e12] overflow-hidden">
          <div className="p-3 bg-[#08080a] border-b border-white/10 flex justify-between items-center font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
            <span>NAVAL ARCHITECTURE SCHEMATIC // HULL STREAMLINES & BULBOUS BOW VECTORS</span>
            <span className="text-[#ff6b00]">FORMULATION: HOLTROP-MENNEN (1984) & KWON (1987)</span>
          </div>
          <img
            src="/assets/hydrodynamics_blueprint.jpg"
            alt="Hydrodynamics naval architecture blueprint"
            className="w-full h-[300px] md:h-[380px] object-cover"
          />
        </div>
      </section>

      {/* SECTION 5: PLAN COMPARISON (Multi-Objective Optimization) */}
      <section id="optimization" className="py-20 md:py-28 px-4 sm:px-6 md:px-12 border-b border-white/10 max-w-[1500px] mx-auto scroll-mt-16">
        <div className="mb-10 max-w-[850px]">
          <div className="font-mono text-[11px] text-[#ff6b00] uppercase tracking-[0.2em] font-semibold mb-2">
            OPTIMIZATION METHODOLOGY
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-tight text-white">
            There is rarely one best voyage plan.
          </h2>
          <p className="mt-4 text-base text-zinc-400 leading-relaxed font-sans">
            A voyage plan with the lowest carbon emissions may miss the commercial laycan. The fastest voyage plan may cause excessive bunker fuel burn and an inferior IMO CII grade. Q-FLEET generates the non-dominated Pareto frontier so dispatchers and charterers can choose the plan that best aligns with their commercial mandate.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 font-mono text-xs">
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-zinc-300">
              MO-PSO: Hypervolume Leader (0.2577)
            </span>
            <span className="px-2.5 py-1 bg-[#ff6b00]/10 border border-[#ff6b00]/30 text-[#ff6b00]">
              MO-QIEA: Pareto Spread Leader (Δ = 0.0254 across clean fuels)
            </span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-zinc-300">
              NSGA-II: Classical Genetic Baseline (0.2366)
            </span>
          </div>
        </div>

        {/* Pareto Teaser Component */}
        <QuantumParetoTeaser onEnterCockpit={() => onEnterCockpit()} />

        {/* Quantum Circuit Architecture Graphic */}
        <div className="mt-8 border border-white/10 bg-[#0e0e12] overflow-hidden">
          <div className="p-3 bg-[#08080a] border-b border-white/10 flex justify-between items-center font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
            <span>QUANTUM CIRCUIT ARCHITECTURE // GIVENS ROTATION MATRICES & Q-QUDIT LINES</span>
            <span className="text-[#ff6b00]">BUDGET PARITY: 1,050 EVALS (SEED N=42)</span>
          </div>
          <img
            src="/assets/quantum_lattice.jpg"
            alt="Quantum circuit and Givens rotation schematic"
            className="w-full h-[300px] md:h-[360px] object-cover"
          />
        </div>
      </section>

      {/* SECTION 6: REGULATORY VIEW (Compliance & Carbon Exposure) */}
      <section id="regulations" className="py-20 md:py-28 px-4 sm:px-6 md:px-12 border-b border-white/10 max-w-[1500px] mx-auto scroll-mt-16">
        <div className="mb-10 max-w-[900px]">
          <div className="font-mono text-[11px] text-[#ff6b00] uppercase tracking-[0.2em] font-semibold mb-2">
            REGULATORY INTELLIGENCE
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-tight text-white">
            Indicative compliance and carbon exposure.
          </h2>
          <p className="mt-4 text-base text-zinc-400 leading-relaxed font-sans">
            Evaluate Well-to-Wake (WtW) lifecycle emissions across fossil VLSFO, Bio-LNG, and Green E-Methanol under current European and international statutory frameworks:
          </p>
        </div>

        {/* Prominent Statutory Disclaimer Box */}
        <div className="mb-8 p-4 sm:p-5 border border-amber-500/30 bg-amber-950/20 text-xs font-sans text-amber-200/90 leading-relaxed">
          <div className="font-mono font-bold uppercase text-amber-400 tracking-wider mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            IMPORTANT STATUTORY REGULATORY NOTICE
          </div>
          Q-FLEET is a prototype decision-support tool designed for commercial voyage planning and comparative policy modeling. All calculated IMO Carbon Intensity Indicator (CII) grades, European Union Emissions Trading System (EU ETS) allowance liabilities, and FuelEU Maritime compliance deficit penalties are indicative simulation estimates based on published regulatory formulas. Statutory compliance requires official verification by an accredited verification body and formal submission under statutory annual reporting procedures.
        </div>

        {/* 3 Regulatory Framework Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 font-mono">
          <div className="p-5 bg-[#0e0e12] border border-white/10">
            <span className="text-zinc-500 text-[10px] uppercase block tracking-widest">IMO CII · MEPC.354(78)</span>
            <span className="text-xl font-bold text-white mt-1 block">Grades A through E</span>
            <span className="text-xs text-zinc-400 mt-2 block font-sans">
              Operational carbon intensity based on Annual Efficiency Ratio (AER). Q-FLEET computes indicative single-voyage proxy ratings.
            </span>
          </div>

          <div className="p-5 bg-[#0e0e12] border border-white/10">
            <span className="text-zinc-500 text-[10px] uppercase block tracking-widest">EU ETS · Directive 2023/959</span>
            <span className="text-xl font-bold text-[#ff6b00] mt-1 block">€85.00 / tCO₂e</span>
            <span className="text-xs text-zinc-400 mt-2 block font-sans">
              100% surrender obligation modeled for 2026. Price per tonne is a user-configurable scenario assumption.
            </span>
          </div>

          <div className="p-5 bg-[#0e0e12] border border-white/10">
            <span className="text-zinc-500 text-[10px] uppercase block tracking-widest">FuelEU Maritime · Reg 2023/1805</span>
            <span className="text-xl font-bold text-white mt-1 block">€2,400 Penalty</span>
            <span className="text-xs text-zinc-400 mt-2 block font-sans">
              Financial penalty per metric ton of VLSFO equivalent energy shortfall when exceeding lifecycle GHG intensity limits.
            </span>
          </div>
        </div>

        {/* Fuel Tax Scrubber Component */}
        <FuelTaxScrubber onEnterCockpit={() => onEnterCockpit()} />
      </section>

      {/* SECTION 7: DATA & TRUST (What is Real, Modeled, and Cryptographic) */}
      <section id="evidence" className="py-20 md:py-28 px-4 sm:px-6 md:px-12 border-b border-white/10 max-w-[1500px] mx-auto scroll-mt-16">
        <div className="mb-10 max-w-[900px]">
          <div className="font-mono text-[11px] text-[#ff6b00] uppercase tracking-[0.2em] font-semibold mb-2">
            DATA PROVENANCE & REPRODUCIBILITY
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-tight text-white">
            Grounded in official maritime reporting data.
          </h2>
          <p className="mt-4 text-base text-zinc-400 leading-relaxed font-sans">
            Q-FLEET makes no speculative assertions. Every parameter, baseline, and algorithm comparison traces to official maritime records and reproducible benchmark ledgers:
          </p>
        </div>

        {/* 4 Provenance Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 font-mono">
          <div className="p-5 bg-[#0e0e12] border border-white/10">
            <span className="text-zinc-500 text-[10px] uppercase block tracking-widest">EMSA THETIS-MRV Records</span>
            <span className="text-2xl font-bold text-white mt-1 block tabular-nums">25,691</span>
            <span className="text-xs text-zinc-400 mt-2 block font-sans">
              Official annual emissions reports (13,059 in 2022, 12,632 in 2023) across EU port calls.
            </span>
          </div>

          <div className="p-5 bg-[#0e0e12] border border-white/10">
            <span className="text-zinc-500 text-[10px] uppercase block tracking-widest">Distinct Commercial Ships</span>
            <span className="text-2xl font-bold text-[#ff6b00] mt-1 block tabular-nums">15,924</span>
            <span className="text-xs text-zinc-400 mt-2 block font-sans">
              Verified vessel profiles across Container, Bulker, Tanker, LNG, and General Cargo classes.
            </span>
          </div>

          <div className="p-5 bg-[#0e0e12] border border-white/10">
            <span className="text-zinc-500 text-[10px] uppercase block tracking-widest">UN/LOCODE Locations</span>
            <span className="text-2xl font-bold text-white mt-1 block tabular-nums">11,829</span>
            <span className="text-xs text-zinc-400 mt-2 block font-sans">
              Official United Nations trade and transport locations with coordinates and key hubs.
            </span>
          </div>

          <div className="p-5 bg-[#0e0e12] border border-white/10">
            <span className="text-zinc-500 text-[10px] uppercase block tracking-widest">Temporal Holdout Validation</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block tabular-nums">Zero Leakage</span>
            <span className="text-xs text-zinc-400 mt-2 block font-sans">
              Models fit strictly on 2022 reports and tested on separate 2023 holdout data.
            </span>
          </div>
        </div>

        {/* Cryptographic SHA-256 Explanation Card */}
        <div className="p-5 bg-[#08080a] border border-white/10 mb-8 font-mono text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-white/10">
            <span className="text-[#ff6b00] font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-[#ff6b00]" />
              CRYPTOGRAPHIC SIMULATION INTEGRITY // SHA-256 V2.0
            </span>
            <span className="text-zinc-400 text-[10px]">
              Deterministic cross-channel parity across JSON, HTML, and PDF
            </span>
          </div>
          <div className="mt-3 text-zinc-300 font-sans leading-relaxed text-sm">
            Every completed voyage optimization produces an immutable versioned (v2.0) canonical SHA-256 fingerprint protecting scenario inputs, custom fleet rosters, operational constraints, objective seeds, and allocations. While this does not constitute statutory third-party verification, it provides cryptographic proof that results have not been altered after generation.
          </div>
        </div>

        {/* Embedded Benchmark Table Component */}
        <BenchmarkTable onEnterCockpit={() => onEnterCockpit()} />
      </section>

      {/* SECTION 8: DELIVERABLE OUTPUTS (What the User Receives) */}
      <section id="outputs" className="py-20 md:py-28 px-4 sm:px-6 md:px-12 border-b border-white/10 max-w-[1500px] mx-auto scroll-mt-16">
        <div className="max-w-[1000px]">
          <div className="font-mono text-[11px] text-[#ff6b00] uppercase tracking-[0.2em] font-semibold mb-3">
            DECISION SUPPORT DELIVERABLES
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold uppercase tracking-tight text-white leading-tight">
            Actionable voyage intelligence and audit ledgers.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-sans max-w-[75ch]">
            Every optimization run produces five concrete operational and regulatory deliverables ready for fleet operations, commercial chartering, and ESG compliance:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {/* Output 1 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs text-[#ff6b00] font-bold uppercase tracking-wider block mb-2">
                OUTPUT 01
              </span>
              <h3 className="text-lg font-bold text-white mb-2">
                Ranked Feasible Plans
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Interactive Pareto frontier plot ranking candidate voyage profiles across fuel burn, transit time, and costs, with automated identification of the knee compromise solution.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              Visual Pareto trade-off curve
            </div>
          </div>

          {/* Output 2 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs text-[#ff6b00] font-bold uppercase tracking-wider block mb-2">
                OUTPUT 02
              </span>
              <h3 className="text-lg font-bold text-white mb-2">
                Vessel Allocation Table
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Ship-by-ship speed instructions, alternative fuel pathway assignments, operating draft restrictions, round trips, and operational rationale for each candidate.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              Granular dispatch instructions
            </div>
          </div>

          {/* Output 3 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs text-[#ff6b00] font-bold uppercase tracking-wider block mb-2">
                OUTPUT 03
              </span>
              <h3 className="text-lg font-bold text-white mb-2">
                Financial & Emissions Ledger
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Combined financial accounting covering bunker procurement expense, daily vessel capital hire, and modeled carbon penalty exposures.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              MT fuel · USD cost · tCO₂e lifecycle
            </div>
          </div>

          {/* Output 4 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs text-[#ff6b00] font-bold uppercase tracking-wider block mb-2">
                OUTPUT 04
              </span>
              <h3 className="text-lg font-bold text-white mb-2">
                Regulatory Indicator Badges
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Clear letter ratings for indicative IMO CII status (A through E), FuelEU compliance deficit alerts, and EU ETS allowance liabilities for European port calls.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500">
              IMO CII · EU ETS · FuelEU Maritime
            </div>
          </div>

          {/* Output 5 */}
          <div className="p-6 bg-[#0e0e12] border border-white/10 flex flex-col justify-between md:col-span-2 lg:col-span-2">
            <div>
              <span className="font-mono text-xs text-[#ff6b00] font-bold uppercase tracking-wider block mb-2">
                OUTPUT 05
              </span>
              <h3 className="text-lg font-bold text-white mb-2">
                Cryptographic Multi-Channel Exports
              </h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Download verifiable simulation outputs in three synchronized formats: interactive HTML report for technical debriefs, machine-readable JSON ledger for voyage management integration, and formal PDF documents stamped with the full 64-character canonical SHA-256 run hash.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500 flex flex-wrap gap-4">
              <span>Interactive HTML Dossier</span>
              <span>Machine-Readable JSON API Ledger</span>
              <span>Formal PDF Document Stream</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: FINAL CALL TO ACTION (Compare Before Committing) */}
      <section id="dispatch" className="py-24 md:py-36 px-4 sm:px-6 md:px-12 max-w-[1500px] mx-auto text-center flex flex-col items-center justify-center">
        <div className="max-w-[760px] space-y-6">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff6b00] font-semibold flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff6b00]" />
            START PLANNING
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tight text-white leading-tight">
            Compare your next voyage before committing the fleet.
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-sans max-w-[55ch] mx-auto">
            Launch the dispatch cockpit to explore preloaded Asia–Europe and Transatlantic corridors, test scenario levers, or upload your custom fleet roster.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={(e) => onEnterCockpit(e)}
              className="px-8 py-4 bg-[#ff6b00] hover:bg-[#ff8533] text-black font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg select-none"
            >
              <span className="select-none">OPEN Q-FLEET DASHBOARD</span>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-none select-none">[⌘K]</span>
            </button>

            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-4 border border-white/20 hover:border-white text-zinc-300 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <span>FASTAPI DOCS (SWAGGER)</span>
              <span className="text-zinc-500">↗</span>
            </a>
          </div>

          <div className="font-mono text-[11px] text-zinc-500 pt-4">
            PRESS <kbd className="px-1.5 py-0.5 border border-white/20 text-zinc-300">⌘K</kbd> OR <kbd className="px-1.5 py-0.5 border border-white/20 text-zinc-300">CTRL+K</kbd> AT ANY TIME TO SWITCH BETWEEN LANDING PAGE AND OPERATIONS COCKPIT
          </div>
        </div>
      </section>

      {/* Minimal Swiss Footer */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-6 md:px-12 max-w-[1500px] mx-auto flex flex-col md:flex-row justify-between items-center font-mono text-xs text-zinc-500 gap-4">
        <div>SMART INDIA HACKATHON 2024 · SIH26138 QUANTUM MARITIME FLEET DECARBONIZATION</div>
        <div className="text-center md:text-right">
          REGULATORY SCOPE: IMO MEPC.354(78) · EU ETS Directive (EU) 2023/959 · FuelEU Maritime Regulation (EU) 2023/1805
        </div>
      </footer>
      </div>
    </div>
  );
};
