import React from 'react';
import type { Language } from '../types/sbd';

interface Sbd001PlaceBagProps {
  language: Language;
  onSimulatePlaceBag: () => void;
}

export const Sbd001PlaceBag: React.FC<Sbd001PlaceBagProps> = ({
  language,
  onSimulatePlaceBag,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-12 pt-5 pb-2 overflow-hidden">
      {/* Titles */}
      <div className="text-center">
        <h2 className="text-[48px] font-extrabold text-[#0b253c] tracking-tight leading-tight">
          {language === 'ja'
            ? '手荷物を中央に倒して置いてください'
            : 'Place your baggage flat in the center'}
        </h2>
        <p className="text-[31px] font-bold text-[#0b253c] mt-2">
          {language === 'ja'
            ? '手荷物タグのバーコードが見えるようにしてください'
            : 'Make sure the baggage tag barcode is visible'}
        </p>
      </div>

      {/* Main Illustration Area */}
      <div className="w-full max-w-[1360px] flex items-center justify-between gap-6 my-auto">
        {/* Left: Suitcase on Conveyor Belt */}
        <div
          onClick={onSimulatePlaceBag}
          title={
            language === 'ja'
              ? 'クリックで「手荷物を置く」をシミュレート'
              : 'Click to simulate placing baggage'
          }
          className="flex-1 flex justify-center cursor-pointer group"
        >
          <img
            src="/assets/sbd001-suitcase.png"
            alt="Place suitcase on belt"
            className="max-h-[340px] w-auto object-contain group-hover:scale-[1.01] transition-transform"
          />
        </div>

        {/* Right: Zoom Circle & Caption */}
        <div className="w-[460px] flex flex-col items-center shrink-0">
          <div className="relative flex items-center">
            <img
              src="/assets/sbd001-tag-zoom.png"
              alt="Baggage tag barcode zoom"
              className="w-[270px] h-[270px] object-contain"
            />
            <div className="ml-3 text-[25px] font-extrabold text-[#0b253c] leading-snug">
              {language === 'ja' ? (
                <>
                  バーコードを
                  <br />
                  隠さない
                </>
              ) : (
                <>
                  Do not cover
                  <br />
                  the barcode
                </>
              )}
            </div>
          </div>
          <p className="mt-3 text-[19px] text-slate-700 font-medium leading-relaxed text-center">
            {language === 'ja' ? (
              <>
                手荷物タグは、持ち手に通して
                <br />
                しっかりと取り付けてください。
              </>
            ) : (
              <>
                Loop the baggage tag through the handle
                <br />
                and attach it securely.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
