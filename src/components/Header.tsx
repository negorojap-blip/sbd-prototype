import React from 'react';
import { Globe, Check } from 'lucide-react';
import type { Language, ScreenId, StepNumber } from '../types/sbd';
import { SCREEN_STEP_MAP } from '../types/sbd';

interface HeaderProps {
  screenId: ScreenId;
  language: Language;
  onToggleLanguage: () => void;
}

const STEPS = [
  { num: 1 as StepNumber, ja: '手荷物の準備', en: 'Prep Baggage' },
  { num: 2 as StepNumber, ja: '搭乗便の確認', en: 'Confirm Flight' },
  { num: 3 as StepNumber, ja: '重量・料金', en: 'Weight & Fee' },
  { num: 4 as StepNumber, ja: 'お預け', en: 'Drop Off' },
];

export const Header: React.FC<HeaderProps> = ({
  screenId,
  language,
  onToggleLanguage,
}) => {
  const currentStep = SCREEN_STEP_MAP[screenId];
  const isAllComplete = screenId === 'SBD-010';

  return (
    <header className="w-full h-[92px] px-10 bg-white/90 border-b border-slate-200/80 flex items-center justify-between shrink-0">
      {/* Left: Title & Suitcase Icon (Unified across all screens) */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 flex items-center justify-center text-[#0b253c]">
          <svg
            viewBox="0 0 36 36"
            className="w-9 h-9 fill-current"
            aria-hidden="true"
          >
            <path d="M13 4a2 2 0 0 0-2 2v3H8a3 3 0 0 0-3 3v17a3 3 0 0 0 3 3h1v2h3v-2h12v2h3v-2h1a3 3 0 0 0 3-3V12a3 3 0 0 0-3-3h-3V6a2 2 0 0 0-2-2H13zm1 3h8v2h-8V7zm-4 5h2v17h-2V12zm14 0h2v17h-2V12z" />
          </svg>
        </div>
        <h1 className="text-[26px] font-bold tracking-tight text-[#0b253c]">
          {language === 'ja' ? '手荷物のお預け' : 'Self Bag Drop'}
        </h1>
      </div>

      {/* Center: Unified 4-Step Progress Bar across all screens */}
      <div className="flex items-center gap-3">
        {STEPS.map((step, idx) => {
          const isCompleted = isAllComplete || step.num < currentStep;
          const isActive = !isAllComplete && step.num === currentStep;

          return (
            <React.Fragment key={step.num}>
              <div className="relative flex items-center gap-2.5 py-2 px-1.5">
                {isCompleted ? (
                  <span className="w-7 h-7 rounded-full bg-[#0b4f6c] text-white flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                ) : (
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[15px] font-bold ${
                      isActive
                        ? 'bg-[#0b3b5b] text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step.num}
                  </span>
                )}
                <span
                  className={`text-[16px] whitespace-nowrap ${
                    isActive
                      ? 'font-bold text-[#0b253c]'
                      : isCompleted
                      ? 'font-medium text-slate-600'
                      : 'font-medium text-slate-400'
                  }`}
                >
                  {language === 'ja' ? step.ja : step.en}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#0b4f6c] rounded-full" />
                )}
              </div>
              {idx < STEPS.length - 1 && (
                <div className="w-7 h-[1.5px] bg-slate-300" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right: Language Switch Button (Unified across all screens) */}
      <button
        type="button"
        onClick={onToggleLanguage}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border-[1.5px] border-slate-600 bg-white hover:bg-slate-50 active:scale-[0.99] transition text-[#0b253c] font-bold text-[17px] cursor-pointer"
      >
        <Globe className="w-5 h-5 text-[#0b253c]" />
        <span>Language / 言語</span>
      </button>
    </header>
  );
};
