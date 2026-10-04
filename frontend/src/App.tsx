import React, { useEffect, useState } from 'react';
import { useGlobalDispatchState } from './store/useDispatchStore';
import { useRouter } from './hooks/useRouter';
import { EditorialShowcase } from './components/editorial/EditorialShowcase';
import { FleetDashboard } from './components/dashboard/FleetDashboard';
import { ViewportTransitionScreen } from './components/navigation/ViewportTransitionScreen';

export const App: React.FC = () => {
  const store = useGlobalDispatchState();
  const { currentPath, navigate, isDashboard } = useRouter();

  const [transitionState, setTransitionState] = useState<{
    isActive: boolean;
    origin: { x: number; y: number } | null;
    targetMode: 'to-dashboard' | 'to-landing';
  }>({
    isActive: false,
    origin: null,
    targetMode: 'to-dashboard',
  });

  const {
    speedKnots,
    setSpeedKnots,
    waveHeight,
    setWaveHeight,
  } = store;

  // Trigger circle transition into Dashboard starting from button's geometric center
  const handleEnterCockpit = (e?: React.MouseEvent | { clientX: number; clientY: number }) => {
    let origin: { x: number; y: number } = {
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 600,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    };

    if (e && 'currentTarget' in e && e.currentTarget instanceof HTMLElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      origin = {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      };
    } else if (e && 'clientX' in e && typeof e.clientX === 'number') {
      origin = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
    } else {
      const btn = document.querySelector('[data-nav-dashboard-btn]');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        origin = {
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
        };
      }
    }

    setTransitionState({
      isActive: true,
      origin,
      targetMode: 'to-dashboard',
    });
  };

  // Trigger circle transition back to Landing starting from Landing button's center
  const handleNavigateLanding = (e?: React.MouseEvent) => {
    let origin: { x: number; y: number } = {
      x: 70,
      y: 32,
    };

    if (e && 'currentTarget' in e && e.currentTarget instanceof HTMLElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      origin = {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      };
    }

    setTransitionState({
      isActive: true,
      origin,
      targetMode: 'to-landing',
    });
  };

  // Global Keyboard Navigation: ⌘K or Ctrl+K toggles between Landing Page and Dashboard
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (currentPath === '/dashboard') {
          handleNavigateLanding();
        } else {
          handleEnterCockpit();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [currentPath]);

  return (
    <div className="min-h-screen font-sans antialiased">
      {isDashboard ? (
        <FleetDashboard
          store={store}
          onNavigateLanding={handleNavigateLanding}
        />
      ) : (
        <EditorialShowcase
          speedKnots={speedKnots}
          setSpeedKnots={setSpeedKnots}
          waveHeight={waveHeight}
          setWaveHeight={setWaveHeight}
          onEnterCockpit={handleEnterCockpit}
        />
      )}

      {/* Circle Viewport Transition (Expands from center of clicked button to full screen) */}
      <ViewportTransitionScreen
        isActive={transitionState.isActive}
        origin={transitionState.origin}
        targetMode={transitionState.targetMode}
        onTransitionReady={() => {
          if (transitionState.targetMode === 'to-dashboard') {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        }}
        onComplete={() => {
          setTransitionState((prev) => ({ ...prev, isActive: false, origin: null }));
        }}
      />
    </div>
  );
};

export default App;
