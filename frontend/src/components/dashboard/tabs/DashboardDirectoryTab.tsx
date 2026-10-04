import React, { useState, useEffect } from 'react';
import { VesselInfo, MRVVessel, CorridorInfo, UNLOCODEPort, ValidateCSVResponse } from '../../../types';
import { fetchMRVVessels, validateCustomVesselCSV, fetchUNLOCODEPorts } from '../../../services/api';
import {
  Search,
  Upload,
  Anchor,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Database,
  Globe,
  Info,
  ShieldCheck,
  Zap,
} from '@/components/icons';

interface Props {
  fleet: VesselInfo[];
  setFleet: (f: VesselInfo[]) => void;
  corridors: CorridorInfo[];
}

const SAMPLE_CSV = `name,vessel_type,dwt,design_speed_knots,compatible_fuels
NORDIC_VALOR,Container_UltraLarge,195000,18.5,"VLSFO,MGO,LNG,BIO_METHANOL"
ATLANTIC_PIONEER,Container_PostPanamax,95000,17.2,"VLSFO,MGO,BIO_METHANOL"
PACIFIC_TITAN,Bulk_Capesize,180000,14.5,"VLSFO,MGO,LNG"
GLOBAL_SENTINEL,Tanker_VLCC,300000,15.2,"VLSFO,MGO,LNG"`;

