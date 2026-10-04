import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Check } from 'iconoir-react';
import { QFleetLogo } from '../brand/QFleetLogo';

interface Props {
  isActive: boolean;
  origin: { x: number; y: number } | null;
  onTransitionReady: () => void; // Called when screen is covered to mount dashboard underneath
  onComplete: () => void; // Called when transition curtain dissolves completely
}

export const ViewportTransitionScreen: React.FC<Props> = ({
  isActive,
  origin,
  onTransitionReady,
  onComplete,
}) => {
  const [stage, setStage] = useState<'idle' | 'expanding' | 'loading' | 'dissolving'>('idle');
  const [progress, setProgress] = useState(0);
  const [telemetryStep, setTelemetryStep] = useState(0);

  // Compute origin coordinates (default to top-right navbar position if null)
  const clickX = origin?.x ?? (typeof window !== 'undefined' ? window.innerWidth - 120 : 1200);
  const clickY = origin?.y ?? 32;

  // Maximum radius needed to completely cover the screen from the click point
  const maxRadius = typeof window !== 'undefined'
    ? Math.ceil(
        Math.hypot(
          Math.max(clickX, window.innerWidth - clickX),
          Math.max(clickY, window.innerHeight - clickY)
        ) * 1.15
      )
    : 1800;

  useEffect(() => {
    if (!isActive) {
      setStage('idle');
      setProgress(0);
      setTelemetryStep(0);
      return;
    }

    // 1. Start expanding from button
    setStage('expanding');

    // Telemetry and progress sequence
    const p1 = setTimeout(() => {
      setStage('loading');
      setProgress(38);
      setTelemetryStep(1);
    }, 180);

    const p2 = setTimeout(() => {
      setProgress(75);
      setTelemetryStep(2);
    }, 380);

    const p3 = setTimeout(() => {
      setProgress(100);
      setTelemetryStep(3);
    }, 580);

    // 2. Full screen covered — mount dashboard underneath
    const readyTimer = setTimeout(() => {
      onTransitionReady();
    }, 750);

    // 3. Start dissolving transition overlay to reveal dashboard
    const dissolveTimer = setTimeout(() => {
      setStage('dissolving');
    }, 920);

    // 4. Complete transition and clean up
    const completeTimer = setTimeout(() => {
      setStage('idle');
      onComplete();
    }, 1200);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(readyTimer);
      clearTimeout(dissolveTimer);
      clearTimeout(completeTimer);
    };
  }, [isActive, onTransitionReady, onComplete]);

  if (!isActive && stage === 'idle') return null;

  return (
    <AnimatePresence>
      {stage !== 'idle' && (
        <div className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden">
          {/* Expanding Dark Matte Tactical Curtain */}
          <motion.div
            initial={{
              clipPath: `circle(0px at ${clickX}px ${clickY}px)`,
              opacity: 1,
            }}
            animate={{
              clipPath: `circle(${maxRadius}px at ${clickX}px ${clickY}px)`,
              opacity: stage === 'dissolving' ? 0 : 1,
              scale: stage === 'dissolving' ? 1.02 : 1,
            }}
            transition={{
              clipPath: {
                duration: 0.42,
                ease: [0.16, 1, 0.3, 1], // Exponential ease-out
              },
              opacity: {
                duration: 0.28,
                ease: 'easeInOut',
              },
              scale: {
                duration: 0.28,
                ease: 'easeOut',
              },
            }}
            className="w-full h-full bg-[#111114] flex flex-col items-center justify-center relative select-none"
            style={{
              backgroundImage: "url('/assets/matte_noise_seamless.png')",
              backgroundRepeat: 'repeat',
            }}
          >
            {/* Ambient Shockwave Pulse from Origin Button */}
            <motion.div
              initial={{ scale: 0, opacity: 0.95 }}
              animate={{ scale: 32, opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              style={{
                left: clickX,
                top: clickY,
                position: 'absolute',
                width: 60,
                height: 60,
                marginLeft: -30,
                marginTop: -30,
                borderRadius: '50%',
                border: '2px solid #ff6b00',
                boxShadow: '0 0 50px #ff6b00',
              }}
            />

            {/* Tactical Grid Background Overlay */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />

            {/* Tactical Telemetry Corner Accents */}
            <div className="absolute top-8 left-8 font-mono text-[10px] text-zinc-400 tracking-[0.25em] uppercase flex items-center gap-2 select-none">
              <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-ping" />
              <span className="font-semibold text-white select-none">Q-FLEET // TRANSIT PROTOCOL</span>
            </div>
            <div className="absolute top-8 right-8 font-mono text-[10px] text-zinc-400 tracking-[0.25em] uppercase">
              WORKSTATION: <span className="text-[#ff6b00]">COCKPIT DISPATCH</span>
            </div>
            <div className="absolute bottom-8 left-8 font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
              IMO MEPC.328(76) · EU ETS DIRECTIVE 2023/959
            </div>
            <div className="absolute bottom-8 right-8 font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
              PARITY ENGINE: SHA-256 SIGNED
            </div>

            {/* Central Mission Control Transition Card */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1, duration: 0.25 }}
              className="relative z-10 flex flex-col items-center max-w-lg w-full px-8 py-8 bg-[#0a0a0c]/90 border border-white/15 backdrop-blur-md shadow-2xl text-center"
            >
              {/* Rotating Amber Gyroscope */}
              <div className="relative mb-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border border-white/15 flex items-center justify-center bg-black/60 shadow-[0_0_35px_rgba(255,107,0,0.25)]"
                >
                  <QFleetLogo className="w-8 h-8 text-[#ff6b00]" />
                </motion.div>
                {/* Secondary Orbit Ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-2 rounded-full border border-dashed border-[#ff6b00]/40 pointer-events-none"
                />
              </div>

              {/* Title & Status */}
              <h2 className="font-mono text-sm md:text-base font-bold uppercase tracking-[0.25em] text-white select-none">
                Q-FLEET // NAVAL COMMAND
              </h2>
              <p className="font-mono text-xs text-[#ff6b00] tracking-wider mt-1 uppercase font-semibold">
                INITIALIZING QUANTUM DISPATCH COCKPIT
              </p>

              {/* Animated Progress Bar */}
              <div className="w-full bg-white/10 h-1.5 mt-6 rounded-none overflow-hidden relative border border-white/10">
                <motion.div
                  className="h-full bg-[#ff6b00] shadow-[0_0_15px_#ff6b00]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              </div>

              {/* Telemetry Stage Indicators */}
              <div className="w-full mt-5 space-y-2 text-left font-mono text-[11px]">
                <div
                  className={`flex items-center justify-between transition-colors duration-200 ${
                    telemetryStep >= 1 ? 'text-zinc-100 font-semibold' : 'text-zinc-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {telemetryStep >= 1 ? (
                      <Check className="w-4 h-4 text-emerald-400 stroke-2" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-zinc-700 ml-1 mr-1" />
                    )}
                    HOLTROP-MENNEN HYDRODYNAMICS
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {telemetryStep >= 1 ? 'SYNCHRONIZED' : 'STANDBY'}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between transition-colors duration-200 ${
                    telemetryStep >= 2 ? 'text-zinc-100 font-semibold' : 'text-zinc-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {telemetryStep >= 2 ? (
                      <Check className="w-4 h-4 text-emerald-400 stroke-2" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-zinc-700 ml-1 mr-1" />
                    )}
                    Q-QUDIT QUANTUM SUPERPOSITION
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {telemetryStep >= 2 ? '40 GENERATIONS' : 'PENDING'}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between transition-colors duration-200 ${
                    telemetryStep >= 3 ? 'text-zinc-100 font-semibold' : 'text-zinc-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {telemetryStep >= 3 ? (
                      <Check className="w-4 h-4 text-emerald-400 stroke-2" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-zinc-700 ml-1 mr-1" />
                    )}
                    IMO MEPC.328(76) CII ENGINES
                  </span>
                  <span className="text-[10px] text-[#ff6b00]">
                    {telemetryStep >= 3 ? 'READY' : 'LOADING'}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
