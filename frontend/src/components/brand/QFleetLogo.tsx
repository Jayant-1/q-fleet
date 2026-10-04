import React from 'react';

export interface QFleetLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'quantum-bow' | 'qudit-compass' | 'hydro-vector';
  color?: string;
  dotColor?: string;
}

/**
 * Bespoke Q-FLEET Logo Mark
 * 
 * Synthesizes Quantum Superposition (the 'Q' orbital ring) with Maritime Hydrodynamics
 * (the forward vessel bow / wave-cutting vector).
 */
export const QFleetLogo: React.FC<QFleetLogoProps> = ({
  className = 'w-5 h-5',
  size,
  variant = 'quantum-bow',
  color = '#ff6b00',
  dotColor = '#ffffff',
}) => {
  const style = size ? { width: size, height: size } : undefined;

  if (variant === 'qudit-compass') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={style}
        aria-label="Q-FLEET Compass Logo"
      >
        <circle cx="50" cy="50" r="36" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="28" stroke={color} strokeWidth="6" />
        <path d="M 50 50 L 80 80" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <polygon points="50,30 56,50 50,46 44,50" fill={color} />
        <polygon points="50,70 56,50 50,54 44,50" fill="currentColor" fillOpacity="0.4" />
        <circle cx="50" cy="50" r="3" fill={dotColor || 'currentColor'} />
      </svg>
    );
  }

  if (variant === 'hydro-vector') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={style}
        aria-label="Q-FLEET Hydro-Vector Logo"
      >
        <rect x="22" y="22" width="56" height="56" rx="28" stroke={color} strokeWidth="7" />
        <path d="M 32 50 C 40 44 48 56 56 50 C 64 44 72 56 80 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M 64 64 L 88 88" stroke={color} strokeWidth="8" strokeLinecap="round" />
      </svg>
    );
  }

  // Default: Concept A — "The Quantum Bow" (Primary Identity)
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Q-FLEET Logo"
    >
      {/* Quantum Superposition Orbit Arc */}
      <path
        d="M 50 14 A 36 36 0 1 0 80 68"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Forward Cutting Naval Bow Vector / Q Tail */}
      <path
        d="M 48 52 L 86 90"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M 68 90 L 86 90 L 86 72"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Quantum Origin Core Dot */}
      <circle
        cx="50"
        cy="50"
        r="5.5"
        fill={dotColor || 'currentColor'}
      />
    </svg>
  );
};

export interface QFleetBrandLockupProps {
  className?: string;
  iconClassName?: string;
  size?: number | string;
  textColor?: string;
  subtitle?: string;
  fontFamily?: 'jetbrains' | 'space-grotesk' | 'jakarta';
  condensed?: boolean;
}

/**
 * Standard Q-FLEET Brand Lockup (Logo + Wordmark)
 */
export const QFleetBrandLockup: React.FC<QFleetBrandLockupProps> = ({
  className = 'flex items-center gap-2.5 select-none',
  iconClassName = 'w-4 h-4 text-[#ff6b00]',
  textColor = 'text-white',
  subtitle,
  fontFamily = 'jetbrains',
  condensed = false,
}) => {
  const fontStyle = 
    fontFamily === 'space-grotesk'
      ? { fontFamily: "'Space Grotesk', sans-serif" }
      : fontFamily === 'jakarta'
      ? { fontFamily: "'Plus Jakarta Sans', sans-serif" }
      : { fontFamily: "'JetBrains Mono', monospace" };

  return (
    <div className={className}>
      <QFleetLogo className={iconClassName} color="#ff6b00" />
      <div className="flex flex-col">
        <span
          style={fontStyle}
          className={`font-bold tracking-[0.2em] uppercase select-none ${
            condensed ? 'text-xs' : 'text-xs sm:text-sm'
          } ${textColor}`}
        >
          Q-FLEET
        </span>
        {subtitle && (
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-[8px] uppercase tracking-[0.25em] text-[#ff6b00] font-semibold"
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
