import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Activity,
  Cpu,
  Flame,
  FileText,
  Sliders,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';

export type TabKey =
  | 'operations'
  | 'pareto'
  | 'prediction'
  | 'fuels'
  | 'benchmarks'
  | 'reports';

interface HeaderNavProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isRunningOpt: boolean;
  onOpenSandbox: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onSelectTab,
  isRunningOpt,
  onOpenSandbox,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'operations', label: 'Fleet & Corridors', icon: Compass },
    { key: 'pareto', label: 'Pareto Trade-offs', icon: Layers },
    { key: 'prediction', label: 'Quantum Predictor', icon: Activity },
    { key: 'fuels', label: 'Fuel Pathways & Shore Power', icon: Flame },
    { key: 'benchmarks', label: 'Algorithm Benchmarks', icon: Cpu },
    { key: 'reports', label: 'Audit & Compliance', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-oceanic-void/90 backdrop-blur-md border-b border-oceanic-border no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Operational Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-telemetry-cyan/20 to-telemetry-violet/20 border border-telemetry-cyan/40 flex items-center justify-center glow-cyan">
              <Compass className="w-5 h-5 text-telemetry-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-100 text-sm sm:text-base font-sans">
                  QUANTUM<span className="text-telemetry-cyan">MARITIME</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-telemetry-seafoam/10 text-telemetry-seafoam border border-telemetry-seafoam/30">
                  <ShieldCheck className="w-3 h-3" /> IMO MEPC.376
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                SIH26138 Green Fleet & Speed-Fuel Optimization
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => onSelectTab(t.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-oceanic-hull text-telemetry-cyan border border-telemetry-cyan/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-oceanic-hull/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-telemetry-cyan' : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions: Sandbox Button & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSandbox}
              disabled={isRunningOpt}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition-all ${
                isRunningOpt
                  ? 'bg-telemetry-amber/20 text-telemetry-amber border border-telemetry-amber/40 animate-pulse'
                  : 'bg-telemetry-cyan/15 hover:bg-telemetry-cyan/25 text-telemetry-cyan border border-telemetry-cyan/40 hover:glow-cyan'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isRunningOpt ? 'SOLVING...' : 'POLICY SANDBOX'}</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-oceanic-hull"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-oceanic-border bg-oceanic-hull px-4 pt-2 pb-4 space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  onSelectTab(t.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-oceanic-void text-telemetry-cyan border border-telemetry-cyan/30'
                    : 'text-slate-300 hover:bg-oceanic-void/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-telemetry-cyan' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
