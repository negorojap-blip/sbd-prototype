import React from 'react';
import type { BaggageInfo, Language } from '../types/sbd';

interface Sbd006WeightPriceProps {
  language: Language;
  baggageInfo: BaggageInfo;
}

export const Sbd006WeightPrice: React.FC<Sbd006WeightPriceProps> = ({
  language,
  baggageInfo,
}) => {
  const isExcessFee =
    baggageInfo.extraFeeYen > 0 ||
    baggageInfo.currentWeightKg > baggageInfo.freeAllowanceKg;

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-14 pt-5 pb-2 overflow-hidden">
      {/* Main Title */}
      <h2 className="text-[46px] font-extrabold text-[#0b253c] tracking-tight">
        {language === 'ja'
          ? '重量と料金をご確認ください'
          : 'Confirm weight and charges'}
      </h2>

      {/* Upper Box: Payment Amount (Soft Pink when excess baggage fee applies) */}
      <div
        className={`w-full max-w-[1160px] rounded-xl px-12 py-5 grid grid-cols-2 divide-x items-center transition-colors ${
          isExcessFee
            ? 'bg-[#ffe4e6] border-2 border-[#f43f5e]/40 divide-[#f43f5e]/30'
            : 'bg-[#edf1f4] divide-slate-300'
        }`}
      >
        <div className="flex flex-col items-center pr-8">
          <span
            className={`text-[24px] font-bold mb-1 ${
              isExcessFee ? 'text-[#881337]' : 'text-[#0b253c]'
            }`}
          >
            {language === 'ja' ? '今回のお支払い額' : 'Amount Due'}
          </span>
          <div className="flex items-baseline gap-2 leading-none">
            <span
              className={`text-[86px] font-extrabold tracking-tight ${
                isExcessFee ? 'text-[#9f1239]' : 'text-[#0b253c]'
              }`}
            >
              {baggageInfo.extraFeeYen.toLocaleString()}
            </span>
            <span
              className={`text-[44px] font-extrabold ${
                isExcessFee ? 'text-[#9f1239]' : 'text-[#0b253c]'
              }`}
            >
              {language === 'ja' ? '円' : 'JPY'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center pl-8">
          <span
            className={`text-[32px] font-extrabold ${
              isExcessFee ? 'text-[#9f1239]' : 'text-[#0b253c]'
            }`}
          >
            {!isExcessFee
              ? language === 'ja'
                ? '追加料金はありません'
                : 'No additional charge'
              : language === 'ja'
              ? '超過手荷物料金が発生しています'
              : 'Excess baggage fee applies'}
          </span>
        </div>
      </div>

      {/* Lower Two Columns: Weight & Allowance */}
      <div className="w-full max-w-[1160px] grid grid-cols-2 divide-x divide-slate-300 items-center pt-2 pb-1">
        {/* Left: This Baggage Weight */}
        <div className="flex flex-col items-center pr-8">
          <span className="text-[26px] font-bold text-[#0b253c] self-start pl-14 mb-1">
            {language === 'ja' ? 'この手荷物の重量' : 'Baggage Weight'}
          </span>
          <div className="flex items-baseline gap-2 leading-none">
            <span className="text-[88px] font-extrabold text-[#0b253c] tracking-tight">
              {baggageInfo.currentWeightKg.toFixed(1)}
            </span>
            <span className="text-[48px] font-extrabold text-[#0b253c]">
              kg
            </span>
          </div>
        </div>

        {/* Right: Free Allowance & Totals */}
        <div className="pl-12 flex flex-col justify-center">
          <span className="text-[25px] font-bold text-[#0b253c] mb-1">
            {language === 'ja' ? '無料で預けられる範囲' : 'Free Baggage Allowance'}
          </span>
          <div className="flex items-baseline gap-2 pb-3 border-b border-slate-300">
            <span className="text-[28px] font-bold text-[#0b253c]">
              {language === 'ja' ? '合計' : 'Total up to'}
            </span>
            <span className="text-[48px] font-extrabold text-[#0b253c] leading-none">
              {baggageInfo.freeAllowanceKg.toFixed(1)}
            </span>
            <span className="text-[32px] font-bold text-[#0b253c]">
              {language === 'ja' ? 'kg まで' : 'kg'}
            </span>
          </div>

          <div className="pt-3 space-y-1 text-[22px] text-[#0b253c]">
            <div>
              {language === 'ja' ? '今回を含む合計： ' : 'Total including this bag: '}
              <span className="font-extrabold">
                {baggageInfo.totalWeightKg.toFixed(1)} kg
              </span>
            </div>
            <div>
              {language === 'ja'
                ? 'すでに預けた手荷物： '
                : 'Previously checked bags: '}
              <span className="font-extrabold">
                {baggageInfo.checkedCount} {language === 'ja' ? '個' : 'bag(s)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Divider & Sample Notice */}
      <div className="w-full flex items-center justify-end border-b border-slate-300 pb-1">
        <span className="text-slate-600 text-[16px]">
          {language === 'ja' ? '表示例' : 'Sample Display'}
        </span>
      </div>
    </div>
  );
};
