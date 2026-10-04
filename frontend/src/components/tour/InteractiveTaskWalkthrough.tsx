import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle2, Award, Zap, Play } from '@/components/icons';

interface Props {
  isActive: boolean;
  onClose: () => void;
  currentTab: string;
  onSwitchTab: (tabId: string) => void;
}

interface TourStep {
  id: number;
  title: string;
  task: string;
  tab: string;
  targetId: string;
  tip: string;
  actionHint: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Test Vessel Speed & Hydrodynamic Drag',
    task: 'Notice how fuel consumption surges exponentially with speed. Move the speed slider to see real-time power and resistance adjustments.',
    tab: 'physics',
    targetId: 'tour-speed-slider',
    tip: 'Holtrop-Mennen equations calculate viscous friction while Kwon model accounts for wave resistance in irregular seaways.',
    actionHint: 'Adjust the Cruising Speed slider below, then click Next.',
  },
  {
    id: 2,
    title: 'Run Multi-Objective Optimization',
    task: 'Execute the quantum-inspired evolutionary solver (MO-QIEA). It explores the combinatorial space of vessel allocations, speeds, and fuels.',
    tab: 'overview',
    targetId: 'tour-run-optimization',
    tip: 'Using Q-bit rotation gates, the solver converges up to 40% faster than standard classical genetic algorithms.',
    actionHint: 'Click "Run Optimization" in the header to evaluate the fleet.',
  },
  {
    id: 3,
    title: 'Inspect the Pareto Optimal Knee Point',
    task: 'The scatter plot maps fuel consumption against operating cost. The highlighted orange circle is the "Knee Solution"—delivering maximum fuel savings with minimum schedule disruption.',
    tab: 'optimization',
    targetId: 'tour-pareto-chart',
    tip: 'Click any dot on the chart to select alternative operational plans and see their waypoint speed profiles.',
    actionHint: 'Explore the trade-offs on the Pareto curve, then click Next.',
  },
  {
    id: 4,
    title: 'Verify IMO CII & FuelEU Compliance',
    task: 'Inspect your fleet’s dynamic Carbon Intensity Indicator (CII) letter grade and FuelEU Maritime compliance balance.',
    tab: 'compliance',
    targetId: 'tour-cii-badge',
    tip: 'Under IMO MEPC.354(78), Grade B avoids SEEMP Part III corrective overhauls and secures lower charter financing rates.',
    actionHint: 'Review the Grade B compliance badge and boundaries, then click Next.',
  },
  {
    id: 5,
    title: 'Export Voyage Dispatch & Compliance PDF',
    task: 'Generate a modeled dispatch report with deterministic cryptographic SHA-256 audit hash ready for maritime voyage operations.',
    tab: 'overview',
    targetId: 'tour-export-pdf',
    tip: 'The report bundles voyage hydrodynamics, fuel lifecycle accounting, and regulatory compliance into a clean 2-page PDF.',
    actionHint: 'Click "Export PDF" in the header to download your report!',
  },
];

export const InteractiveTaskWalkthrough: React.FC<Props> = ({
  isActive,
  onClose,
  currentTab,
  onSwitchTab,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const step = TOUR_STEPS[currentStepIdx];

  // Auto-switch tab to match the tour step
  useEffect(() => {
    if (isActive && step && currentTab !== step.tab) {
      onSwitchTab(step.tab);
    }
  }, [isActive, currentStepIdx, step, currentTab, onSwitchTab]);

  if (!isActive) return null;

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <>
      {/* 1. Completed Celebration Dialog */}
      {isCompleted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Walkthrough Complete!
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              You now have full command of the GreenFleet workstation: adjusting physics, executing quantum multi-objective optimization, auditing IMO CII ratings, and exporting verified dispatch reports.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                Return to Workspace
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Floating Interactive Tour Card (Bottom Right Position) */
        <div className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-orange-200 p-5 animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-orange-900">
                Interactive Task Walkthrough
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
              title="Close Walkthrough"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step Counter */}
          <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 mb-1">
            <span>TASK {step.id} OF {TOUR_STEPS.length}</span>
            <span className="text-orange-600 font-bold">{step.tab.toUpperCase()} TAB</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-orange-600 transition-all duration-300"
              style={{ width: `${(step.id / TOUR_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Title & Task */}
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-bold text-gray-900 leading-snug">
              {step.title}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {step.task}
            </p>
          </div>

          {/* Action Hint Box */}
          <div className="p-2.5 bg-orange-50/80 rounded-lg border border-orange-200/80 text-[11px] text-orange-950 flex items-start gap-2 mb-4">
            <Zap className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
            <span><strong>Action:</strong> {step.actionHint}</span>
          </div>

          {/* Tip */}
          <div className="text-[11px] text-gray-500 leading-relaxed italic border-t border-gray-100 pt-2 mb-4">
            💡 {step.tip}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-600 flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Prev
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {currentStepIdx < TOUR_STEPS.length - 1 ? (
                <>
                  Next Task
                  <ArrowRight className="w-3 h-3" />
                </>
              ) : (
                'Finish Tour'
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
