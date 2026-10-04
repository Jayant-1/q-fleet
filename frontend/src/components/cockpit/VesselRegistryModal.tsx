import React, { useState, useEffect } from 'react';
import { X, Search, Upload, CheckCircle2, AlertTriangle, Ship, FileText, Database } from '@/components/icons';
import { fetchMRVVessels, validateCustomVesselCSV } from '../../services/api';
import { MRVVessel, VesselInfo } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportFleet?: (vessels: VesselInfo[]) => void;
}

const SAMPLE_CSV = `name,vessel_type,dwt,design_speed_knots,compatible_fuels
NORDIC_VALOR,Container_UltraLarge,195000,18.5,"VLSFO,MGO,LNG,BIO_METHANOL"
ATLANTIC_PIONEER,Container_PostPanamax,95000,17.2,"VLSFO,MGO,BIO_METHANOL"
PACIFIC_TITAN,Bulk_Capesize,180000,14.5,"VLSFO,MGO,LNG"`;

export const VesselRegistryModal: React.FC<Props> = ({ isOpen, onClose, onImportFleet }) => {
  const [activeTab, setActiveTab] = useState<'mrv' | 'upload'>('mrv');
  const [searchQuery, setSearchQuery] = useState('');
  const [mrvVessels, setMrvVessels] = useState<MRVVessel[]>([]);
  const [loading, setLoading] = useState(false);
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [validationResult, setValidationResult] = useState<{
    is_valid: boolean;
    errors: string[];
    valid_vessels: VesselInfo[];
    parsed_count?: number;
  } | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'mrv') {
      loadVessels();
    }
  }, [isOpen, activeTab]);

  const loadVessels = async (q: string = searchQuery) => {
    setLoading(true);
    try {
      const res = await fetchMRVVessels(q, 1, 40);
      setMrvVessels(res.records || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    loadVessels(q);
  };

  const handleValidateCsv = async () => {
    setValidating(true);
    try {
      const res = await validateCustomVesselCSV(csvText);
      setValidationResult(res);
    } catch (err: any) {
      setValidationResult({
        is_valid: false,
        errors: [err.message || 'Validation failed'],
        valid_vessels: []
      });
    } finally {
      setValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-[#0e0e12] border border-white/10 rounded-sm shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-neutral-200 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#121216]">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-[#ff6b00]" />
            <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-white">
              Vessel Registry & Fleet Integration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-white/10 bg-[#0a0a0d] px-6 text-xs font-mono">
          <button
            onClick={() => setActiveTab('mrv')}
            className={`py-3 px-4 border-b-2 font-medium tracking-wider flex items-center gap-2 transition-colors ${
              activeTab === 'mrv'
                ? 'border-[#ff6b00] text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            EMSA THETIS-MRV REGISTRY (25,691 REPORTS / 15,924 VESSELS)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 border-b-2 font-medium tracking-wider flex items-center gap-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-[#ff6b00] text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            CUSTOM CSV ROSTER INGESTION
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'mrv' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by IMO number or vessel name (e.g. 6602898 or OCEAN)..."
                    className="w-full bg-[#16161b] border border-white/10 pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  {mrvVessels.length} vessels shown
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs font-mono text-neutral-500 animate-pulse">
                  QUERYING EMSA THETIS-MRV DATABASE...
                </div>
              ) : (
                <div className="border border-white/10 overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-mono border-collapse">
                    <thead>
                      <tr className="bg-[#16161b] text-neutral-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">IMO</th>
                        <th className="py-2.5 px-3">Vessel Name</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3 text-right">Gross Ton</th>
                        <th className="py-2.5 px-3 text-right">Sea Hours</th>
                        <th className="py-2.5 px-3 text-right">Distance (nm)</th>
                        <th className="py-2.5 px-3 text-right">Design EEDI</th>
                        <th className="py-2.5 px-3 text-right">Annual Fuel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {mrvVessels.map((v) => (
                        <tr key={v.imo_number} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2 px-3 text-neutral-400">{v.imo_number}</td>
                          <td className="py-2 px-3 text-white font-medium">{v.ship_name}</td>
                          <td className="py-2 px-3 text-neutral-400">{v.ship_type}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{v.gross_tonnage?.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{v.time_at_sea_hours?.toFixed(0) || '—'}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{v.annual_distance_travelled_nm?.toLocaleString() || '—'}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-neutral-300">
                            {v.efficiency_val_gco2_per_tnm ? `${v.efficiency_val_gco2_per_tnm} g` : '—'}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums font-semibold text-[#ff6b00]">
                            {v.total_fuel_consumption_m_tonnes.toLocaleString()} MT
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[#16161b] border border-white/10 text-xs text-neutral-400 leading-relaxed">
                <span className="text-[#ff6b00] font-mono font-bold mr-1">FORMAT REQUIREMENTS:</span>
                Upload or paste CSV text with headers: <code className="text-white">name, vessel_type, dwt, design_speed_knots, compatible_fuels</code>.
                Compatible fuels can include: VLSFO, MGO, LNG, BIO_METHANOL, GREEN_H2, GREEN_NH3.
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                  CSV ROSTER CONTENT
                </label>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  rows={8}
                  className="w-full bg-[#121216] border border-white/10 p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#ff6b00]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleValidateCsv}
                  disabled={validating}
                  className="px-4 py-2 bg-[#ff6b00] hover:bg-[#e05e00] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {validating ? 'VALIDATING SCHEMA...' : 'VALIDATE & INGEST ROSTER'}
                </button>
                <button
                  onClick={() => setCsvText(SAMPLE_CSV)}
                  className="px-3 py-2 border border-white/10 text-neutral-400 hover:text-white font-mono text-xs transition-colors"
                >
                  RESET SAMPLE TEMPLATE
                </button>
              </div>

              {validationResult && (
                <div className={`p-4 border ${validationResult.is_valid ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
                  <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold">
                    {validationResult.is_valid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">VALIDATION SUCCESSFUL ({validationResult.valid_vessels.length} VESSELS READY)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">VALIDATION ERRORS FOUND</span>
                      </>
                    )}
                  </div>

                  {validationResult.errors.length > 0 && (
                    <ul className="list-disc pl-5 text-xs text-red-300 font-mono space-y-1">
                      {validationResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}

                  {validationResult.is_valid && (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-emerald-500/20">
                      <div className="text-xs text-neutral-300 font-mono">
                        Custom vessels successfully verified against naval physics and IMO compatibility constraints.
                      </div>
                      {onImportFleet && (
                        <button
                          onClick={() => {
                            onImportFleet(validationResult.valid_vessels);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shrink-0 ml-4"
                        >
                          APPLY TO ACTIVE FLEET
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#0a0a0d] flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <span>SOURCE: Official EU Regulation 2015/757 (EMSA THETIS-MRV)</span>
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
