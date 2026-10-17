import React from 'react';
import type { Language } from '../../types/sbd';

interface TrayRequiredModalProps {
  open: boolean;
  language: Language;
  onDismiss: () => void;
}

export const TrayRequiredModal: React.FC<TrayRequiredModalProps> = ({
  open,
  language,
  onDismiss,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-6">
      <div className="bg-white rounded-[28px] w-full max-w-[860px] px-14 pt-10 pb-9 shadow-2xl flex flex-col items-center text-center relative animate-in fade-in zoom-in-95 duration-150">
        {/* Warning Header */}
        <div className="flex items-center justify-center gap-5 mb-5">
          <svg
            viewBox="0 0 64 58"
            className="w-15 h-14 shrink-0"
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
              ? '手荷物を通い箱に入れてください'
              : 'Please place your bag in a tray'}
          </h2>
        </div>

        {/* Visual Illustration: Knapsack going into a Tray (通い箱) */}
        <div className="w-full max-w-[540px] bg-[#f1f5f9] rounded-2xl border border-slate-200 py-4 px-8 mb-5 flex items-center justify-center">
          <svg
            viewBox="0 0 360 150"
            className="w-[340px] h-[140px]"
            aria-hidden="true"
          >
            {/* Left: Knapsack */}
            <g transform="translate(30, 18)">
              {/* Shoulder straps */}
              <path
                d="M 18,22 Q 4,48 14,82"
                fill="none"
                stroke="#334155"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 74,22 Q 88,48 78,82"
                fill="none"
                stroke="#334155"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Top Handle Loop */}
              <path
                d="M 34,14 Q 46,-2 58,14"
                fill="none"
                stroke="#1e293b"
                strokeWidth="5"
              />
              {/* Knapsack Body */}
              <rect
                x="14"
                y="14"
                width="64"
                height="78"
                rx="18"
                fill="#2563eb"
                stroke="#1e40af"
                strokeWidth="2.5"
              />
              {/* Top Flap */}
              <path
                d="M 16,28 Q 46,44 76,28 L 74,18 Q 46,10 18,18 Z"
                fill="#1d4ed8"
                stroke="#1e3a8a"
                strokeWidth="2"
              />
              {/* Front Pocket */}
              <rect
                x="24"
                y="48"
                width="44"
                height="32"
                rx="8"
                fill="#3b82f6"
                stroke="#1e40af"
                strokeWidth="2"
              />
              <text
                x="46"
                y="114"
                textAnchor="middle"
                fill="#0b253c"
                fontSize="13"
                fontWeight="bold"
              >
                ナップサック等
              </text>
            </g>

            {/* Center Arrow */}
            <g transform="translate(142, 54)">
              <path
                d="M 0,10 L 32,10 L 32,0 L 52,16 L 32,32 L 32,22 L 0,22 Z"
                fill="#005a60"
              />
            </g>

            {/* Right: Knapsack inside Tray (通い箱) */}
            <g transform="translate(212, 20)">
              {/* Knapsack inside tray */}
              <rect
                x="30"
                y="8"
                width="62"
                height="58"
                rx="14"
                fill="#2563eb"
                stroke="#1e40af"
                strokeWidth="2"
              />
              <rect
                x="40"
                y="26"
                width="42"
                height="24"
                rx="6"
                fill="#3b82f6"
                stroke="#1e40af"
                strokeWidth="1.5"
              />
              {/* White Tag on Knapsack */}
              <rect
                x="74"
                y="4"
                width="12"
                height="24"
                rx="1.5"
                fill="#ffffff"
                stroke="#475569"
                strokeWidth="1"
                transform="rotate(12 74 4)"
              />

              {/* Blue-Gray Plastic Tray (通い箱) */}
              <polygon
                points="6,42 118,42 108,86 16,86"
                fill="#0284c7"
                stroke="#0369a1"
                strokeWidth="2.5"
              />
              <rect
                x="2"
                y="37"
                width="120"
                height="8"
                rx="3"
                fill="#0369a1"
              />
              <text
                x="62"
                y="70"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="13"
                fontWeight="bold"
              >
                通い箱（トレイ）
              </text>
              <text
                x="62"
                y="112"
                textAnchor="middle"
                fill="#0b253c"
                fontSize="13"
                fontWeight="bold"
              >
                通い箱に入れて設置
              </text>
            </g>
          </svg>
        </div>

        {/* Explanation Text */}
        <p className="text-[23px] font-bold text-[#0b253c] mb-2">
          {language === 'ja'
            ? 'ナップサック・リュック等の柔らかい手荷物や紐のある手荷物は、そのままでは搬送できません。'
            : 'Backpacks and soft bags with straps cannot be placed directly on the belt.'}
        </p>
        <p className="text-[20px] font-medium text-slate-700 mb-7">
          {language === 'ja'
            ? '備え付けの「通い箱（トレイ）」を取り、手荷物を中に入れてからベルトの中央に置いてください。'
            : 'Please take a baggage tray, place your bag inside it, and set it in the center of the belt.'}
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="min-w-[320px] h-[66px] px-10 rounded-xl bg-[#005a60] hover:bg-[#00484d] active:scale-[0.99] transition text-white font-bold text-[23px] cursor-pointer shadow-sm"
        >
          {language === 'ja' ? '確認（閉じる）' : 'OK (Close)'}
        </button>
      </div>
    </div>
  );
};
