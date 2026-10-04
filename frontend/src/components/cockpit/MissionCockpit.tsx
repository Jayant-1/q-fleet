import React, { useEffect, useState } from 'react';
import { CockpitHeader } from './CockpitHeader';
import { HydrodynamicsDock } from './HydrodynamicsDock';
import { SpatialMapDock } from './SpatialMapDock';
import { ParetoDock } from './ParetoDock';
import { RegulatoryDock } from './RegulatoryDock';
import { VesselRegistryModal } from './VesselRegistryModal';
import { PortRegistryDrawer } from './PortRegistryDrawer';
import { SensitivityExplorerModal } from './SensitivityExplorerModal';
import { useGlobalDispatchState } from '../../store/useDispatchStore';

interface Props {
  store: ReturnType<typeof useGlobalDispatchState>;
}

export const MissionCockpit: React.FC<Props> = ({ store }) => {
  const {
    corridors,
    activeCorridorId,
    setActiveCorridorId,
    fleet,
    setFleet,
    activeVessel,
    selectedFuel,
    setSelectedFuel,
    speedKnots,
    setSpeedKnots,
    draftMeters,
    setDraftMeters,
    waveHeight,
    setWaveHeight,
    carbonPriceEur,
    setCarbonPriceEur,
    hydrodynamics,
    latestOptimization,
    selectedParetoSolution,
    setSelectedParetoSolution,
    isSolving,
    solverLatencyMs,
    executeQuantumSolver,
    triggerPdfExport,
    setCurrentMode,
  } = store;

  const [isVesselsOpen, setIsVesselsOpen] = useState(false);
  const [isPortsOpen, setIsPortsOpen] = useState(false);
  const [isSensitivityOpen, setIsSensitivityOpen] = useState(false);

  // Keyboard shortcut listeners for Cockpit:
  // Space: Re-run solver
  // ⌘E / Ctrl+E: Export PDF
  // 1-5: Switch corridors
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space (when not inside an input)
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'SELECT') {
        e.preventDefault();
        executeQuantumSolver();
      }

      // ⌘E or Ctrl+E (Export PDF)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        triggerPdfExport();
      }

      // Numbers 1-5
      if (!e.metaKey && !e.ctrlKey && ['1', '2', '3', '4', '5'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (corridors[idx]) {
          setActiveCorridorId(corridors[idx].route_id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [corridors, executeQuantumSolver, triggerPdfExport, setActiveCorridorId]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#08080a] text-white font-sans selection:bg-[#ff6b00] selection:text-black">
      {/* 1. Header (56px) */}
      <CockpitHeader
        corridors={corridors}
        activeCorridorId={activeCorridorId}
        setActiveCorridorId={setActiveCorridorId}
        solverLatencyMs={solverLatencyMs}
        isSolving={isSolving}
        onToggleEditorial={() => setCurrentMode('editorial')}
        onExportPdf={triggerPdfExport}
        onOpenVessels={() => setIsVesselsOpen(true)}
        onOpenPorts={() => setIsPortsOpen(true)}
        onOpenSensitivity={() => setIsSensitivityOpen(true)}
      />

      {/* 2. Central Operational Workspace Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Dock Bay: Hydrodynamics Studio */}
        <HydrodynamicsDock
          activeVessel={activeVessel}
          speedKnots={speedKnots}
          setSpeedKnots={setSpeedKnots}
          draftMeters={draftMeters}
          setDraftMeters={setDraftMeters}
          waveHeight={waveHeight}
          setWaveHeight={setWaveHeight}
          calc={hydrodynamics}
        />

        {/* Center Stage: Route Map + Bottom Pareto Dock */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Spatial Bathymetry & Corridors Map */}
          <SpatialMapDock
            corridors={corridors}
            activeCorridorId={activeCorridorId}
            setActiveCorridorId={setActiveCorridorId}
            speedKnots={speedKnots}
          />

          {/* Bottom Dock Bay: Live Quantum Pareto Frontier & Speed Profile */}
          <ParetoDock
            latestOptimization={latestOptimization}
            selectedSolution={selectedParetoSolution}
            setSelectedSolution={setSelectedParetoSolution}
            isSolving={isSolving}
            onExecuteSolver={() => executeQuantumSolver()}
          />
        </div>

        {/* Right Dock Bay: Alternative Fuels, CII Compliance & Fleet Matrix */}
        <RegulatoryDock
          fleet={fleet}
          selectedFuel={selectedFuel}
          setSelectedFuel={setSelectedFuel}
          carbonPriceEur={carbonPriceEur}
          setCarbonPriceEur={setCarbonPriceEur}
          selectedSolution={selectedParetoSolution}
        />
      </div>

      {/* Modals & Drawers */}
      <VesselRegistryModal
        isOpen={isVesselsOpen}
        onClose={() => setIsVesselsOpen(false)}
        onImportFleet={(newVessels) => setFleet(newVessels)}
      />

      <PortRegistryDrawer
        isOpen={isPortsOpen}
        onClose={() => setIsPortsOpen(false)}
        corridors={corridors}
      />

      <SensitivityExplorerModal
        isOpen={isSensitivityOpen}
        onClose={() => setIsSensitivityOpen(false)}
        carbonPriceEur={carbonPriceEur}
        setCarbonPriceEur={setCarbonPriceEur}
        onRunSolver={executeQuantumSolver}
        isSolving={isSolving}
      />
    </div>
  );
};
