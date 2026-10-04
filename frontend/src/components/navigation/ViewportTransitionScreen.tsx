import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  isActive: boolean;
  origin: { x: number; y: number } | null;
  targetMode?: 'to-dashboard' | 'to-landing';
  onTransitionReady: () => void;
  onComplete: () => void;
}

/**
 * Circle Page Transition
 * 
 * Expands a circle starting from the exact center of the clicked button
 * across the viewport to full screen, and then reveals the dashboard.
 * Modeled after the reference recording (Winterwind Inc. Circle Page Transition).
 */
export const ViewportTransitionScreen: React.FC<Props> = ({
  isActive,
  origin,
  targetMode = 'to-dashboard',
  onTransitionReady,
  onComplete,
}) => {
  const [animating, setAnimating] = useState(false);
  const [dissolving, setDissolving] = useState(false);

  // Compute exact center coordinates of the triggering button
  const centerX = origin?.x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 600);
  const centerY = origin?.y ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 400);

  // Maximum radius needed to fully cover all 4 viewport corners from (centerX, centerY)
  const maxRadius = typeof window !== 'undefined'
    ? Math.ceil(
        Math.hypot(
          Math.max(centerX, window.innerWidth - centerX),
          Math.max(centerY, window.innerHeight - centerY)
        ) * 1.05
      )
    : 1800;

  useEffect(() => {
    if (!isActive) {
      setAnimating(false);
      setDissolving(false);
      return;
    }

    setAnimating(true);
    setDissolving(false);

    // 1. Circle expands from center of button across the entire viewport (duration: 600ms)
    // 2. Right when it covers the full viewport, swap the page view
    const readyTimer = setTimeout(() => {
      onTransitionReady();
      setDissolving(true);
    }, 600);

    // 3. Complete transition and clean up
    const completeTimer = setTimeout(() => {
      setAnimating(false);
      setDissolving(false);
      onComplete();
    }, 750);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(completeTimer);
    };
  }, [isActive]);

  if (!isActive && !animating) return null;

  const isToDashboard = targetMode === 'to-dashboard';
  // Theme color for the expanding circle:
  // When transitioning to Dashboard -> #F8F9FA (matching dashboard canvas)
  // When transitioning to Landing -> #08080a (matching landing obsidian)
  const circleColor = isToDashboard ? '#F8F9FA' : '#08080a';

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden">
      {/* 1. Main Expanding Circle Mask */}
      <motion.div
        initial={{
          clipPath: `circle(0px at ${centerX}px ${centerY}px)`,
          opacity: 1,
        }}
        animate={{
          clipPath: `circle(${maxRadius}px at ${centerX}px ${centerY}px)`,
          opacity: dissolving ? 0 : 1,
        }}
        transition={{
          clipPath: {
            duration: 0.6,
            ease: [0.4, 0.0, 0.2, 1], // Smooth standard acceleration-deceleration curve
          },
          opacity: {
            duration: 0.15,
            ease: 'linear',
          },
        }}
        className="w-full h-full"
        style={{
          backgroundColor: circleColor,
        }}
      />

      {/* 2. Expanding Amber Ring Leading Wavefront (expands from button center) */}
      <motion.div
        initial={{
          width: 0,
          height: 0,
          opacity: 0.9,
        }}
        animate={{
          width: maxRadius * 2,
          height: maxRadius * 2,
          opacity: dissolving ? 0 : 0.35,
        }}
        transition={{
          width: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1] },
          height: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1] },
          opacity: { duration: 0.2, ease: 'easeOut' },
        }}
        style={{
          position: 'absolute',
          left: centerX,
          top: centerY,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '2.5px solid #ff6b00',
          boxShadow: '0 0 25px rgba(255, 107, 0, 0.4)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
