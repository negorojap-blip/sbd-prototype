import React from 'react';
import type { Language } from '../../types/sbd';

interface BagPositionWarningModalProps {
  open: boolean;
  language: Language;
  onDismiss: () => void;
}

export const BagPositionWarningModal: React.FC<BagPositionWarningModalProps> = ({
  open,
  language,
  onDismiss,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-6">
      <div className="bg-white rounded-[28px] w-full max-w-[820px] px-14 pt-12 pb-10 shadow-2xl flex flex-col items-center text-center relative animate-in fade-in zoom-in-95 duration-150">
        {/* Warning Header with Yellow Triangle Icon */}
        <div className="flex items-center justify-center gap-5 mb-7">
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
          <h2 className="text-[38px] font-extrabold text-[#0b253c] tracking-tight">
            {language === 'ja'
              ? '手荷物の位置が正しくありません'
              : 'Baggage is not positioned correctly'}
          </h2>
        </div>

        {/* Explanation Text */}
        <p className="text-[25px] font-bold text-[#a6192e] mb-4">
          {language === 'ja'
            ? '手荷物がベルトの中央からずれているか、枠にはみ出しています。'
            : 'Your baggage is off-center or touching the edge of the belt.'}
        </p>
        <p className="text-[22px] font-medium text-slate-700 mb-9 leading-relaxed">
          {language === 'ja' ? (
            <>
              手荷物を<strong>ベルトの中央</strong>に倒して置き直してください。
              <br />
              （正しい位置に置くと、自動で次の画面に進みます）
            </>
          ) : (
            <>
              Please reposition your baggage flat in the{' '}
              <strong>center of the belt</strong>.
              <br />
              (The screen will automatically proceed once placed correctly.)
            </>
          )}
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="min-w-[320px] h-[70px] px-10 rounded-xl bg-[#005a60] hover:bg-[#00484d] active:scale-[0.99] transition text-white font-bold text-[24px] cursor-pointer shadow-sm"
        >
          {language === 'ja' ? '確認（閉じる）' : 'OK (Close)'}
        </button>
      </div>
    </div>
  );
};
