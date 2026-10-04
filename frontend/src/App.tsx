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
  }>({
    isActive: false,
    origin: null,
  });

  const {
    speedKnots,
    setSpeedKnots,
    waveHeight,
    setWaveHeight,
  } = store;

  const handleEnterCockpit = (e?: React.MouseEvent | { clientX: number; clientY: number }) => {
    let origin: { x: number; y: number } | null = null;
    if (e && 'clientX' in e && typeof e.clientX === 'number') {
      origin = { x: e.clientX, y: e.clientY };
    } else {
      origin = { x: typeof window !== 'undefined' ? window.innerWidth - 100 : 1200, y: 32 };
    }

    setTransitionState({
      isActive: true,
      origin,
    });
  };

  // Global Keyboard Navigation: ⌘K or Ctrl+K toggles between Landing Page and Dashboard
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (currentPath === '/dashboard') {
          navigate('/');
        } else {
          handleEnterCockpit();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [currentPath, navigate]);

  return (
    <div className="min-h-screen font-sans antialiased">
      {isDashboard ? (
        <FleetDashboard
          store={store}
          onNavigateLanding={() => navigate('/')}
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

      {/* Viewport Transition Screen (Expands from button across full viewport) */}
      <ViewportTransitionScreen
        isActive={transitionState.isActive}
        origin={transitionState.origin}
        onTransitionReady={() => {
          navigate('/dashboard');
        }}
        onComplete={() => {
          setTransitionState({ isActive: false, origin: null });
        }}
      />
    </div>
  );
};

export default App;

