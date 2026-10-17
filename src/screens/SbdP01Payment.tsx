import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { BaggageInfo, Language } from '../types/sbd';

interface SbdP01PaymentProps {
  language: Language;
  baggageInfo: BaggageInfo;
  paymentCompleted?: boolean;
  onSimulatePaymentComplete?: () => void;
}

export const SbdP01Payment: React.FC<SbdP01PaymentProps> = ({
  language,
  baggageInfo,
  paymentCompleted = false,
  onSimulatePaymentComplete,
}) => {
  const feeAmount =
    baggageInfo.extraFeeYen > 0 ? baggageInfo.extraFeeYen : 3000;

  return (
    <div className="flex-1 px-14 pt-5 pb-2 flex flex-col justify-between overflow-hidden">
      {/* 1. Main Heading & Fee Summary Banner */}
      <div className="w-full max-w-[1160px] mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-center">
          {paymentCompleted ? (
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#128387] text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7 stroke-[2.6]" />
              </div>
              <h2 className="text-[46px] font-extrabold text-[#0e7479] tracking-tight leading-tight">
                {language === 'ja'
                  ? 'お支払いが完了しました'
                  : 'Payment Completed'}
              </h2>
            </div>
          ) : (
            <h2 className="text-[46px] font-extrabold text-[#0b253c] tracking-tight leading-tight">
              {language === 'ja'
                ? 'QRコードを読み取ってお支払いください'
                : 'Scan the QR code to complete payment'}
            </h2>
          )}
        </div>

        {/* 2. Fee Summary Banner (Soft Pink while awaiting payment, Mint/Teal when paid) */}
        <div
          className={`w-full h-[88px] rounded-xl px-12 flex items-center justify-between transition-colors duration-300 ${
            paymentCompleted
              ? 'bg-[#dcf2f0] border-2 border-[#128387]'
              : 'bg-[#ffe4e6] border-2 border-[#f43f5e]/40'
          }`}
        >
          <div className="flex-1 flex items-center justify-center gap-4">
            <span
              className={`text-[31px] font-extrabold tracking-tight ${
                paymentCompleted ? 'text-[#0b253c]' : 'text-[#9f1239]'
              }`}
            >
              {language === 'ja' ? '超過手荷物料金' : 'Excess Baggage Fee'}
            </span>
          </div>

          <div
            className={`w-[1.5px] h-11 mx-6 ${
              paymentCompleted ? 'bg-slate-400/70' : 'bg-[#f43f5e]/40'
            }`}
          />

          <div className="flex-1 flex items-center justify-center gap-6">
            <span
              className={`text-[22px] font-extrabold ${
                paymentCompleted ? 'text-[#0b253c]' : 'text-[#881337]'
              }`}
            >
              {language === 'ja' ? 'お支払い金額' : 'Total Amount'}
            </span>
            <div
              className={`flex items-baseline gap-1 ${
                paymentCompleted ? 'text-[#0b253c]' : 'text-[#9f1239]'
              }`}
            >
              <span className="text-[54px] font-extrabold tracking-tight leading-none">
                {feeAmount.toLocaleString()}
              </span>
              <span className="text-[32px] font-extrabold leading-none">
                {language === 'ja' ? '円' : 'JPY'}
              </span>
            </div>
            {paymentCompleted && (
              <span className="px-4 py-1.5 rounded-full bg-[#128387] text-white text-[18px] font-extrabold flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-5 h-5 stroke-[2.8]" />
                <span>{language === 'ja' ? '支払済' : 'PAID'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Center Content: QR Code (Left) & 3 Steps (Right) */}
      <div className="flex items-center justify-center gap-16 my-1">
        {/* Left: QR Code Box (Clickable for simulation convenience) */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            disabled={paymentCompleted}
            onClick={onSimulatePaymentComplete}
            title={
              language === 'ja'
                ? 'クリックして決済完了をシミュレート（シミュレーター側からも操作可能）'
                : 'Click to simulate payment completion'
            }
            className={`relative w-[216px] h-[216px] bg-white border-[2px] p-3.5 flex items-center justify-center shadow-xs transition overflow-hidden ${
              paymentCompleted
                ? 'border-[#128387] cursor-default'
                : 'border-slate-400 hover:border-[#0e7479] active:scale-[0.99] cursor-pointer group'
            }`}
          >
            {/* Realistic QR Code SVG */}
            <svg
              viewBox="0 0 29 29"
              className={`w-full h-full shape-rendering-crispEdges transition-opacity duration-300 ${
                paymentCompleted ? 'opacity-20' : 'opacity-100'
              }`}
              aria-label="QR Code"
            >
              <rect width="29" height="29" fill="#ffffff" />
              {/* Top-Left Finder Pattern */}
              <path
                d="M1,1 h7 v7 h-7 z M2,2 v5 h5 v-5 z M3,3 h3 v3 h-3 z"
                fill="#000000"
                fillRule="evenodd"
              />
              {/* Top-Right Finder Pattern */}
              <path
                d="M21,1 h7 v7 h-7 z M22,2 v5 h5 v-5 z M23,3 h3 v3 h-3 z"
                fill="#000000"
                fillRule="evenodd"
              />
              {/* Bottom-Left Finder Pattern */}
              <path
                d="M1,21 h7 v7 h-7 z M2,22 v5 h5 v-5 z M3,23 h3 v3 h-3 z"
                fill="#000000"
                fillRule="evenodd"
              />
              {/* Alignment Pattern */}
              <path
                d="M20,20 h5 v5 h-5 z M21,21 v3 h3 v-3 z M22,22 h1 v1 h-1 z"
                fill="#000000"
                fillRule="evenodd"
              />
              {/* QR Data Modules */}
              <g fill="#000000">
                <rect x="10" y="1" width="2" height="1" />
                <rect x="13" y="1" width="1" height="2" />
                <rect x="15" y="1" width="3" height="1" />
                <rect x="19" y="2" width="1" height="2" />
                <rect x="9" y="3" width="2" height="2" />
                <rect x="12" y="4" width="3" height="1" />
                <rect x="16" y="3" width="2" height="2" />
                <rect x="10" y="6" width="1" height="2" />
                <rect x="12" y="6" width="2" height="1" />
                <rect x="15" y="6" width="1" height="3" />
                <rect x="17" y="6" width="2" height="1" />
                <rect x="1" y="9" width="2" height="1" />
                <rect x="4" y="9" width="2" height="2" />
                <rect x="7" y="9" width="1" height="1" />
                <rect x="9" y="9" width="3" height="2" />
                <rect x="13" y="9" width="1" height="3" />
                <rect x="17" y="9" width="2" height="2" />
                <rect x="20" y="9" width="2" height="1" />
                <rect x="23" y="9" width="3" height="2" />
                <rect x="27" y="9" width="1" height="2" />
                <rect x="2" y="11" width="1" height="2" />
                <rect x="6" y="11" width="2" height="2" />
                <rect x="10" y="12" width="2" height="2" />
                <rect x="14" y="12" width="3" height="1" />
                <rect x="18" y="12" width="2" height="2" />
                <rect x="21" y="11" width="1" height="3" />
                <rect x="25" y="12" width="2" height="2" />
                <rect x="1" y="14" width="3" height="2" />
                <rect x="5" y="14" width="2" height="1" />
                <rect x="8" y="13" width="2" height="3" />
                <rect x="11" y="15" width="3" height="2" />
                <rect x="15" y="14" width="2" height="2" />
                <rect x="19" y="15" width="2" height="2" />
                <rect x="23" y="14" width="2" height="2" />
                <rect x="26" y="15" width="2" height="1" />
                <rect x="2" y="17" width="2" height="2" />
                <rect x="5" y="16" width="2" height="3" />
                <rect x="9" y="17" width="1" height="2" />
                <rect x="13" y="18" width="2" height="2" />
                <rect x="16" y="17" width="3" height="2" />
                <rect x="21" y="17" width="2" height="2" />
                <rect x="24" y="17" width="3" height="2" />
                <rect x="9" y="20" width="2" height="2" />
                <rect x="12" y="20" width="2" height="1" />
                <rect x="15" y="20" width="2" height="3" />
                <rect x="18" y="21" width="1" height="2" />
                <rect x="26" y="20" width="2" height="2" />
                <rect x="10" y="23" width="3" height="2" />
                <rect x="14" y="24" width="1" height="2" />
                <rect x="17" y="24" width="2" height="2" />
                <rect x="26" y="23" width="1" height="3" />
                <rect x="9" y="26" width="2" height="2" />
                <rect x="12" y="26" width="2" height="2" />
                <rect x="15" y="27" width="3" height="1" />
                <rect x="19" y="26" width="2" height="2" />
                <rect x="23" y="26" width="3" height="2" />
              </g>
            </svg>

            {/* Payment Completed Overlay on QR Code */}
            {paymentCompleted && (
              <div className="absolute inset-0 bg-[#f0fdfa]/90 flex flex-col items-center justify-center gap-2 p-2">
                <div className="w-20 h-20 rounded-full bg-[#128387] text-white flex items-center justify-center shadow-md">
                  <svg viewBox="0 0 24 24" className="w-12 h-12">
                    <path
                      d="M5 13l4 4L19 7"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[22px] font-extrabold text-[#0e7479]">
                  {language === 'ja' ? '決済完了' : 'Paid'}
                </span>
              </div>
            )}
          </button>
          <span className="mt-1.5 text-[16px] font-bold text-slate-600">
            {language === 'ja' ? '画面検討用' : 'For Screen Review'}
          </span>
        </div>

        {/* Right: 3 Numbered Instructions with Smartphone Icons */}
        <div className="flex flex-col gap-5">
          {/* Step 1 */}
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[#128387] text-white font-extrabold text-[26px] flex items-center justify-center shrink-0">
              {paymentCompleted ? '✓' : '1'}
            </div>
            <div className="w-14 h-16 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 56 64" className="w-14 h-16">
                <rect
                  x="8"
                  y="4"
                  width="30"
                  height="54"
                  rx="5"
                  fill="#ffffff"
                  stroke="#0b253c"
                  strokeWidth="3.2"
                />
                <line
                  x1="19"
                  y1="9"
                  x2="27"
                  y2="9"
                  stroke="#0b253c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Signal rays */}
                <line
                  x1="43"
                  y1="14"
                  x2="51"
                  y2="9"
                  stroke="#128387"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <line
                  x1="44"
                  y1="23"
                  x2="53"
                  y2="23"
                  stroke="#128387"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <line
                  x1="43"
                  y1="32"
                  x2="51"
                  y2="37"
                  stroke="#128387"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-[26px] font-extrabold text-[#0b253c]">
              {language === 'ja'
                ? '決済アプリを開く'
                : 'Open your payment app'}
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[#128387] text-white font-extrabold text-[26px] flex items-center justify-center shrink-0">
              {paymentCompleted ? '✓' : '2'}
            </div>
            <div className="w-14 h-16 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 56 64" className="w-14 h-16">
                <rect
                  x="8"
                  y="4"
                  width="32"
                  height="56"
                  rx="5"
                  fill="#ffffff"
                  stroke="#0b253c"
                  strokeWidth="3.2"
                />
                <line
                  x1="20"
                  y1="9"
                  x2="28"
                  y2="9"
                  stroke="#0b253c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Mini QR inside phone */}
                <rect
                  x="15"
                  y="21"
                  width="7"
                  height="7"
                  fill="none"
                  stroke="#0b253c"
                  strokeWidth="2.2"
                />
                <rect
                  x="26"
                  y="21"
                  width="7"
                  height="7"
                  fill="none"
                  stroke="#0b253c"
                  strokeWidth="2.2"
                />
                <rect
                  x="15"
                  y="32"
                  width="7"
                  height="7"
                  fill="none"
                  stroke="#0b253c"
                  strokeWidth="2.2"
                />
                <rect x="26" y="32" width="3.5" height="3.5" fill="#0b253c" />
                <rect x="30" y="36" width="3.5" height="3.5" fill="#0b253c" />
              </svg>
            </div>
            <span className="text-[26px] font-extrabold text-[#0b253c]">
              {language === 'ja'
                ? '左のQRコードを読み取る'
                : 'Scan the QR code on the left'}
            </span>
          </div>

          {/* Step 3 */}
          <div
            className={`flex items-center gap-5 px-3 py-1 -mx-3 rounded-xl transition-colors ${
              paymentCompleted ? 'bg-[#dcf2f0]' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#128387] text-white font-extrabold text-[26px] flex items-center justify-center shrink-0">
              {paymentCompleted ? '✓' : '3'}
            </div>
            <div className="w-14 h-16 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 56 64" className="w-14 h-16">
                <rect
                  x="8"
                  y="4"
                  width="32"
                  height="56"
                  rx="5"
                  fill="#ffffff"
                  stroke="#0b253c"
                  strokeWidth="3.2"
                />
                <line
                  x1="20"
                  y1="9"
                  x2="28"
                  y2="9"
                  stroke="#0b253c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="24" cy="33" r="9.5" fill="#128387" />
                <path
                  d="M 19.5,33 L 22.8,36.5 L 29,29.5"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[26px] font-extrabold text-[#0b253c]">
              {language === 'ja'
                ? paymentCompleted
                  ? 'お支払いが完了しました！'
                  : '金額を確認して支払う'
                : paymentCompleted
                ? 'Payment completed!'
                : 'Confirm the amount and pay'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Auto-Advance Pill & Payment Service Note */}
      <div className="w-full flex flex-col items-center gap-2">
        <div
          className={`w-full max-w-[760px] h-[54px] rounded-xl flex items-center justify-center gap-3 px-8 transition-colors duration-300 ${
            paymentCompleted
              ? 'bg-[#128387] text-white shadow-sm'
              : 'bg-[#dcf2f0] text-[#0e7479]'
          }`}
        >
          {paymentCompleted && (
            <CheckCircle2 className="w-6 h-6 text-white stroke-[2.8]" />
          )}
          <span className="text-[23px] font-extrabold tracking-tight">
            {language === 'ja'
              ? paymentCompleted
                ? 'お支払いが確認できました。次の画面へ切り替わります...'
                : 'お支払い後、この画面は自動で切り替わります'
              : paymentCompleted
              ? 'Payment verified. Proceeding to the next screen...'
              : 'This screen will automatically advance after payment'}
          </span>
        </div>
        <p className="text-[17px] font-bold text-slate-600">
          {language === 'ja'
            ? 'ご利用可能な決済サービス：採用サービス決定後に表示'
            : 'Supported payment services: To be displayed once finalized'}
        </p>
      </div>
    </div>
  );
};
