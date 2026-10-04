import React from 'react';

export interface SliderTick {
  value: number;
  label: string;
  highlight?: boolean;
}

export interface TacticalRangeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: React.ReactNode;
  unit?: string;
  displayValue?: string | number;
  ticks?: SliderTick[];
  theme?: 'dark' | 'light';
  className?: string;
  id?: string;
  disabled?: boolean;
}

/**
 * TacticalRangeSlider
 * 
 * High-precision, Swiss-engineered range slider designed for maritime telemetry.
 * Replaces generic OS circular bubbles with a CNC-machined vernier billet block thumb,
 * luminous optical reticle hairline, dynamic channeled track fill, and graduation ticks.
 */
export const TacticalRangeSlider: React.FC<TacticalRangeSliderProps> = ({
  value,
  onChange,
  min,
  max,
  step = 0.1,
  label,
  unit,
  displayValue,
  ticks,
  theme = 'dark',
  className = '',
  id,
  disabled = false,
}) => {
  // Compute percentage for CSS fill gradient
  const clampedValue = Math.min(Math.max(value, min), max);
  const pct = max > min ? ((clampedValue - min) / (max - min)) * 100 : 0;
  const isDark = theme === 'dark';

  return (
    <div className={`space-y-1.5 select-none ${className}`}>
      {/* Header Readout (Optional) */}
      {(label || displayValue !== undefined) && (
        <div className="flex justify-between items-baseline">
          {label && (
            <label
              htmlFor={id}
              className={`font-mono text-xs uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-stone-600 font-medium'
              }`}
            >
              {label}
            </label>
          )}
          {displayValue !== undefined && (
            <span
              className={`font-mono text-xl font-bold tabular-nums ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              {displayValue}{' '}
              {unit && (
                <span
                  className={`text-xs font-normal ${
                    isDark ? 'text-zinc-500' : 'text-stone-400'
                  }`}
                >
                  {unit}
                </span>
              )}
            </span>
          )}
        </div>
      )}

      {/* Slider Track Container with Calibration Micro-Ticks */}
      <div className="relative py-1 flex items-center">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ '--range-pct': `${pct.toFixed(2)}%` } as React.CSSProperties}
          className={`range-slider-tactical ${
            isDark ? 'range-slider-dark' : 'range-slider-light'
          } w-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      </div>

      {/* Graduation Scale Ticks & Benchmarks */}
      {ticks && ticks.length > 0 && (
        <div className="flex justify-between font-mono text-[10px] pt-0.5">
          {ticks.map((t, idx) => (
            <span
              key={idx}
              className={`transition-colors ${
                t.highlight
                  ? isDark
                    ? 'text-[#ff6b00] font-semibold'
                    : 'text-orange-600 font-semibold'
                  : isDark
                  ? 'text-zinc-500'
                  : 'text-stone-400'
              }`}
            >
              {t.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TacticalRangeSlider;
