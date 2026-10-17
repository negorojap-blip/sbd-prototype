import React from 'react';
import { Check } from 'lucide-react';
import type { Language } from '../types/sbd';

interface Sbd010CompleteProps {
  language: Language;
  countdownSeconds: number;
  onAddAnotherBag: () => void;
  onExtendTime: () => void;
}

export const Sbd010Complete: React.FC<Sbd010CompleteProps> = ({
  language,
  countdownSeconds,
  onAddAnotherBag,
  onExtendTime,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between px-12 pt-5 pb-1 overflow-hidden">
      {/* Top Status Row */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#128293] text-white flex items-center justify-center shrink-0">
          <Check className="w-9 h-9 stroke-[3.5]" />
        </div>
        <h2 className="text-[40px] font-extrabold text-[#0b253c] tracking-tight">
          {language === 'ja'
            ? '手荷物のお預けが完了しました'
            : 'Baggage drop is complete'}
        </h2>
      </div>

      {/* Main Instruction */}
      <div className="text-center mt-1">
        <h3 className="text-[50px] font-extrabold text-[#0b253c] tracking-tight leading-tight">
          {language === 'ja'
            ? '手荷物引換証をお取りください'
            : 'Please take your baggage claim tag'}
        </h3>
        <p className="text-[26px] font-normal text-[#0b253c] mt-1">
          {language === 'ja'
            ? '手荷物を受け取るまで保管してください。'
            : 'Please keep this receipt until you claim your baggage.'}
        </p>
      </div>

      {/* 2 Columns: Receipt Illustration & Additional Bag Controls */}
      <div className="w-full max-w-[1320px] mx-auto grid grid-cols-12 divide-x divide-slate-300 items-center my-auto pt-2">
        {/* Left: Claim Receipt Illustration */}
        <div className="col-span-6 flex justify-center pr-8">
          <img
            src="/assets/sbd010-receipt.png"
            alt="Take baggage claim receipt"
            className="max-h-[290px] w-auto object-contain"
          />
        </div>

        {/* Right: Another Bag & Countdown */}
        <div className="col-span-6 pl-12 flex flex-col items-center text-center">
          <p className="text-[24px] font-bold text-[#0b253c] mb-4">
            {language === 'ja'
              ? 'ほかにも預ける手荷物がありますか？'
              : 'Do you have another bag to check?'}
          </p>

          <button
            type="button"
            onClick={onAddAnotherBag}
            className="w-full max-w-[520px] h-[76px] rounded-xl bg-[#005a60] hover:bg-[#00484d] active:scale-[0.99] transition text-white font-bold text-[30px] cursor-pointer shadow-sm mb-4"
          >
            {language === 'ja' ? 'もう1個預ける' : 'Check Another Bag'}
          </button>

          <p className="text-[21px] text-slate-700 font-medium mb-4">
            {language === 'ja'
              ? '追加がなければ、操作は不要です。'
              : 'No further action is needed if you have no more bags.'}
          </p>

          <p className="text-[21px] text-[#0b253c] mb-3">
            {language === 'ja' ? (
              <>
                あと{' '}
                <span className="text-[27px] font-extrabold">
                  {countdownSeconds}秒
                </span>{' '}
                で最初の画面に戻ります。
              </>
            ) : (
              <>
                Returning to the start screen in{' '}
                <span className="text-[27px] font-extrabold">
                  {countdownSeconds}s
                </span>
                .
              </>
            )}
          </p>

          <button
            type="button"
            onClick={onExtendTime}
            className="w-[360px] h-[54px] rounded-xl border-[1.5px] border-slate-600 bg-white hover:bg-slate-50 active:scale-[0.99] transition text-[#0b253c] font-bold text-[23px] cursor-pointer"
          >
            {language === 'ja' ? '時間を延長' : 'Extend Time'}
          </button>
        </div>
      </div>
    </div>
  );
};
