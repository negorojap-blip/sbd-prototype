import React from 'react';
import type { Language } from '../types/sbd';

interface Sbd009ConveyingProps {
  language: Language;
  onSimulateConveyComplete: () => void;
}

export const Sbd009Conveying: React.FC<Sbd009ConveyingProps> = ({
  language,
  onSimulateConveyComplete,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between px-20 pt-5 pb-1 overflow-hidden">
      {/* Left-aligned Dual Heading */}
      <div>
        <h2 className="text-[46px] font-extrabold text-[#0b253c] tracking-tight leading-snug">
          {language === 'ja'
            ? '手荷物を搬送しています'
            : 'Transferring your baggage'}
        </h2>
        <p className="text-[46px] font-extrabold text-[#0b253c] tracking-tight leading-snug">
          {language === 'ja'
            ? '手荷物やベルトに触れないでください'
            : 'Please do not touch the baggage or belt'}
        </p>
      </div>

      {/* Center Conveying Illustration */}
      <div
        onClick={onSimulateConveyComplete}
        title={
          language === 'ja'
            ? 'クリックで「搬送完了」へ進む'
            : 'Click to complete conveying'
        }
        className="flex flex-col items-center justify-center my-auto cursor-pointer"
      >
        <img
          src="/assets/sbd009-convey.png"
          alt="Baggage moving on conveyor belt"
          className="max-h-[305px] w-auto object-contain"
        />

        {/* Three Loading Dots */}
        <div className="flex items-center gap-4 mt-4 mb-3">
          <span className="w-5 h-5 rounded-full bg-[#0b253c] dot-1" />
          <span className="w-5 h-5 rounded-full bg-[#0b253c] dot-2" />
          <span className="w-5 h-5 rounded-full bg-[#0b253c] dot-3" />
        </div>

        <p className="text-[24px] font-medium text-[#0b253c]">
          {language === 'ja'
            ? '完了画面が出るまでお待ちください'
            : 'Please wait until the completion screen appears'}
        </p>
      </div>
    </div>
  );
};
