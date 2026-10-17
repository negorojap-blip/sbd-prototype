import React from 'react';
import type { Language } from '../types/sbd';

interface Sbd007HeavyTagProps {
  language: Language;
}

export const Sbd007HeavyTag: React.FC<Sbd007HeavyTagProps> = ({ language }) => {
  return (
    <div className="flex-1 flex flex-col justify-between px-16 pt-5 pb-2 overflow-hidden">
      {/* Left-aligned Title & Subtitle */}
      <div>
        <h2 className="text-[46px] font-extrabold text-[#0b253c] tracking-tight leading-tight">
          {language === 'ja'
            ? '発行されたタグを手荷物に付けてください'
            : 'Please attach the printed HEAVY tag to your baggage'}
        </h2>
        <p className="text-[27px] font-normal text-[#0b253c] mt-1.5">
          {language === 'ja'
            ? '重い手荷物であることを示すタグです。'
            : 'This tag indicates that the baggage is heavy.'}
        </p>
      </div>

      {/* 2 Steps Grid */}
      <div className="w-full grid grid-cols-2 gap-12 items-start my-auto pt-2">
        {/* Step 1: Take Tag */}
        <div className="flex flex-col">
          <div className="flex items-center gap-4 mb-3">
            <span className="w-14 h-14 rounded-full bg-[#dce3e8] text-[#0b253c] font-extrabold text-[32px] flex items-center justify-center">
              1
            </span>
            <span className="text-[31px] font-extrabold text-[#0b253c]">
              {language === 'ja' ? 'タグを取る' : 'Take the tag'}
            </span>
          </div>
          <div className="h-[245px] flex items-center justify-center">
            <img
              src="/assets/sbd007-take-tag.png"
              alt="Take HEAVY tag from printer"
              className="max-h-[240px] w-auto object-contain"
            />
          </div>
          <p className="mt-2 text-center text-[22px] text-slate-700 font-normal">
            {language === 'ja'
              ? '発行口からタグをお取りください。'
              : 'Take the tag from the printer slot.'}
          </p>
        </div>

        {/* Step 2: Attach Tag */}
        <div className="flex flex-col">
          <div className="flex items-center gap-4 mb-3">
            <span className="w-14 h-14 rounded-full bg-[#dce3e8] text-[#0b253c] font-extrabold text-[32px] flex items-center justify-center">
              2
            </span>
            <span className="text-[31px] font-extrabold text-[#0b253c]">
              {language === 'ja' ? 'タグを付ける' : 'Attach the tag'}
            </span>
          </div>
          <div className="h-[245px] flex items-center justify-center">
            <img
              src="/assets/sbd007-attach-tag.png"
              alt="Attach HEAVY tag to suitcase"
              className="max-h-[240px] w-auto object-contain"
            />
          </div>
          <p className="mt-2 text-center text-[22px] text-slate-700 font-normal">
            {language === 'ja'
              ? '手荷物タグのバーコードを隠さないでください。'
              : 'Do not cover the barcode on the baggage tag.'}
          </p>
        </div>
      </div>
    </div>
  );
};
