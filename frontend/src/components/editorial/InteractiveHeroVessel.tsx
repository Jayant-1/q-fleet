import React, { useState, useRef, useCallback } from 'react';
import { Compass } from 'iconoir-react';

interface Hotspot {
  id: string;
  x: number; // percentage [0..100]
  y: number; // percentage [0..100]
  title: string;
  tag: string;
  metric: string;
  desc: string;
}

const VESSEL_HOTSPOTS: Hotspot[] = [
  {
    id: 'bow',
    x: 34,
    y: 72,
    title: 'BOW WAVE HYDRODYNAMICS',
    tag: 'R_W: 13.5 kN',
    metric: 'Fn = 0.162',
    desc: 'Viscous wave-making surge system modeled via Holtrop-Mennen first principles.',
  },
  {
    id: 'cargo',
    x: 48,
    y: 44,
    title: 'CARGO STOWAGE ALLOCATION',
    tag: '15,000 TEU',
    metric: '185,000 MT',
    desc: 'Full scantling displacement at 15.5m operating draft across tier stacks.',
  },
  {
    id: 'bridge',
    x: 58,
    y: 24,
    title: 'PROPULSION & NAVIGATION',
    tag: 'MCR 68,000 kW',
    metric: '14.6 KTS KNEE',
    desc: 'Brake power loading calibrated for optimal fuel-transit Pareto trade-off.',
  },
];

export const InteractiveHeroVessel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; pctX: number; pctY: number }>({
    x: 250,
    y: 230,
    pctX: 50,
    pctY: 50,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const pctY = Math.max(0, Math.min(100, (y / rect.height) * 100));

    setMousePos({ x, y, pctX, pctY });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveHotspot(null);
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    // If clicking a hotspot directly, don't toggle lock
    e.stopPropagation();
    setIsLocked((prev) => !prev);
  };

  // 3D Parallax Tilt Calculation
  const tiltX = isHovered ? (mousePos.pctY - 50) * -0.06 : 0;
  const tiltY = isHovered ? (mousePos.pctX - 50) * 0.06 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleToggleLock}
      className="group relative border border-white/15 hover:border-white/35 overflow-hidden bg-[#0c0c0e] transition-colors duration-500 cursor-pointer select-none rounded-none shadow-2xl"
      style={{
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* 1. Base Monochrome Image (The iconic HMM vessel scene) */}
      <img
        src="/assets/hero_vessel.jpg"
        alt="15,000 TEU Container ship bow wave in obsidian ocean (monochrome)"
        className="w-full h-[400px] lg:h-[460px] object-cover contrast-125 transition-transform duration-700 ease-out"
      />

      {/* 2. Ambient Subtle Color Layer on Hover (25% opacity when hovered, or 100% when locked) */}
      <img
        src="/assets/hero_vessel_colored.jpg"
        alt="15,000 TEU Container ship ambient color"
        className={`absolute inset-0 w-full h-[400px] lg:h-[460px] object-cover pointer-events-none transition-opacity duration-500 ease-out ${
          isLocked ? 'opacity-100' : isHovered ? 'opacity-25' : 'opacity-0'
        }`}
      />

      {/* 3. Interactive Cursor Spotlight Color Reveal (Expanded 280px Smooth Luminous Lens) */}
      {!isLocked && (
        <div
          className="absolute inset-0 w-full h-[400px] lg:h-[460px] pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            WebkitMaskImage: `radial-gradient(circle 280px at ${mousePos.x}px ${mousePos.y}px, black 45%, transparent 100%)`,
            maskImage: `radial-gradient(circle 280px at ${mousePos.x}px ${mousePos.y}px, black 45%, transparent 100%)`,
          }}
        >
          <img
            src="/assets/hero_vessel_colored.jpg"
            alt="15,000 TEU Container ship spotlight reveal"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 4. Tactical Telemetry Hotspots */}
      {VESSEL_HOTSPOTS.map((h) => {
        const isActive = activeHotspot?.id === h.id;

        return (
          <div
            key={h.id}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            onClick={(e) => {
              e.stopPropagation();
              setActiveHotspot(isActive ? null : h);
            }}
            onMouseEnter={() => setActiveHotspot(h)}
          >
            {/* Hotspot Radar Pulse Ring */}
            <div className="relative cursor-pointer p-2 group/hotspot">
              <svg className="w-6 h-6 overflow-visible" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="6"
                  fill="none"
                  stroke="#ff6b00"
                  strokeWidth="1.5"
                  className="pointer-events-none"
                >
                  <animate attributeName="r" values="6;16" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx="12"
                  cy="12"
                  r={isActive ? 6 : 4}
                  fill={isActive ? '#ffffff' : '#ff6b00'}
                  stroke="#08080a"
                  strokeWidth="1.5"
                  className="transition-all duration-200"
                />
              </svg>

              {/* Collapsed Tag Pill */}
              <div
                className={`absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/85 backdrop-blur-xs border px-1.5 py-0.5 font-mono text-[9px] transition-all duration-200 ${
                  isActive
                    ? 'border-[#ff6b00] text-[#ff6b00] shadow-[0_0_10px_rgba(255,107,0,0.3)]'
                    : 'border-white/20 text-zinc-400 group-hover/hotspot:text-white group-hover/hotspot:border-white/40'
                }`}
              >
                {h.tag}
              </div>
            </div>

            {/* Expanded Telemetry Popup on Hover / Click */}
            {isActive && (
              <div
                className="absolute z-30 left-7 top-7 w-56 p-3 bg-black/95 backdrop-blur-md border border-[#ff6b00]/60 text-left font-mono shadow-2xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
                style={{
                  transform: h.y > 60 ? 'translateY(-110%)' : 'none',
                }}
              >
                <div className="text-[10px] text-[#ff6b00] font-bold tracking-wider uppercase flex items-center justify-between">
                  <span>{h.title}</span>
                  <Compass className="w-3 h-3 text-[#ff6b00]" strokeWidth={2} />
                </div>
                <div className="text-white text-xs font-semibold mt-1">
                  {h.metric}
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 font-sans leading-relaxed">
                  {h.desc}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom Subtle Vessel Title */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 font-mono text-[10px] z-10 pointer-events-none">
        <span className="text-white font-bold block tracking-tight">
          ILLUSTRATIVE VOYAGE SCENARIO // 15,000 TEU CONTAINER VESSEL (Modeled Demo · Not Live AIS)
        </span>
      </div>
    </div>
  );
};