export const DashboardDirectoryTab: React.FC<Props> = ({
  fleet,
  setFleet,
  corridors,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'mrv' | 'upload' | 'ports'>('mrv');

  // --- EMSA MRV State ---
  const [mrvQuery, setMrvQuery] = useState('');
  const [mrvPage, setMrvPage] = useState(1);
  const [mrvPageSize] = useState(25);
  const [mrvVessels, setMrvVessels] = useState<MRVVessel[]>([]);
  const [mrvTotalCount, setMrvTotalCount] = useState(0);
  const [mrvTotalPages, setMrvTotalPages] = useState(0);
  const [mrvSourceLabel, setMrvSourceLabel] = useState('Official EMSA THETIS-MRV Registry');
  const [mrvLoading, setMrvLoading] = useState(false);

  // --- Custom CSV Ingestion State ---
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidateCSVResponse | null>(null);

  // --- UN/LOCODE Directory State ---
  const [unlocodeQuery, setUnlocodeQuery] = useState('');
  const [unlocodeCountry, setUnlocodeCountry] = useState('');
  const [unlocodePage, setUnlocodePage] = useState(1);
  const [unlocodePageSize] = useState(25);
  const [unlocodePorts, setUnlocodePorts] = useState<UNLOCODEPort[]>([]);
  const [unlocodeTotalCount, setUnlocodeTotalCount] = useState(0);
  const [unlocodeTotalPages, setUnlocodeTotalPages] = useState(0);
  const [unlocodeLoading, setUnlocodeLoading] = useState(false);
  const [unlocodeDisclaimer, setUnlocodeDisclaimer] = useState('');

  // Load MRV data on tab switch or page change
  useEffect(() => {
    if (activeSubTab === 'mrv') {
      loadMRVData();
    }
  }, [activeSubTab, mrvPage]);

  // Load UN/LOCODE data on tab switch or page change
  useEffect(() => {
    if (activeSubTab === 'ports') {
      loadUNLOCODEData();
    }
  }, [activeSubTab, unlocodePage]);

  const loadMRVData = async (query = mrvQuery, page = mrvPage) => {
    setMrvLoading(true);
    try {
      const res = await fetchMRVVessels(query, page, mrvPageSize);
      setMrvVessels(res.records || []);
      setMrvTotalCount(res.total_count || 0);
      setMrvTotalPages(res.total_pages || 0);
      if (res.dataset_source) setMrvSourceLabel(res.dataset_source);
    } catch (e) {
      console.error('Failed to load MRV data:', e);
    } finally {
      setMrvLoading(false);
    }
  };

  const handleMrvSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMrvPage(1);
    loadMRVData(mrvQuery, 1);
  };

  const loadUNLOCODEData = async (query = unlocodeQuery, country = unlocodeCountry, page = unlocodePage) => {
    setUnlocodeLoading(true);
    try {
      const res = await fetchUNLOCODEPorts(query, country, page, unlocodePageSize);
      setUnlocodePorts(res.records || []);
      setUnlocodeTotalCount(res.total_count || 0);
      setUnlocodeTotalPages(res.total_pages || 0);
      if (res.disclaimer) setUnlocodeDisclaimer(res.disclaimer);
    } catch (e) {
      console.error('Failed to load UN/LOCODE ports:', e);
    } finally {
      setUnlocodeLoading(false);
    }
  };

  const handleUnlocodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocodePage(1);
    loadUNLOCODEData(unlocodeQuery, unlocodeCountry, 1);
  };

  const handleValidateCsv = async () => {
    setValidating(true);
    try {
      const res = await validateCustomVesselCSV(csvText);
      setValidationResult(res);
    } catch (err: any) {
      setValidationResult({
        is_valid: false,
        errors: [err.message || 'Validation request failed'],
        valid_vessels: [],
      });
    } finally {
      setValidating(false);
    }
  };

  // Extract unique curated ports from corridors
  const portMap = new Map();
  corridors.forEach((c) => {
    if (c.origin_port) portMap.set(c.origin_port.port_id, c.origin_port);
    if (c.destination_port) portMap.set(c.destination_port.port_id, c.destination_port);
  });
  const curatedPortList = Array.from(portMap.values());

  return (
    <div className="space-y-8">
      {/* Breathable Page Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h2 className="text-lg font-semibold text-stone-900 tracking-tight">
            Fleet & Port Directory
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Official EMSA THETIS-MRV commercial vessels, custom fleet roster ingestion, and UN/LOCODE port terminals.
          </p>
        </div>

        {/* Clean, airy segmented switcher */}
        <div className="inline-flex items-center gap-1 bg-stone-100/90 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('mrv')}
            data-testid="subtab-mrv"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeSubTab === 'mrv'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            EMSA MRV Registry
          </button>
          <button
            onClick={() => setActiveSubTab('upload')}
            data-testid="subtab-upload"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeSubTab === 'upload'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Custom CSV Ingestion
          </button>
          <button
            onClick={() => setActiveSubTab('ports')}
            data-testid="subtab-ports"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeSubTab === 'ports'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            UN/LOCODE Ports
          </button>
        </div>
      </div>

      {/* 1. Official EMSA THETIS-MRV Search View */}
      {activeSubTab === 'mrv' && (
        <div className="bg-white rounded-lg border border-stone-200/90 shadow-2xs p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                  official-source dataset
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-100 text-stone-600 border border-stone-200/80">
                  {mrvSourceLabel}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-stone-900 mt-1">
                EMSA THETIS-MRV Commercial Fleet ({mrvTotalCount.toLocaleString()} Records)
              </h3>
            </div>

            <form onSubmit={handleMrvSearch} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search ship name, IMO, type..."
                  value={mrvQuery}
                  onChange={(e) => setMrvQuery(e.target.value)}
                  data-testid="mrv-search-input"
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 rounded-md text-xs font-mono text-stone-900 transition-colors"
                />
              </div>
              <button
                type="submit"
                data-testid="mrv-search-btn"
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap shadow-2xs"
              >
                Search
              </button>
            </form>
          </div>

          <div className="border border-stone-200/90 rounded-lg overflow-x-auto w-full max-w-full min-w-0">
            {mrvLoading ? (
              <div className="py-12 text-center text-xs font-mono text-stone-400">
                Loading official EMSA THETIS-MRV records...
              </div>
            ) : mrvVessels.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-stone-400">
                No vessels matching query "{mrvQuery}".
              </div>
            ) : (
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50/80 border-b border-stone-200/90 text-stone-500 uppercase text-[10px] font-mono tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">IMO</th>
                    <th className="py-2.5 px-3">Ship Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-center">Period</th>
                    <th className="py-2.5 px-3 text-right">EEDI/EIV (g/tNM)</th>
                    <th className="py-2.5 px-3 text-right">Sea Hours</th>
                    <th className="py-2.5 px-3 text-center">Ice Class</th>
                    <th className="py-2.5 px-3 text-right">Annual CO₂ (MT)</th>
                    <th className="py-2.5 px-3 text-right">Annual Fuel (MT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {mrvVessels.map((v, idx) => (
                    <tr key={`${v.imo_number}-${idx}`} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500">{v.imo_number}</td>
                      <td className="py-2.5 px-3 font-medium text-stone-900">{v.ship_name}</td>
                      <td className="py-2.5 px-3 text-stone-600">{v.ship_type}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-stone-500">{v.reporting_period}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-stone-600">
                        {v.efficiency_val_gco2_per_tnm ? v.efficiency_val_gco2_per_tnm.toFixed(2) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-stone-500">
                        {v.time_at_sea_hours != null ? `${v.time_at_sea_hours.toFixed(0)} h` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-stone-500">
                        {v.has_ice_class ? (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {v.ice_class || 'Ice'}
                          </span>
                        ) : (
                          'None'
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-stone-700">
                        {v.total_co2_emissions_m_tonnes != null
                          ? v.total_co2_emissions_m_tonnes.toLocaleString(undefined, { maximumFractionDigits: 1 })
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-stone-900 tabular-nums">
                        {v.total_fuel_consumption_m_tonnes.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {mrvTotalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs font-mono">
              <span className="text-stone-500">
                Showing Page {mrvPage} of {mrvTotalPages} ({mrvTotalCount.toLocaleString()} total ships)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMrvPage(1)}
                  disabled={mrvPage <= 1 || mrvLoading}
                  className="px-2.5 py-1 border border-stone-200 rounded text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                >
                  First
                </button>
                <button
                  onClick={() => setMrvPage((p) => Math.max(1, p - 1))}
                  disabled={mrvPage <= 1 || mrvLoading}
                  className="p-1 border border-stone-200 rounded text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-stone-100 rounded text-stone-900 font-semibold">
                  {mrvPage}
                </span>
                <button
                  onClick={() => setMrvPage((p) => Math.min(mrvTotalPages, p + 1))}
                  disabled={mrvPage >= mrvTotalPages || mrvLoading}
                  data-testid="mrv-page-next"
                  className="p-1 border border-stone-200 rounded text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMrvPage(mrvTotalPages)}
                  disabled={mrvPage >= mrvTotalPages || mrvLoading}
                  className="px-2.5 py-1 border border-stone-200 rounded text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Custom Fleet CSV Ingestion View */}
      {activeSubTab === 'upload' && (
        <div className="bg-white rounded-lg border border-stone-200/90 shadow-2xs p-5 space-y-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
              Fleet Data Ingestion & Strict Validation
            </div>
            <h3 className="text-sm font-semibold text-stone-900 mt-0.5 flex items-center gap-2">
              <Upload className="w-4 h-4 text-stone-700" />
              Upload & Ingest Custom Fleet CSV Roster
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Required headers: <code className="text-stone-800 bg-stone-100 px-1 py-0.5 rounded font-mono text-[11px]">name, vessel_type, dwt, design_speed_knots, compatible_fuels</code>.
              Optional: <code className="text-stone-800 bg-stone-100 px-1 py-0.5 rounded font-mono text-[11px]">min_speed_knots, max_speed_knots, capacity_teu_or_dwt, gross_tonnage</code>.
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              data-testid="csv-textarea"
              rows={8}
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleValidateCsv}
              disabled={validating}
              data-testid="csv-validate-btn"
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-mono font-medium uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {validating ? (
                <span>Validating Physics & Rules...</span>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Validate Roster</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setCsvText(SAMPLE_CSV);
                setValidationResult(null);
              }}
              className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded text-xs font-mono transition-colors"
            >
              Reset Sample Template
            </button>
          </div>

          {validationResult && (
            <div
              data-testid="csv-validation-result"
              className={`p-4 rounded-lg border text-xs ${
                validationResult.is_valid
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2 font-medium mb-1">
                {validationResult.is_valid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Validation Passed: {validationResult.parsed_count || validationResult.valid_vessels.length} of{' '}
                      {validationResult.total_rows || validationResult.valid_vessels.length} vessels verified
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Validation Failed ({validationResult.errors.length} Errors Detected)</span>
                  </>
                )}
              </div>

              {validationResult.is_valid ? (
                <div className="space-y-3 mt-3 pt-3 border-t border-emerald-200/60">
                  <p className="text-stone-600 text-xs">
                    All vessels conform with naval hydrodynamics, speed monotonicity (min &lt; design &lt; max), valid fuel categories, and DWT ranges.
                  </p>

                  <div className="border border-emerald-200/80 rounded bg-white overflow-x-auto w-full max-w-full min-w-0">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-emerald-50/60 text-emerald-900 text-[10px] uppercase font-mono">
                        <tr>
                          <th className="py-1.5 px-2">Vessel ID</th>
                          <th className="py-1.5 px-2">Name</th>
                          <th className="py-1.5 px-2">Type</th>
                          <th className="py-1.5 px-2 text-right">DWT</th>
                          <th className="py-1.5 px-2 text-right">Speed (kts)</th>
                          <th className="py-1.5 px-2">Compatible Fuels</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100 font-mono text-[11px] text-stone-700">
                        {validationResult.valid_vessels.map((v) => (
                          <tr key={v.vessel_id}>
                            <td className="py-1.5 px-2 text-stone-500">{v.vessel_id}</td>
                            <td className="py-1.5 px-2 font-semibold text-stone-900">{v.name}</td>
                            <td className="py-1.5 px-2">{v.vessel_type}</td>
                            <td className="py-1.5 px-2 text-right tabular-nums">{v.dwt.toLocaleString()}</td>
                            <td className="py-1.5 px-2 text-right tabular-nums">{v.design_speed_knots}</td>
                            <td className="py-1.5 px-2 text-[10px] text-stone-600">{v.compatible_fuels.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => {
                        setFleet(validationResult.valid_vessels);
                        alert(`Successfully deployed ${validationResult.valid_vessels.length} validated vessels to active fleet roster!`);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-medium rounded transition-colors shadow-2xs"
                    >
                      Deploy to Active Fleet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-rose-800 font-medium">Please correct the following row errors:</p>
                  <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-rose-700">
                    {validationResult.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Port Infrastructure & Global UN/LOCODE Directory */}
      {activeSubTab === 'ports' && (
        <div className="space-y-6">
          {/* Card A: 7 Curated Operational Terminals */}
          <div className="bg-white rounded-lg border border-stone-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                  Calibrated Engineering Assets
                </div>
                <h3 className="text-sm font-semibold text-stone-900 mt-0.5 flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-stone-700" />
                  Curated Operational Maritime Hubs (7 Ports)
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                Simulated Terminals for Optimization Corridors
              </span>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              These 7 hubs have calibrated electrical grid carbon intensity factors, Onshore Power Supply (OPS / cold-ironing) capabilities, and localized turnaround times for green fleet dispatch.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {curatedPortList.map((p) => (
                <div
                  key={p.port_id}
                  className="p-3.5 rounded-lg border border-stone-200/80 bg-stone-50/20 hover:border-stone-300 transition-colors flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-800">
                          {p.port_id}
                        </span>
                        <strong className="text-xs font-semibold text-stone-900">{p.name}</strong>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-1 font-mono">
                        {p.country} · {p.lat?.toFixed(2)}°N, {p.lon?.toFixed(2)}°E
                      </div>
                    </div>

                    <div>
                      {p.has_cold_ironing ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-emerald-600" />
                          OPS Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-stone-100 text-stone-600">
                          Aux Engine
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-500">
                    <span>Grid Carbon:</span>
                    <strong className="text-stone-800">{p.grid_ci} gCO₂/kWh</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card B: Searchable Global UN/LOCODE Directory (11,829 Locations) */}
          <div className="bg-white rounded-lg border border-stone-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                  Global Maritime Registry
                </div>
                <h3 className="text-sm font-semibold text-stone-900 mt-0.5 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-stone-700" />
                  UN/LOCODE Standardized Maritime Directory ({unlocodeTotalCount.toLocaleString()} Ports)
                </h3>
              </div>

              <form onSubmit={handleUnlocodeSearch} className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Country (e.g. US, CN, NL, IN)..."
                  value={unlocodeCountry}
                  onChange={(e) => setUnlocodeCountry(e.target.value)}
                  data-testid="unlocode-country-input"
                  className="w-32 px-2.5 py-1.5 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 rounded text-xs font-mono uppercase text-stone-900"
                />
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search port name or LOCODE..."
                    value={unlocodeQuery}
                    onChange={(e) => setUnlocodeQuery(e.target.value)}
                    data-testid="unlocode-search-input"
                    className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 rounded text-xs font-mono text-stone-900"
                  />
                </div>
                <button
                  type="submit"
                  data-testid="unlocode-search-btn"
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-mono transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Disclaimer Banner */}
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs font-mono text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Regulatory Disclaimer:</strong>{' '}
                {unlocodeDisclaimer ||
                  'UN/LOCODE coordinates and function codes indicate transport geographic locations and do NOT certify terminal-level electrical shore-power infrastructure or local grid carbon intensity.'}
              </span>
            </div>

            <div className="border border-stone-200/90 rounded-lg overflow-x-auto w-full max-w-full min-w-0">
              {unlocodeLoading ? (
                <div className="py-12 text-center text-xs font-mono text-stone-400">
                  Searching UN/LOCODE international database...
                </div>
              ) : unlocodePorts.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-stone-400">
                  No UN/LOCODE ports found matching filters.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50/80 border-b border-stone-200/90 text-stone-500 uppercase text-[10px] font-mono tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">UN/LOCODE</th>
                      <th className="py-2.5 px-3">Port Name</th>
                      <th className="py-2.5 px-3">Country</th>
                      <th className="py-2.5 px-3 text-right">Latitude</th>
                      <th className="py-2.5 px-3 text-right">Longitude</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white font-mono text-[11px]">
                    {unlocodePorts.map((p, idx) => (
                      <tr key={`${p.locode}-${idx}`} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-2 px-3 font-semibold text-stone-900">{p.locode}</td>
                        <td className="py-2 px-3 font-sans text-stone-800">{p.port_name}</td>
                        <td className="py-2 px-3 text-stone-600">{p.country}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-stone-500">
                          {p.latitude != null ? p.latitude.toFixed(4) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-stone-500">
                          {p.longitude != null ? p.longitude.toFixed(4) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* UN/LOCODE Pagination Controls */}
            {unlocodeTotalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs font-mono">
                <span className="text-stone-500">
                  Showing Page {unlocodePage} of {unlocodeTotalPages} ({unlocodeTotalCount.toLocaleString()} total locations)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setUnlocodePage(1)}
                    disabled={unlocodePage <= 1 || unlocodeLoading}
                    className="px-2.5 py-1 border border-stone-200 rounded text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setUnlocodePage((p) => Math.max(1, p - 1))}
                    disabled={unlocodePage <= 1 || unlocodeLoading}
                    className="p-1 border border-stone-200 rounded text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-stone-100 rounded text-stone-900 font-semibold">
                    {unlocodePage}
                  </span>
                  <button
                    onClick={() => setUnlocodePage((p) => Math.min(unlocodeTotalPages, p + 1))}
                    disabled={unlocodePage >= unlocodeTotalPages || unlocodeLoading}
                    className="p-1 border border-stone-200 rounded text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setUnlocodePage(unlocodeTotalPages)}
                    disabled={unlocodePage >= unlocodeTotalPages || unlocodeLoading}
                    className="px-2.5 py-1 border border-stone-200 rounded text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
