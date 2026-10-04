import React, { useState } from 'react';
import { Compass } from 'iconoir-react';
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
  onEnterCockpit: () => void;
}

export const EditorialShowcase: React.FC<Props> = ({
  speedKnots,
  setSpeedKnots,
  waveHeight,
  setWaveHeight,
  onEnterCockpit,
}) => {
  const [tickerTime] = useState('14:28:09 UTC');

  return (
    <div className="relative min-h-screen bg-[#131315] text-[#fafafa] font-sans selection:bg-[#ff6b00] selection:text-black">
      {/* High-End GPU Procedural Matte Noise Shader Background */}
      <MatteNoiseShaderBackground intensity={1.0} />

      <div className="relative z-10">

      {/* Top Fixed Swiss Navigation Bar (Height: 64px) */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-[#131315]/90 backdrop-blur-md border-b border-white/10 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#ff6b00]" strokeWidth={2} />
            Q-FLEET // NAVAL COMMAND
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] text-zinc-500 uppercase tracking-widest border-l border-white/10 pl-4">
            IMO MEPC.328(76) MODELED
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 font-mono text-xs text-zinc-400">
            <span>CHRONOMETER: <span className="text-zinc-200">{tickerTime}</span></span>
            <span>CORRIDOR: <span className="text-zinc-200">SHANGHAI → ROTTERDAM</span></span>
          </div>

          <button
            onClick={onEnterCockpit}
            className="font-mono text-xs px-4 py-2 bg-[#ff6b00] hover:bg-[#ff8533] text-black font-bold uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <span>OPEN DASHBOARD</span>
            <span className="hidden md:inline text-[10px] bg-black/20 px-1 py-0.5 rounded-none">[⌘K]</span>
          </button>
        </div>
      </header>

      {/* ACT 1: THE MONOLITHIC HERO (Split 60/40, Exactly Viewport-Contained) */}
      <section className="relative min-h-[100dvh] pt-20 px-6 md:px-12 flex flex-col justify-center border-b border-white/10 max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-8">
          {/* Left Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow (1 of allowed max) */}
            <div className="font-mono text-[11px] text-[#ff6b00] uppercase tracking-[0.2em] font-semibold">
              IMO MEPC.328(76) // EU ETS DIRECTIVE 2023/959
            </div>

            {/* Display Headline (Max 2 lines on desktop, descender clearance) */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold uppercase tracking-tight text-white leading-[0.98] pb-1">
              Decarbonizing Global Fleets via Quantum Search
            </h1>

            {/* Subtext (Strictly <= 20 words, max 3 lines) */}
            <p className="text-base sm:text-lg text-zinc-400 font-sans leading-relaxed max-w-[55ch]">
              Naval hydrodynamics meets multi-objective quantum-inspired algorithms to minimize fuel burn, carbon penalties, and transit delay.
            </p>

            {/* CTAs (Single-line desktop labels) */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onEnterCockpit}
                className="px-6 py-3.5 bg-[#ff6b00] hover:bg-[#ff8533] text-black font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2"
              >
                <span>OPEN DASHBOARD →</span>
              </button>

              <a
                href="#benchmark-section"
                className="px-6 py-3.5 border border-white/20 hover:border-white text-white font-mono text-xs uppercase tracking-wider transition-colors"
              >
                AUDIT BENCHMARK DATA
              </a>
            </div>

            {/* Sub-hero Live Coordinate Telemetry Strip */}
            <div className="pt-6 border-t border-white/5 flex flex-wrap gap-6 font-mono text-[11px] text-zinc-500">
              <div>POSITION: <span className="text-zinc-300">24°32.1'N 054°28.4'E</span></div>
              <div>SWELL: <span className="text-zinc-300">2.1M (NW 310°)</span></div>
              <div>COMPUTE: <span className="text-[#ff6b00]">MO-QIEA (40 GEN)</span></div>
            </div>
          </div>

          {/* Right Column (5 Cols) — Bespoke Vessel Bow Wave Interactive Inspector */}
          <div className="lg:col-span-5 relative">
            <InteractiveHeroVessel />
          </div>
        </div>
      </section>

      {/* ACT 2: THE REGULATORY IMPASSE (Full-Width Asymmetric Typographic Manifesto) */}
      <section className="py-20 md:py-28 px-6 md:px-12 border-b border-white/10 max-w-[1500px] mx-auto">
        <div className="max-w-[1000px]">
          <h2 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tight text-white leading-tight">
            The Maritime Carbon Squeeze: €1,420,000 Annual Carbon Liability
          </h2>
          <p className="mt-6 text-lg md:text-xl text-zinc-400 leading-relaxed font-sans max-w-[70ch]">
            Under IMO MEPC.328(76), commercial vessels face annual Carbon Intensity Indicator (CII) rating degradation into non-compliant grades D and E. Concurrently, EU ETS maritime phase-in requires 100% surrender of emission allowances by 2026. Without hydrodynamically calibrated route speeds, unoptimized Capesize bulkers and ultra-large container ships forfeit commercial charters and incur millions in regulatory tariffs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/10 font-mono">
          <div className="p-6 bg-[#0e0e12] border border-white/10">
            <span className="text-zinc-500 text-[10px] uppercase block tracking-widest">IMO CII Trajectory</span>
            <span className="text-3xl font-bold text-white mt-1 block tabular-nums">-28.0%</span>
            <span className="text-xs text-zinc-400 mt-2 block font-sans">
              Required GHG intensity reduction per transport work by 2030 vs 2019 baseline.
            </span>
          </div>

          <div className="p-6 bg-[#0e0e12] border border-white/10">
            <span className="text-zinc-500 text-[10px] uppercase block tracking-widest">EU ETS Carbon Tax</span>
            <span className="text-3xl font-bold text-[#ff6b00] mt-1 block tabular-nums">€85.00</span>
            <span className="text-xs text-zinc-400 mt-2 block font-sans">
              Market allowance per tonne of verified CO2 emitted across European port calls.
            </span>
          </div>

          <div className="p-6 bg-[#0e0e12] border border-white/10">
            <span className="text-zinc-500 text-[10px] uppercase block tracking-widest">FuelEU Maritime Penalty</span>
            <span className="text-3xl font-bold text-white mt-1 block tabular-nums">€2,400</span>
            <span className="text-xs text-zinc-400 mt-2 block font-sans">
              Per tonne VLSFO equivalent energy penalty for missing lifecycle GHG intensity limits.
            </span>
          </div>
        </div>
      </section>

      {/* ACT 3: MICRO-SIMULATOR 1 — THE HYDRODYNAMIC TRUTH */}
      <section className="py-20 md:py-28 px-6 md:px-12 border-b border-white/10 max-w-[1500px] mx-auto">
        <div className="mb-10 max-w-[850px]">
          <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight text-white">
            The Hydrodynamic Truth: Holtrop-Mennen & Kwon Drag Surge
          </h2>
          <p className="mt-4 text-base text-zinc-400 leading-relaxed font-sans">
            Adjust the cruising speed and wave height below. Observe how viscous friction dominates at slow steaming, but wave-making resistance increases exponentially past Froude number Fn &gt; 0.20, causing power demand to surge non-linearly.
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

        {/* Declassified Technical Blueprint Integration */}
        <div className="mt-8 border border-white/10 bg-[#0e0e12] overflow-hidden">
          <div className="p-3 bg-[#08080a] border-b border-white/10 flex justify-between items-center font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
            <span>DECLASSIFIED SCHEMATIC // HULL STREAMLINES & BULBOUS BOW VECTORS</span>
            <span className="text-[#ff6b00]">PLATE: CS-900 NAVAL BUREAU</span>
          </div>
          <img
            src="/assets/hydrodynamics_blueprint.jpg"
            alt="Hydrodynamics naval architecture blueprint"
            className="w-full h-[320px] md:h-[400px] object-cover"
          />
        </div>
      </section>

      {/* ACT 4: MICRO-SIMULATOR 2 — QUANTUM MULTI-OBJECTIVE OPTIMIZATION */}
      <section className="py-20 md:py-28 px-6 md:px-12 border-b border-white/10 max-w-[1500px] mx-auto">
        <div className="mb-10 max-w-[850px]">
          <div className="font-mono text-[11px] text-[#ff6b00] uppercase tracking-[0.2em] font-semibold mb-2">
            QUANTUM COMPUTING ADVANTAGE
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight text-white">
            Multi-State Q-Qudit Superposition vs Genetic Drift
          </h2>
          <p className="mt-4 text-base text-zinc-400 leading-relaxed font-sans">
            Classical genetic algorithms (NSGA-II) suffer from premature convergence and chromosome stagnation on 13,000-nautical-mile voyage profiles. MO-QIEA leverages Givens rotation gates and catastrophe mutation to maintain exploratory diversity, achieving 16.1% higher Pareto hypervolume with 80% fewer objective evaluations.
          </p>
        </div>

        {/* Micro-Simulator 2 Component */}
        <QuantumParetoTeaser onEnterCockpit={onEnterCockpit} />

        {/* Quantum Circuit Architecture Graphic */}
        <div className="mt-8 border border-white/10 bg-[#0e0e12] overflow-hidden">
          <div className="p-3 bg-[#08080a] border-b border-white/10 flex justify-between items-center font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
            <span>QUANTUM CIRCUIT ARCHITECTURE // GIVENS ROTATION MATRICES & Q-QUDIT LINES</span>
            <span className="text-[#ff6b00]">COHERENCE: 40 GENERATIONS</span>
          </div>
          <img
            src="/assets/quantum_lattice.jpg"
            alt="Quantum circuit and Givens rotation schematic"
            className="w-full h-[320px] md:h-[380px] object-cover"
          />
        </div>
      </section>

      {/* ACT 5: MICRO-SIMULATOR 3 — ALTERNATIVE FUEL PATHWAYS & CARBON TAX */}
      <section className="py-20 md:py-28 px-6 md:px-12 border-b border-white/10 max-w-[1500px] mx-auto">
        <div className="mb-10 max-w-[850px]">
          <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight text-white">
            Alternative Fuel Pathways & Well-to-Wake Lifecycle Economics
          </h2>
          <p className="mt-4 text-base text-zinc-400 leading-relaxed font-sans">
            Fossil VLSFO faces escalating carbon penalties that rapidly erode its initial price advantage. Compare lifecycle Well-to-Wake factors across Bio-LNG and Green E-Methanol to identify fleet break-even inflection points.
          </p>
        </div>

        {/* Micro-Simulator 3 Component */}
        <FuelTaxScrubber onEnterCockpit={onEnterCockpit} />
      </section>

      {/* ACT 6: DECLASSIFIED BENCHMARK MATRIX */}
      <section id="benchmark-section" className="py-20 md:py-28 px-6 md:px-12 border-b border-white/10 max-w-[1500px] mx-auto">
        <BenchmarkTable onEnterCockpit={onEnterCockpit} />
      </section>

      {/* ACT 7: TERMINAL LAUNCHPAD (Direct Dispatch Mission Control Entry) */}
      <section className="py-24 md:py-36 px-6 md:px-12 max-w-[1500px] mx-auto text-center flex flex-col items-center justify-center">
        <div className="max-w-[700px] space-y-6">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff6b00] font-semibold">
            ACT 7 // COMMAND DISPATCH READY
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tight text-white">
            Activate Fleet Dashboard
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed font-sans max-w-[50ch] mx-auto">
            Switch from the editorial dossier directly into the clean, light-mode fleet workstation to run live route optimization, inspect naval physics, and export official audit reports.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterCockpit}
              className="px-8 py-4 bg-[#ff6b00] hover:bg-[#ff8533] text-black font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2"
            >
              <span>OPEN FLEET DASHBOARD</span>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-none">[⌘K]</span>
            </button>
          </div>

          <div className="font-mono text-[11px] text-zinc-500 pt-4">
            PRESS <kbd className="px-1.5 py-0.5 border border-white/20 text-zinc-300">⌘K</kbd> OR <kbd className="px-1.5 py-0.5 border border-white/20 text-zinc-300">CTRL+K</kbd> AT ANY TIME TO OPEN DASHBOARD
          </div>
        </div>
      </section>

      {/* Minimal Swiss Footer */}
      <footer className="border-t border-white/10 py-8 px-6 md:px-12 max-w-[1500px] mx-auto flex flex-col sm:flex-row justify-between items-center font-mono text-xs text-zinc-500 gap-4">
        <div>SMART INDIA HACKATHON 2024 · SIH26138 QUANTUM MARITIME FLEET DECARBONIZATION</div>
        <div>REGULATORY SCOPE: IMO MEPC.328(76) · FuelEU Maritime · EU ETS Directive 2023/959</div>
      </footer>
      </div>
    </div>
  );
};
