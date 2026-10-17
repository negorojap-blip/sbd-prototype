import React from 'react';
import { Headphones, X, ChevronRight } from 'lucide-react';
import type { Language, ScreenId } from '../types/sbd';

interface FooterProps {
  screenId: ScreenId;
  language: Language;
  onCallStaff: () => void;
  onOpenCancel?: () => void;
  onPrimaryAction?: () => void;
  primaryLabelJa?: string;
  primaryLabelEn?: string;
  secondaryAction?: () => void;
  secondaryLabelJa?: string;
  secondaryLabelEn?: string;
  autoAdvanceNoteJa?: string;
  autoAdvanceNoteEn?: string;
}

export const Footer: React.FC<FooterProps> = ({
  screenId,
  language,
  onCallStaff,
  onOpenCancel,
  onPrimaryAction,
  primaryLabelJa,
  primaryLabelEn,
  secondaryAction,
  secondaryLabelJa,
  secondaryLabelEn,
  autoAdvanceNoteJa,
  autoAdvanceNoteEn,
}) => {
  return (
    <footer className="w-full px-10 pb-6 pt-2 flex flex-col justify-end shrink-0">
      <div className="w-full flex items-center justify-between gap-6">
        {/* Left: Call Staff Button (Unified across all screens) */}
        <button
          type="button"
          onClick={onCallStaff}
          className="h-[68px] min-w-[230px] px-7 rounded-xl border-[1.5px] border-slate-500 bg-white hover:bg-slate-50 active:scale-[0.99] transition flex items-center justify-center gap-3.5 text-[#0b253c] font-bold text-[22px] cursor-pointer shadow-xs"
        >
          <Headphones className="w-7 h-7 stroke-[2.2]" />
          <span>{language === 'ja' ? '係員を呼ぶ' : 'Call Staff'}</span>
        </button>

        {/* Center: Cancel Button OR Secondary Choice Button (e.g., SBD-002 "入っています") */}
        <div className="flex-1 flex items-center justify-center">
          {onOpenCancel && (
            <button
              type="button"
              onClick={onOpenCancel}
              className="h-[68px] min-w-[310px] px-8 rounded-xl border-[1.5px] border-[#b91c1c] bg-white hover:bg-red-50/50 active:scale-[0.99] transition flex items-center justify-center gap-3 text-[#991b1b] font-bold text-[22px] cursor-pointer shadow-xs"
            >
              <X className="w-7 h-7 stroke-[2.6] text-[#b91c1c]" />
              <span>{language === 'ja' ? '手続きを中止' : 'Cancel Process'}</span>
            </button>
          )}

          {secondaryAction && secondaryLabelJa && (
            <button
              type="button"
              onClick={secondaryAction}
              className="h-[68px] min-w-[340px] px-8 rounded-xl border-[1.5px] border-slate-600 bg-white hover:bg-slate-50 active:scale-[0.99] transition flex items-center justify-center text-[#0b253c] font-bold text-[23px] cursor-pointer shadow-xs"
            >
              <span>{language === 'ja' ? secondaryLabelJa : secondaryLabelEn}</span>
            </button>
          )}
        </div>

        {/* Right: Primary Next Button OR Auto-advance Text */}
        <div className="flex items-center justify-end min-w-[340px]">
          {onPrimaryAction && primaryLabelJa ? (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="h-[68px] min-w-[400px] px-9 rounded-xl bg-[#005a60] hover:bg-[#00484d] active:scale-[0.99] transition text-white font-bold text-[24px] flex items-center justify-between cursor-pointer shadow-sm"
            >
              <span className="flex-1 text-center">
                {language === 'ja' ? primaryLabelJa : primaryLabelEn}
              </span>
              <ChevronRight className="w-7 h-7 stroke-[2.5]" />
            </button>
          ) : autoAdvanceNoteJa ? (
            <div className="flex items-center gap-6 text-slate-600 text-[18px] font-medium">
              <span>
                {language === 'ja' ? autoAdvanceNoteJa : autoAdvanceNoteEn}
              </span>
              <span className="text-slate-500 text-[15px] font-semibold">
                {screenId}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Screen ID at bottom right when primary button is present */}
      {onPrimaryAction && primaryLabelJa && (
        <div className="w-full flex justify-end mt-1.5 pr-1">
          <span className="text-slate-400 text-[13px] font-semibold tracking-wide">
            {screenId}
          </span>
        </div>
      )}
      {!onPrimaryAction && !autoAdvanceNoteJa && (
        <div className="w-full flex justify-end -mt-5 pr-1">
          <span className="text-slate-500 text-[15px] font-semibold tracking-wide">
            {screenId}
          </span>
        </div>
      )}
    </footer>
  );
};
