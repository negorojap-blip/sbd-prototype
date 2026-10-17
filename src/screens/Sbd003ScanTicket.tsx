import React from 'react';
import type { Language } from '../types/sbd';

interface Sbd003ScanTicketProps {
  language: Language;
  onSimulateScan: () => void;
}

export const Sbd003ScanTicket: React.FC<Sbd003ScanTicketProps> = ({
  language,
  onSimulateScan,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-14 pt-4 pb-2 overflow-hidden">
      {/* Main Titles */}
      <div className="text-center">
        <h2 className="text-[46px] font-extrabold text-[#0b253c] tracking-tight leading-tight">
          {language === 'ja'
            ? '搭乗券のコードを読み取ります'
            : 'Scan your boarding pass barcode'}
        </h2>
        <p className="text-[31px] font-bold text-[#0b253c] mt-1.5">
          {language === 'ja'
            ? 'コード面を上にして、読み取り部の下へ'
            : 'Hold the barcode facing up under the scanner'}
        </p>
      </div>

      {/* Two Column Illustrations (Paper & Smartphone) */}
      <div
        onClick={onSimulateScan}
        title={
          language === 'ja'
            ? 'クリックで「搭乗券スキャン」をシミュレート'
            : 'Click to simulate scanning boarding pass'
        }
        className="w-full max-w-[1300px] grid grid-cols-2 divide-x divide-slate-300 items-center my-auto cursor-pointer group"
      >
        {/* Left: Paper Boarding Pass */}
        <div className="flex items-start justify-center gap-4 pr-8">
          <span className="mt-3 px-7 py-2.5 rounded-full bg-[#475569] text-white font-bold text-[22px] whitespace-nowrap shadow-xs">
            {language === 'ja' ? '紙の搭乗券' : 'Paper Pass'}
          </span>
          <img
            src="/assets/sbd003-paper.png"
            alt="Scan paper boarding pass"
            className="h-[270px] w-auto object-contain group-hover:scale-[1.01] transition-transform"
          />
        </div>

        {/* Right: Smartphone */}
        <div className="flex items-start justify-center gap-4 pl-8">
          <span className="mt-3 px-7 py-2.5 rounded-full bg-[#475569] text-white font-bold text-[22px] whitespace-nowrap shadow-xs">
            {language === 'ja' ? 'スマートフォン' : 'Smartphone'}
          </span>
          <img
            src="/assets/sbd003-phone.png"
            alt="Scan smartphone boarding pass"
            className="h-[280px] w-auto object-contain group-hover:scale-[1.01] transition-transform"
          />
          <div className="self-center text-[21px] font-medium text-slate-700 leading-snug whitespace-nowrap">
            {language === 'ja' ? (
              <>
                画面を明るく
                <br />
                してください
              </>
            ) : (
              <>
                Please brighten
                <br />
                your screen
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Notice */}
      <p className="text-[24px] font-medium text-[#0b253c] mb-2">
        {language === 'ja'
          ? '読み取りが終わるまで、そのままにしてください。'
          : 'Please hold steady until scanning is complete.'}
      </p>
    </div>
  );
};
