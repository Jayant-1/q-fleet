import React, { useState, useEffect } from 'react';
import { Ship, Compass, ArrowRight, Check, X, Layers, Award } from '@/components/icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartWalkthrough: () => void;
}

export const WelcomeOnboardingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onStartWalkthrough,
}) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Welcome to Q-FLEET Workstation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Content */}
        <div className="px-6 py-4 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Ship className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Decarbonizing Fleets with Precision
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                Q-FLEET is designed for daily commercial dispatchers and environmental compliance officers.
                We combine first-principles naval architecture (where propulsion power scales cubically with speed, P ~ V³) with quantum-inspired multi-objective optimization to balance voyage transit time against fuel consumption, prevent IMO CII rating penalties, and comply with EU ETS 2026 mandates.
              </p>
              <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 space-y-1.5 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real EMSA THETIS-MRV commercial database (25,691 annual records across 15,924 vessels)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dynamic IMO MEPC.354(78) CII ratings (Grade A–E)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sub-second multi-objective Pareto optimization</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Your 5-Tab Dedicated Workspace
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                Rather than overcrowding your screen, your daily workflows are organized into 5 focused tabs designed for comfortable 8–9 hour operational use:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2.5">
                  <span className="font-bold text-gray-900 w-24 shrink-0">1. Overview:</span>
                  <span className="text-gray-600">Executive metrics, route map, and active ship schedules.</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2.5">
                  <span className="font-bold text-gray-900 w-24 shrink-0">2. Physics:</span>
                  <span className="text-gray-600">Interactive speed, draft, and wave drag simulator.</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2.5">
                  <span className="font-bold text-gray-900 w-24 shrink-0">3. Optimization:</span>
                  <span className="text-gray-600">Pareto frontier trade-offs and waypoint speed profiles.</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2.5">
                  <span className="font-bold text-gray-900 w-24 shrink-0">4. Compliance:</span>
                  <span className="text-gray-600">IMO CII letter grades, FuelEU penalties, and carbon pricing.</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2.5">
                  <span className="font-bold text-gray-900 w-24 shrink-0">5. Directory:</span>
                  <span className="text-gray-600">Searchable MRV database, custom CSV fleet upload, and ports.</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Ready to Optimize Your First Voyage?
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                We've prepared an interactive, hands-on task walkthrough. You'll actually test adjusting vessel speeds, run the quantum solver, review the resulting IMO CII grade, and download a verified audit report.
              </p>
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-orange-950 uppercase tracking-wider block">
                  Interactive Hands-On Walkthrough (Takes 2 minutes)
                </span>
                <p className="text-xs text-orange-900 leading-relaxed">
                  Interactive spotlight tooltips will guide your cursor directly on active controls. You can skip or pause anytime.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === s ? 'bg-orange-600 w-5' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  Next Step
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                >
                  I'll Explore on My Own
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onStartWalkthrough();
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  Start Hands-On Walkthrough
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
