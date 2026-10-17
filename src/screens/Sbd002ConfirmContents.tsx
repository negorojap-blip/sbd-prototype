import React from 'react';
import type { Language } from '../types/sbd';

interface Sbd002ConfirmContentsProps {
  language: Language;
}

const PROHIBITED_ITEMS = [
  {
    img: '/assets/sbd002-battery.png',
    ja: 'モバイルバッテリー',
    en: 'Power Banks',
  },
  {
    img: '/assets/sbd002-lithium.png',
    ja: '予備のリチウム電池',
    en: 'Spare Lithium Batteries',
  },
  {
    img: '/assets/sbd002-ecig.png',
    ja: '電子たばこ',
    en: 'E-Cigarettes / Vapes',
  },
  {
    img: '/assets/sbd002-lighter.png',
    ja: 'ライター・マッチ',
    en: 'Lighters & Matches',
  },
];

export const Sbd002ConfirmContents: React.FC<Sbd002ConfirmContentsProps> = ({
  language,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center px-14 pt-5 pb-2 overflow-hidden">
      {/* Main Titles */}
      <div className="text-center shrink-0">
        <h2 className="text-[46px] font-extrabold text-[#0b253c] tracking-tight leading-tight">
          {language === 'ja'
            ? '手荷物の中身をご確認ください'
            : 'Please check the contents of your baggage'}
        </h2>
        <p className="text-[29px] font-bold text-[#0b253c] mt-1.5">
          {language === 'ja'
            ? '次の物が入っていませんか？'
            : 'Does your baggage contain any of the following?'}
        </p>
      </div>

      {/* Prohibited Items Section (Vertically & Horizontally Centered) */}
      <div className="w-full max-w-[1280px] my-auto flex flex-col items-center justify-center">
        {/* Subheader with Red Prohibition Icon */}
        <div className="w-full flex items-center gap-3 mb-4">
          <svg
            viewBox="0 0 40 40"
            className="w-10 h-10 shrink-0"
            aria-hidden="true"
          >
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#dc2626"
              strokeWidth="4.5"
            />
            <line
              x1="9"
              y1="9"
              x2="31"
              y2="31"
              stroke="#dc2626"
              strokeWidth="4.5"
            />
          </svg>
          <span className="text-[24px] font-bold text-[#0b253c]">
            {language === 'ja'
              ? '預けられない物の代表例'
              : 'Examples of Prohibited Items'}
          </span>
        </div>

        {/* 4 Items Grid (Centered) */}
        <div className="w-full grid grid-cols-4 gap-8 items-center justify-items-center py-3">
          {PROHIBITED_ITEMS.map((item) => (
            <div
              key={item.ja}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="h-[165px] flex items-center justify-center">
                <img
                  src={item.img}
                  alt={item.ja}
                  className="max-h-[160px] w-auto object-contain"
                />
              </div>
              <span className="mt-3 text-[22px] font-bold text-[#0b253c]">
                {language === 'ja' ? item.ja : item.en}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-[1.5px] bg-slate-300 my-4" />

        {/* Bottom Row: Fireworks, Gas, Hair Iron */}
        <div className="flex items-center justify-center gap-12 py-1">
          <img
            src="/assets/sbd002-subitems.png"
            alt="Fireworks, gas canister, cordless hair iron"
            className="h-[84px] w-auto object-contain"
          />
          <p className="text-[21px] text-slate-700 font-medium leading-relaxed">
            {language === 'ja' ? (
              <>
                花火・ガスボンベ、コードレスヘアアイロンなどを
                <br />
                お持ちの場合は、係員にご確認ください。
              </>
            ) : (
              <>
                If you have fireworks, gas canisters, or cordless hair irons,
                <br />
                please check with airport staff.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
