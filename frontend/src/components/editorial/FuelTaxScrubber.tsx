import React, { useState } from 'react';

interface Props {
  onEnterCockpit: () => void;
}

export const FuelTaxScrubber: React.FC<Props> = ({ onEnterCockpit }) => {
  const [carbonPrice, setCarbonPrice] = useState<number>(85); // €/tonne
  const [annualVoyages, setAnnualVoyages] = useState<number>(6);

  // Constants per fuel for a 15,000 TEU vessel voyage (~2,240 MT fuel eq)
  const FUELS = [
    {
      name: 'VLSFO (Baseline)',
      category: 'Fossil Residual',
      fuelPricePerMt: 620,
      wtwFactorGco2PerMj: 91.5,
      co2PerMt: 3.151,
      ciiGrade: 'D / E (Non-Compliant)',
      penaltyEur: (2240 * 3.151 * carbonPrice * annualVoyages),
      description: 'Immediate exposure to escalating EU ETS surrender obligations (40% 2024 -> 100% 2026) and FuelEU GHG intensity deficit fines.',
    },
    {
      name: 'Bio-LNG (Biomethane)',
      category: 'Cryogenic Biofuel',
      fuelPricePerMt: 980,
      wtwFactorGco2PerMj: 68.2,
      co2PerMt: 2.38,
      ciiGrade: 'B / C (Compliant to 2030)',
      penaltyEur: (2240 * 1.4 * carbonPrice * annualVoyages),
      description: 'LHV 50.0 MJ/kg with 24% Well-to-Wake carbon reduction. Requires methane slip mitigation in low-pressure dual-fuel Otto engines.',
    },
    {
      name: 'Green E-Methanol',
      category: 'Synthetic Electrofuel',
      fuelPricePerMt: 1250,
      wtwFactorGco2PerMj: 18.4,
      co2PerMt: 0.15,
      ciiGrade: 'A (Exemplary Zero-Tariff)',
      penaltyEur: 0,
      description: 'Produced via biogenic CO2 and renewable green hydrogen. Net-zero EU ETS tariff, full FuelEU Maritime pooling credit generator.',
    },
  ];

  return (
    <div className="border border-white/10 bg-[#0e0e12] p-6 md:p-8">
      {/* Header & Carbon Price Controller */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#ff6b00]">
            ACT 5 // REGULATORY LIFECYCLE & FUEL BENCHMARK
          </span>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Well-to-Wake (WtW) Emissions & Carbon Tax Exposure
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#08080a] border border-white/10 p-3">
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[10px] text-zinc-400">
              <span>EU ETS CARBON TAX RATE:</span>
              <span className="text-[#ff6b00] font-bold">€{carbonPrice} / TONNE</span>
            </div>
            <input
              type="range"
              min={50}
              max={150}
              step={5}
              value={carbonPrice}
              onChange={(e) => setCarbonPrice(parseInt(e.target.value))}
              className="w-44 h-1.5 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-[#ff6b00]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[10px] text-zinc-400">
              <span>ANNUAL VOYAGES:</span>
              <span className="text-white font-bold">{annualVoyages} RUNS</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              step={1}
              value={annualVoyages}
              onChange={(e) => setAnnualVoyages(parseInt(e.target.value))}
              className="w-28 h-1.5 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-[#ff6b00]"
            />
          </div>
        </div>
      </div>

      {/* 3-Tile Asymmetric Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {FUELS.map((f, idx) => {
          const isFossil = idx === 0;
          const isEfuel = idx === 2;

          return (
            <div
              key={f.name}
              className={`border p-6 flex flex-col justify-between ${
                isFossil
                  ? 'border-[#ff6b00]/40 bg-[#120e0e]'
                  : isEfuel
                  ? 'border-white/20 bg-[#0c120f]'
                  : 'border-white/10 bg-[#08080a]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-zinc-500 tracking-wider">
                      {f.category}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-0.5">{f.name}</h4>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold ${
                      isFossil
                        ? 'bg-[#ff6b00]/20 text-[#ff6b00]'
                        : isEfuel
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {f.ciiGrade}
                  </span>
                </div>

                <div className="mt-6 space-y-3 font-mono text-xs border-t border-white/5 pt-4">
                  <div className="flex justify-between text-zinc-400">
                    <span>WtW Lifecycle Factor</span>
                    <span className="text-white font-bold tabular-nums">
                      {f.wtwFactorGco2PerMj} gCO2e/MJ
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Bunker Cost</span>
                    <span className="text-white font-bold tabular-nums">
                      ${f.fuelPricePerMt} / MT
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Annual Carbon Tax Risk</span>
                    <span
                      className={`font-bold tabular-nums ${
                        f.penaltyEur > 0 ? 'text-[#ff6b00]' : 'text-emerald-400'
                      }`}
                    >
                      {f.penaltyEur > 0
                        ? `€${(f.penaltyEur / 1e6).toFixed(2)}M / yr`
                        : '€0.00 (Zero Tariff)'}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-zinc-400 leading-relaxed font-sans">
                  {f.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <button
                  onClick={onEnterCockpit}
                  className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 hover:text-[#ff6b00] transition-colors flex items-center gap-1"
                >
                  <span>MODEL {f.name.split(' ')[0]} DISPATCH</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
