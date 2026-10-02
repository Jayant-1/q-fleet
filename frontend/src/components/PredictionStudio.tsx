import React, { useState, useEffect } from 'react';
import { predictFuelConsumption } from '../services/api';
import { PredictFuelResponse, FuelType } from '../types';
import { Activity, Gauge, Wind, Waves, Compass, Cpu, Zap, RotateCcw } from 'lucide-react';

export const PredictionStudio: React.FC = () => {
  const [vesselType, setVesselType] = useState<string>('Container_UltraLarge');
  const [speed, setSpeed] = useState<number>(18.5);
  const [cargoLoad, setCargoLoad] = useState<number>(0.85);
  const [draft, setDraft] = useState<number>(14.5);
  const [windSpeed, setWindSpeed] = useState<number>(15.0);
  const [waveHeight, setWaveHeight] = useState<number>(2.0);
  const [current, setCurrent] = useState<number>(0.5);
  const [fuelType, setFuelType] = useState<FuelType>('VLSFO');
  const [useQuantum, setUseQuantum] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictFuelResponse | null>(null);

  // Trigger prediction on input change
  useEffect(() => {
    let isCancelled = false;
    const runPredict = async () => {
      setLoading(true);
      try {
        const dwt = vesselType.includes('UltraLarge')
          ? 195000
          : vesselType.includes('PostPanamax')
          ? 95000
          : vesselType.includes('Feeder')
          ? 18000
          : vesselType.includes('VLCC')
          ? 300000
          : 180000;

        const res = await predictFuelConsumption({
          vessel_type: vesselType,
          dwt,
          speed_knots: speed,
          cargo_load_ratio: cargoLoad,
          draft_meters: draft,
          wind_speed_knots: windSpeed,
          wave_height_meters: waveHeight,
          current_knots: current,
          fuel_type: fuelType,
          use_quantum_feature_selector: useQuantum,
        });
        if (!isCancelled) {
          setPrediction(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    const timer = setTimeout(runPredict, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [vesselType, speed, cargoLoad, draft, windSpeed, waveHeight, current, fuelType, useQuantum]);

  return (
    <div className="bg-oceanic-hull border border-oceanic-border rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-oceanic-border bg-oceanic-panel/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-telemetry-cyan" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
            Quantum-Inspired Fuel Consumption Predictor (QIEA-GBM)
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
            <input
              type="checkbox"
              checked={useQuantum}
              onChange={(e) => setUseQuantum(e.target.checked)}
              className="rounded bg-oceanic-void border-oceanic-border text-telemetry-cyan focus:ring-0"
            />
            <span className="text-slate-300">QIEA Feature Selection</span>
          </label>
          <span className="text-xs font-mono text-telemetry-cyan bg-telemetry-cyan/10 px-2 py-0.5 rounded border border-telemetry-cyan/30">
            {prediction ? `${prediction.inference_latency_ms} ms Latency` : 'Calculating...'}
          </span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders and Operational Inputs */}
        <div className="lg:col-span-6 space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Vessel Classification</label>
              <select
                value={vesselType}
                onChange={(e) => setVesselType(e.target.value)}
                className="w-full bg-oceanic-void border border-oceanic-border rounded p-2 text-slate-200"
              >
                <option value="Container_UltraLarge">UltraLarge Container (21,000 TEU)</option>
                <option value="Container_PostPanamax">PostPanamax Container (8,500 TEU)</option>
                <option value="Container_Feeder">Feeder Container (1,500 TEU)</option>
                <option value="BulkCarrier_Capesize">Capesize Bulk (180,000 DWT)</option>
                <option value="Tanker_VLCC">VLCC Tanker (300,000 DWT)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Fuel Pathway</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full bg-oceanic-void border border-oceanic-border rounded p-2 text-slate-200"
              >
                <option value="VLSFO">VLSFO (Baseline)</option>
                <option value="MGO">MGO (Low Sulfur)</option>
                <option value="LNG">LNG (Dual-Fuel)</option>
                <option value="BIO_METHANOL">Green E-Methanol</option>
                <option value="GREEN_H2">Green Hydrogen</option>
                <option value="GREEN_NH3">Green Ammonia</option>
              </select>
            </div>
          </div>

          {/* Speed Slider */}
          <div className="bg-oceanic-void p-3 rounded border border-oceanic-border space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Speed Over Ground (SOG):</span>
              <span className="text-telemetry-cyan font-bold">{speed.toFixed(1)} knots</span>
            </div>
            <input
              type="range"
              min="10"
              max="24"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-telemetry-cyan"
            />
          </div>

          {/* Cargo Load & Draft */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-oceanic-void p-3 rounded border border-oceanic-border space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Cargo Load:</span>
                <span className="text-telemetry-seafoam font-bold">{(cargoLoad * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                value={cargoLoad}
                onChange={(e) => setCargoLoad(parseFloat(e.target.value))}
                className="w-full accent-telemetry-seafoam"
              />
            </div>
            <div className="bg-oceanic-void p-3 rounded border border-oceanic-border space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Vessel Draft:</span>
                <span className="text-slate-200 font-bold">{draft.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="7.0"
                max="20.0"
                step="0.2"
                value={draft}
                onChange={(e) => setDraft(parseFloat(e.target.value))}
                className="w-full accent-slate-400"
              />
            </div>
          </div>

          {/* Environmental Hydrodynamics Sliders */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-oceanic-void p-2.5 rounded border border-oceanic-border space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Wind:</span>
                <span className="text-telemetry-amber font-bold">{windSpeed.toFixed(0)} kt</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="1"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                className="w-full accent-telemetry-amber"
              />
            </div>
            <div className="bg-oceanic-void p-2.5 rounded border border-oceanic-border space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Waves (Hs):</span>
                <span className="text-telemetry-amber font-bold">{waveHeight.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="0"
                max="8.0"
                step="0.2"
                value={waveHeight}
                onChange={(e) => setWaveHeight(parseFloat(e.target.value))}
                className="w-full accent-telemetry-amber"
              />
            </div>
            <div className="bg-oceanic-void p-2.5 rounded border border-oceanic-border space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Current:</span>
                <span className="text-slate-300 font-bold">{current.toFixed(1)} kt</span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.1"
                value={current}
                onChange={(e) => setCurrent(parseFloat(e.target.value))}
                className="w-full accent-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Prediction Results HUD & Quantum Feature Mask */}
        <div className="lg:col-span-6 space-y-4">
          {prediction && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-oceanic-panel/80 p-4 rounded-lg border border-telemetry-cyan/40 glow-cyan">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Daily Fuel Consumption</span>
                <div className="text-2xl font-black text-telemetry-cyan font-mono mt-1">
                  {prediction.lhv_adjusted_daily_mt} <span className="text-xs">MT / day</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  Baseline VLSFO Equivalent: {prediction.predicted_fuel_mt_per_day} MT/day
                </div>
              </div>

              <div className="bg-oceanic-panel/80 p-4 rounded-lg border border-oceanic-border">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Shaft Power Required</span>
                <div className="text-2xl font-black text-slate-100 font-mono mt-1">
                  {prediction.estimated_shaft_power_kw.toLocaleString()} <span className="text-xs">kW</span>
                </div>
                <div className="text-[10px] font-mono text-telemetry-seafoam mt-1">
                  Engine SFOC: {prediction.specific_fuel_oil_consumption_g_per_kwh} g/kWh
                </div>
              </div>
            </div>
          )}

          {/* Hydrodynamic Power Breakdown */}
          {prediction && (
            <div className="bg-oceanic-panel/60 p-3 rounded-lg border border-oceanic-border font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Calm Water Towing Power:</span>
                <span className="text-slate-100">{prediction.calm_water_power_kw.toLocaleString()} kW</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Added Weather Resistance (Wind & Waves):</span>
                <span className="text-telemetry-amber">+{prediction.added_weather_resistance_kw.toLocaleString()} kW</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                <div
                  style={{
                    width: `${
                      (prediction.calm_water_power_kw /
                        (prediction.calm_water_power_kw + prediction.added_weather_resistance_kw)) *
                      100
                    }%`,
                  }}
                  className="bg-telemetry-cyan h-full"
                />
                <div
                  style={{
                    width: `${
                      (prediction.added_weather_resistance_kw /
                        (prediction.calm_water_power_kw + prediction.added_weather_resistance_kw)) *
                      100
                    }%`,
                  }}
                  className="bg-telemetry-amber h-full"
                />
              </div>
            </div>
          )}

          {/* Quantum-Inspired Q-Bit Feature Selection Register Visualizer */}
          {prediction && (
            <div className="bg-oceanic-panel/60 p-3 rounded-lg border border-telemetry-violet/30 font-mono space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-telemetry-violet font-bold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Q-Bit Superposition Feature Register Mask
                </span>
                <span className="text-[10px] text-slate-400">
                  {prediction.feature_names_used.length} / 12 Features Active
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {prediction.feature_importance_mask.map((isActive, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-[10px] border ${
                      isActive === 1
                        ? 'bg-telemetry-violet/20 text-telemetry-violet border-telemetry-violet/50 font-bold'
                        : 'bg-oceanic-void text-slate-500 border-oceanic-border opacity-50'
                    }`}
                  >
                    |ψ_{idx}⟩ {isActive === 1 ? '• 1' : '• 0'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
