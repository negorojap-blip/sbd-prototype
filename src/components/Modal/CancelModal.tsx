import React from 'react';
import type { Language } from '../../types/sbd';

interface CancelModalProps {
  open: boolean;
  language: Language;
  onContinue: () => void;
  onConfirmCancel: () => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  open,
  language,
  onContinue,
  onConfirmCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-6">
      <div className="bg-white rounded-[28px] w-full max-w-[820px] px-14 pt-12 pb-8 shadow-2xl flex flex-col items-center text-center relative animate-in fade-in zoom-in-95 duration-150">
        {/* Title Row with Yellow Warning Triangle */}
        <div className="flex items-center justify-center gap-5 mb-8">
          <svg
            viewBox="0 0 64 58"
            className="w-16 h-15 shrink-0"
            aria-hidden="true"
          >
            <path
              d="M32 4L4 52a3 3 0 0 0 2.6 4.5h50.8A3 3 0 0 0 60 52L32 4z"
              fill="#facc15"
              stroke="#0b253c"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <rect x="29.5" y="19" width="5" height="17" rx="2.5" fill="#0b253c" />
            <circle cx="32" cy="44.5" r="3" fill="#0b253c" />
          </svg>
          <h2 className="text-[40px] font-extrabold text-[#0b253c] tracking-tight">
            {language === 'ja'
              ? '手続きを中止しますか？'
              : 'Cancel the baggage drop?'}
          </h2>
        </div>

        {/* Body Text */}
        <p className="text-[25px] font-medium text-[#0b253c] mb-4">
          {language === 'ja'
            ? '手荷物のお預けは完了していません。'
            : 'Your baggage drop is not yet complete.'}
        </p>
        <p className="text-[22px] font-normal text-slate-700 mb-11">
          {language === 'ja'
            ? '中止した後は、案内に従って手荷物をお取りください。'
            : 'After canceling, please remove your baggage from the belt.'}
        </p>

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-center gap-8 mb-4">
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 h-[76px] rounded-xl bg-[#005a60] hover:bg-[#00484d] active:scale-[0.99] transition text-white font-bold text-[26px] cursor-pointer shadow-sm"
          >
            {language === 'ja' ? '手続きを続ける' : 'Continue'}
          </button>
          <button
            type="button"
            onClick={onConfirmCancel}
            className="flex-1 h-[76px] rounded-xl bg-[#a6192e] hover:bg-[#8e1426] active:scale-[0.99] transition text-white font-bold text-[26px] cursor-pointer shadow-sm"
          >
            {language === 'ja' ? '中止する' : 'Cancel Process'}
          </button>
        </div>

        {/* Screen ID SBD-118 */}
        <div className="w-full flex justify-end mt-1">
          <span className="text-slate-500 text-[15px] font-semibold">
            SBD-118
          </span>
        </div>
      </div>
    </div>
  );
};
