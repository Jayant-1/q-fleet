import React, { useState, useEffect } from 'react';
import { Compass } from 'iconoir-react';
import { QFleetLogo } from '../brand/QFleetLogo';
import { CorridorInfo } from '../../types';

interface Props {
  corridors: CorridorInfo[];
  activeCorridorId: string;
  setActiveCorridorId: (id: string) => void;
  solverLatencyMs: number;
  isSolving: boolean;
  onToggleEditorial: () => void;
  onExportPdf: () => void;
  onOpenVessels?: () => void;
  onOpenPorts?: () => void;
  onOpenSensitivity?: () => void;
}

export const CockpitHeader: React.FC<Props> = ({
  corridors,
  activeCorridorId,
  setActiveCorridorId,
  solverLatencyMs,
  isSolving,
  onToggleEditorial,
  onExportPdf,
  onOpenVessels,
  onOpenPorts,
  onOpenSensitivity,
}) => {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().split(' ')[4] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-[#0a0a0d] border-b border-white/10 px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand + Editorial Back Link */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleEditorial}
          className="font-mono text-xs px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
          title="Return to Editorial Dossier (⌘K)"
        >
          <span>← EDITORIAL</span>
          <span className="text-[10px] text-zinc-500 font-mono">[⌘K]</span>
        </button>

        <div className="flex items-center gap-2.5 border-l border-white/10 pl-4 select-none">
          <QFleetLogo className="w-5 h-5 shrink-0" color="#ff6b00" dotColor="#ffffff" />
          <span className="font-mono text-xs font-bold tracking-widest text-white uppercase select-none">
            Q-FLEET // NAVAL COCKPIT
          </span>
        </div>

        {/* Route Selector Dropdown */}
        <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-4">
          <label className="font-mono text-[10px] uppercase text-zinc-500">CORRIDOR:</label>
          <select
            value={activeCorridorId}
            onChange={(e) => setActiveCorridorId(e.target.value)}
            className="bg-[#121216] border border-white/15 text-white font-mono text-xs px-2.5 py-1 focus:outline-none focus:border-[#ff6b00]"
          >
            {corridors.map((c) => (
              <option key={c.route_id} value={c.route_id}>
                {c.name} ({c.distance_nm} NM)
              </option>
            ))}
          </select>
        </div>

        {/* Modal Triggers */}
        <div className="hidden lg:flex items-center gap-1.5 border-l border-white/10 pl-3">
          {onOpenVessels && (
            <button
              onClick={onOpenVessels}
              className="font-mono text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors"
              title="Search MRV Vessels and Ingest Custom CSV"
            >
              VESSELS & CSV
            </button>
          )}
          {onOpenPorts && (
            <button
              onClick={onOpenPorts}
              className="font-mono text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors"
              title="View Ports Network and Data Provenance Manifest"
            >
              PORTS & PROVENANCE
            </button>
          )}
          {onOpenSensitivity && (
            <button
              onClick={onOpenSensitivity}
              className="font-mono text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors"
              title="Policy Sandbox & Sensitivity Explorer"
            >
              WHY THIS PLAN?
            </button>
          )}
        </div>
      </div>

      {/* Center: Live Solver Status */}
      <div className="hidden xl:flex items-center gap-4 font-mono text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">SOLVER:</span>
          <span className="text-white font-semibold">MO-QIEA</span>
          <span className="text-[10px] text-zinc-500">(GIVENS GATES)</span>
        </div>
        <span className="text-zinc-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">LATENCY:</span>
          <span className="text-[#ff6b00] font-bold tabular-nums">
            {isSolving ? 'COMPUTING...' : `${solverLatencyMs}ms`}
          </span>
        </div>
        <span className="text-zinc-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">REGULATION:</span>
          <span className="text-zinc-300">IMO MEPC.328(76) MODELED</span>
        </div>
      </div>

      {/* Right: Chronometer + Export PDF Button */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block font-mono text-xs text-zinc-400 tabular-nums">
          {utcTime}
        </div>

        <button
          onClick={onExportPdf}
          className="font-mono text-xs px-3.5 py-1.5 bg-[#ff6b00] hover:bg-[#ff8533] text-black font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
          title="Export Official Naval Dispatch PDF (⌘E)"
        >
          <span>EXPORT DISPATCH PDF</span>
          <span className="hidden sm:inline text-[10px] bg-black/20 px-1 py-0.5 rounded-none">[⌘E]</span>
        </button>
      </div>
    </header>
  );
};
