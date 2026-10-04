import React, { useEffect, useState } from 'react';
import { useGlobalDispatchState } from './store/useDispatchStore';
import { useRouter } from './hooks/useRouter';
import { EditorialShowcase } from './components/editorial/EditorialShowcase';
import { FleetDashboard } from './components/dashboard/FleetDashboard';
import { JudgeModePage } from './components/judge/JudgeModePage';
import { ViewportTransitionScreen } from './components/navigation/ViewportTransitionScreen';

export const App: React.FC = () => {
  const store = useGlobalDispatchState();
  const { currentPath, navigate, isDashboard, isJudge } = useRouter();

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
  const handleEnterCockpit = (e?: React.MouseEvent | { clientX: number; clientY: number } | HTMLElement) => {
    let origin: { x: number; y: number } = {
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 600,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    };

    let targetEl: HTMLElement | null = null;
    if (e instanceof HTMLElement) {
      targetEl = e;
    } else if (e && 'currentTarget' in e && e.currentTarget instanceof HTMLElement) {
      targetEl = e.currentTarget;
    } else if (e && 'target' in e && e.target instanceof HTMLElement) {
      targetEl = (e.target.closest('button') || e.target) as HTMLElement;
    }

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      origin = {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      };
    } else if (e && 'clientX' in e && typeof e.clientX === 'number' && typeof (e as any).clientY === 'number') {
      const clientX = e.clientX;
      const clientY = (e as any).clientY;
      const elFromPoint = typeof document !== 'undefined'
        ? document.elementFromPoint(clientX, clientY)?.closest('button')
        : null;
      if (elFromPoint) {
        const rect = elFromPoint.getBoundingClientRect();
        origin = {
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
        };
      } else {
        origin = { x: Math.round(clientX), y: Math.round(clientY) };
      }
    } else {
      const btn = typeof document !== 'undefined' ? document.querySelector('[data-nav-dashboard-btn]') : null;
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
  const handleNavigateLanding = (e?: React.MouseEvent | { clientX: number; clientY: number } | Element) => {
    let origin: { x: number; y: number } = {
      x: 70,
      y: 32,
    };

    let targetEl: Element | null = null;
    if (e instanceof Element) {
      targetEl = e;
    } else if (e && 'currentTarget' in e && (e.currentTarget as unknown) instanceof Element) {
      targetEl = e.currentTarget as Element;
    } else if (e && 'target' in e && (e.target as unknown) instanceof Element) {
      const target = e.target as Element;
      targetEl = (target.closest('button') || target.closest('[role="button"]') || target) as Element;
    }

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      origin = {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      };
    } else if (e && 'clientX' in e && typeof e.clientX === 'number' && typeof (e as any).clientY === 'number') {
      const clientX = e.clientX;
      const clientY = (e as any).clientY;
      const elFromPoint = typeof document !== 'undefined'
        ? (document.elementFromPoint(clientX, clientY)?.closest('button') || document.elementFromPoint(clientX, clientY)?.closest('[role="button"]'))
        : null;
      if (elFromPoint) {
        const rect = elFromPoint.getBoundingClientRect();
        origin = {
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
        };
      } else {
        origin = { x: Math.round(clientX), y: Math.round(clientY) };
      }
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
      {isJudge ? (
        <JudgeModePage
          onExit={() => navigate('/')}
          onNavigateDashboard={() => navigate('/dashboard')}
        />
      ) : isDashboard ? (
        <FleetDashboard
          store={store}
          onNavigateLanding={handleNavigateLanding}
          onNavigateJudge={() => navigate('/judge')}
        />
      ) : (
        <EditorialShowcase
          speedKnots={speedKnots}
          setSpeedKnots={setSpeedKnots}
          waveHeight={waveHeight}
          setWaveHeight={setWaveHeight}
          onEnterCockpit={handleEnterCockpit}
          onNavigateJudge={() => navigate('/judge')}
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
