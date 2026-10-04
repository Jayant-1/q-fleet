import React, { useEffect } from 'react';
import { useGlobalDispatchState } from './store/useDispatchStore';
import { useRouter } from './hooks/useRouter';
import { EditorialShowcase } from './components/editorial/EditorialShowcase';
import { FleetDashboard } from './components/dashboard/FleetDashboard';

export const App: React.FC = () => {
  const store = useGlobalDispatchState();
  const { currentPath, navigate, isDashboard } = useRouter();

  const {
    speedKnots,
    setSpeedKnots,
    waveHeight,
    setWaveHeight,
  } = store;

  // Global Keyboard Navigation: ⌘K or Ctrl+K toggles between Landing Page and Dashboard
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate(currentPath === '/dashboard' ? '/' : '/dashboard');
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
          onEnterCockpit={() => navigate('/dashboard')}
        />
      )}
    </div>
  );
};

export default App;

