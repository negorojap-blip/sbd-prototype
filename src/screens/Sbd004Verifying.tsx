import React from 'react';
import { Check } from 'lucide-react';
import type { Language } from '../types/sbd';

interface Sbd004VerifyingProps {
  language: Language;
  onSimulateVerifyComplete: () => void;
}

export const Sbd004Verifying: React.FC<Sbd004VerifyingProps> = ({
  language,
  onSimulateVerifyComplete,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between px-14 pt-8 pb-6 overflow-hidden">
      {/* Top-Left Title */}
      <div>
        <h2 className="text-[44px] font-extrabold text-[#0b253c] tracking-tight">
          {language === 'ja'
            ? '搭乗券を読み取りました'
            : 'Boarding pass scanned'}
        </h2>
      </div>

      {/* Center Verification Status */}
      <div
        onClick={onSimulateVerifyComplete}
        title={
          language === 'ja'
            ? 'クリックで「確認完了」へ進む'
            : 'Click to complete verification'
        }
        className="flex flex-col items-center justify-center my-auto cursor-pointer"
      >
        <div className="w-[82px] h-[82px] rounded-full bg-[#136370] text-white flex items-center justify-center mb-8 shadow-sm">
          <Check className="w-12 h-12 stroke-[3.5]" />
        </div>

        <h3 className="text-[40px] font-extrabold text-[#0b253c] mb-8 tracking-tight">
          {language === 'ja'
            ? '搭乗券と手荷物の情報を確認しています'
            : 'Verifying your boarding pass and baggage information'}
        </h3>

        {/* Three Loading Dots */}
        <div className="flex items-center gap-5 mb-8">
          <span className="w-5 h-5 rounded-full bg-[#0b253c] dot-1" />
          <span className="w-5 h-5 rounded-full bg-[#0b253c] dot-2" />
          <span className="w-5 h-5 rounded-full bg-[#0b253c] dot-3" />
        </div>

        <p className="text-[26px] font-medium text-slate-700">
          {language === 'ja' ? 'そのままお待ちください。' : 'Please wait a moment.'}
        </p>
      </div>

      <div />
    </div>
  );
};
