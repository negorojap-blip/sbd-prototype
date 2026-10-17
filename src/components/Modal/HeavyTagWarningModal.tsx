import React from 'react';
import { AlertTriangle, Tag } from 'lucide-react';
import type { Language } from '../../types/sbd';

interface HeavyTagWarningModalProps {
  open: boolean;
  language: Language;
  onDismiss: () => void;
}

export const HeavyTagWarningModal: React.FC<HeavyTagWarningModalProps> = ({
  open,
  language,
  onDismiss,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-8 animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="heavy-tag-warning-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-[#dc2626] w-full max-w-[780px] p-9 flex flex-col items-center text-center">
        {/* Warning Icon Badge */}
        <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mb-4">
          <AlertTriangle
            className="w-11 h-11 text-[#dc2626] stroke-[2.2]"
            aria-hidden="true"
          />
        </div>

        {/* Title */}
        <h2
          id="heavy-tag-warning-title"
          className="text-[31px] font-extrabold text-[#b91c1c] leading-snug"
        >
          {language === 'ja'
            ? 'ヘビータグが確認できませんでした'
            : 'Heavy Tag Not Detected'}
        </h2>
        <p className="text-[19px] font-bold text-slate-600 mt-1">
          {language === 'ja'
            ? 'Heavy Tag Not Detected — Baggage Returned'
            : 'Your baggage has been returned because the Heavy Tag is not attached'}
        </p>

        {/* Visual Guide Diagram: Returned Baggage -> Attach HEAVY Tag */}
        <div className="my-6 w-full max-w-[580px] bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 flex items-center justify-around gap-4">
          {/* Returned Bag without Heavy Tag */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-36 h-24 rounded-xl bg-red-50 border-2 border-red-300 flex items-center justify-center relative">
              <svg viewBox="0 0 130 84" className="w-32 h-20">
                {/* Return arrow */}
                <path
                  d="M 108,42 L 74,42 M 84,32 L 72,42 L 84,52"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Bag */}
                <rect
                  x="16"
                  y="18"
                  width="46"
                  height="50"
                  rx="6"
                  fill="#ea580c"
                  stroke="#9a3412"
                  strokeWidth="2"
                />
                <path
                  d="M 30,18 L 30,11 Q 39,8 48,11 L 48,18"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3"
                />
                <circle cx="58" cy="20" r="10" fill="#dc2626" />
                <text
                  x="58"
                  y="24"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="900"
                >
                  !
                </text>
              </svg>
            </div>
            <span className="text-sm font-extrabold text-red-700">
              {language === 'ja'
                ? '✕ タグ未取付（手荷物を返却）'
                : '✕ Tag Missing (Returned)'}
            </span>
          </div>

          <div className="text-2xl font-black text-slate-400">➡</div>

          {/* Bag with Attached HEAVY Tag */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-36 h-24 rounded-xl bg-amber-50 border-2 border-amber-400 flex items-center justify-center relative">
              <svg viewBox="0 0 130 84" className="w-32 h-20">
                {/* Bag */}
                <rect
                  x="26"
                  y="20"
                  width="48"
                  height="50"
                  rx="6"
                  fill="#ea580c"
                  stroke="#9a3412"
                  strokeWidth="2"
                />
                <path
                  d="M 40,20 L 40,12 Q 50,9 60,12 L 60,20"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3"
                />
                {/* Yellow HEAVY Tag attached */}
                <g transform="translate(58, 10) rotate(-10)">
                  <rect
                    x="0"
                    y="0"
                    width="34"
                    height="18"
                    rx="2"
                    fill="#facc15"
                    stroke="#854d0e"
                    strokeWidth="1.5"
                  />
                  <text
                    x="17"
                    y="12.5"
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="8.5"
                    fontWeight="900"
                  >
                    HEAVY
                  </text>
                </g>
              </svg>
            </div>
            <span className="text-sm font-extrabold text-teal-800 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {language === 'ja'
                ? '〇 ヘビータグを取り付ける'
                : '〇 Attach Heavy Tag'}
            </span>
          </div>
        </div>

        {/* Instruction Text */}
        <p className="text-[20px] font-bold text-[#0b253c] leading-relaxed max-w-[650px]">
          {language === 'ja'
            ? '手荷物にヘビータグが取り付けられていないため、手荷物が手前に戻されました。発行された「HEAVY」タグを手荷物に取り付けてから、もう一度「タグを付けました」を押してください。'
            : 'Your baggage was returned because the HEAVY tag was not attached. Please attach the issued HEAVY tag to your baggage and press "Tag Attached" again.'}
        </p>

        {/* Action Button */}
        <div className="mt-7 w-full flex justify-center">
          <button
            type="button"
            onClick={onDismiss}
            className="min-w-[280px] py-4 px-10 rounded-full bg-[#005a60] hover:bg-[#00464b] active:scale-[0.99] text-white shadow-lg flex flex-col items-center justify-center transition cursor-pointer"
          >
            <span className="text-[23px] font-extrabold leading-tight">
              {language === 'ja' ? '確認（閉じる）' : 'OK'}
            </span>
            <span className="text-[14px] font-medium text-teal-100 mt-0.5">
              {language === 'ja' ? 'OK' : 'Dismiss'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
