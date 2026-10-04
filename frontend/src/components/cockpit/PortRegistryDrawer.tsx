import React, { useState, useEffect } from 'react';
import { X, Anchor, ShieldCheck, ExternalLink, Globe, Cpu } from '@/components/icons';
import { fetchDataProvenanceManifest } from '../../services/api';
import { CorridorInfo, DataProvenanceManifest } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  corridors?: CorridorInfo[];
}

export const PortRegistryDrawer: React.FC<Props> = ({ isOpen, onClose, corridors = [] }) => {
  const [manifest, setManifest] = useState<DataProvenanceManifest | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchDataProvenanceManifest()
        .then(setManifest)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Extract unique ports from corridors
  const portMap = new Map();
  corridors.forEach((c: CorridorInfo) => {
    if (c.origin_port) portMap.set(c.origin_port.port_id, c.origin_port);
    if (c.destination_port) portMap.set(c.destination_port.port_id, c.destination_port);
  });
  const portList = Array.from(portMap.values());

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[#0e0e12] border-l border-white/10 h-full flex flex-col shadow-2xl text-neutral-200 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#121216]">
          <div className="flex items-center gap-3">
            <Anchor className="w-4 h-4 text-[#ff6b00]" />
            <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-white">
              Global Ports Network & Data Provenance
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
          
          {/* Section 1: Standardized Port Terminals */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <span className="text-white font-bold tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#ff6b00]" />
                UN/LOCODE GLOBAL MARITIME TERMINALS
              </span>
              <span className="text-neutral-500">{portList.length} PORTS ACTIVE</span>
            </div>

            <div className="space-y-2">
              {portList.map((p) => (
                <div
                  key={p.port_id}
                  className="p-3 bg-[#141418] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-white/10 text-white font-bold text-[10px] rounded-xs">
                        {p.port_id}
                      </span>
                      <span className="text-white font-semibold">{p.name}</span>
                      <span className="text-neutral-500">({p.country})</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-1">
                      Coordinates: {p.lat.toFixed(2)}°N, {p.lon.toFixed(2)}°E | Grid Carbon: {p.grid_ci} gCO₂/kWh
                    </div>
                  </div>

                  <div className="text-right">
                    {p.has_cold_ironing ? (
                      <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                        COLD IRONING ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-neutral-800 border border-white/10 text-neutral-400 text-[10px]">
                        AUX DIESEL ONLY
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Data Provenance Ledger */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <span className="text-white font-bold tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                OFFICIAL DATA PROVENANCE & LICENSES
              </span>
              <span className="text-neutral-500">SIH26138 AUDIT LEDGER</span>
            </div>

            {loading ? (
              <div className="py-6 text-center text-neutral-500 animate-pulse">
                LOADING MANIFEST LEDGER...
              </div>
            ) : manifest ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#16161c] border border-white/10 text-[11px] text-neutral-300">
                  <div className="text-neutral-400 mb-1">Pipeline: <span className="text-white font-bold">{manifest.pipeline_name}</span></div>
                  <div className="text-neutral-400">Timestamp: <span className="text-white">{manifest.generated_at_utc}</span></div>
                  <div className="text-neutral-400 mt-1">
                    Offline Status: <span className="text-emerald-400 font-bold">✓ 100% REPRODUCIBLE (COMMITTED FIXTURES)</span>
                  </div>
                </div>

                {manifest.datasets.map((d) => (
                  <div key={d.id} className="p-3 bg-[#121216] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#ff6b00] font-bold text-xs">{d.title}</span>
                      <span className="text-[10px] text-neutral-500">{d.observation_grain}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400">Publisher: {d.publisher}</div>
                    <div className="text-[10px] text-neutral-400">License: <span className="text-neutral-200">{d.license}</span></div>
                    {d.file_sha256 && (
                      <div className="text-[9px] text-neutral-500 font-mono truncate">
                        SHA256: <code className="text-neutral-400">{d.file_sha256}</code>
                      </div>
                    )}
                    {d.cleaning_rules && (
                      <div className="text-[10px] text-neutral-400 pt-1 border-t border-white/5 mt-1">
                        Cleaning: {d.cleaning_rules}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-neutral-500">Manifest not available</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#0a0a0d] flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <span>Standards: IMO Resolution MEPC.376(80) / Regulation (EU) 2023/1805</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
