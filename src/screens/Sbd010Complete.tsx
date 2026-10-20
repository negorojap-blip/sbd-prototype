import React from 'react';
import { Check, Printer } from 'lucide-react';
import type { Language } from '../types/sbd';

interface Sbd010CompleteProps {
  language: Language;
  receiptPrinted?: boolean;
  countdownSeconds: number;
  onAddAnotherBag: () => void;
  onExtendTime: () => void;
}

export const Sbd010Complete: React.FC<Sbd010CompleteProps> = ({
  language,
  receiptPrinted = false,
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

      {/* Main Instruction (Changes between Printing 5s and Ready to Take) */}
      <div className="text-center mt-1">
        {!receiptPrinted ? (
          <>
            <h3 className="text-[50px] font-extrabold text-[#0e7479] tracking-tight leading-tight">
              {language === 'ja'
                ? '手荷物引換証を発行しています'
                : 'Printing your baggage claim tag...'}
            </h3>
            <p className="text-[26px] font-bold text-[#0b253c] mt-1">
              {language === 'ja'
                ? '発行口から手荷物引換証が出るまで、そのままお待ちください。'
                : 'Please wait while your baggage claim tag is being printed.'}
            </p>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* 2 Columns: Receipt Illustration & Additional Bag Controls */}
      <div className="w-full max-w-[1320px] mx-auto grid grid-cols-12 divide-x divide-slate-300 items-center my-auto pt-2">
        {/* Left: Claim Receipt Illustration / Printing Status */}
        <div className="col-span-6 flex flex-col items-center justify-center pr-8 relative">
          <div className="relative flex items-center justify-center">
            <img
              src="/assets/sbd010-receipt.png"
              alt="Take baggage claim receipt"
              className={`max-h-[275px] w-auto object-contain transition-opacity duration-500 ${
                !receiptPrinted ? 'opacity-45' : 'opacity-100'
              }`}
            />

            {/* Printing Overlay Badge during the 5-second printing phase */}
            {!receiptPrinted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/95 border-2 border-[#128387] rounded-2xl px-8 py-6 shadow-md flex flex-col items-center gap-3.5">
                  <div className="w-16 h-16 rounded-full bg-[#dcf2f0] text-[#0e7479] flex items-center justify-center">
                    <Printer className="w-9 h-9 stroke-[2.2] animate-bounce" />
                  </div>
                  <span className="text-[28px] font-extrabold text-[#0b253c] tracking-tight">
                    {language === 'ja' ? '発券処理中...' : 'Printing...'}
                  </span>
                  <div className="flex items-center gap-3.5 mt-1">
                    <span className="w-4 h-4 rounded-full bg-[#128387] dot-1" />
                    <span className="w-4 h-4 rounded-full bg-[#128387] dot-2" />
                    <span className="w-4 h-4 rounded-full bg-[#128387] dot-3" />
                  </div>
                </div>
              </div>
            )}
          </div>
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
            disabled={!receiptPrinted}
            onClick={onAddAnotherBag}
            className={`w-full max-w-[520px] h-[76px] rounded-xl font-bold text-[30px] transition mb-4 ${
              receiptPrinted
                ? 'bg-[#005a60] hover:bg-[#00484d] active:scale-[0.99] text-white cursor-pointer shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {language === 'ja' ? 'もう1個預ける' : 'Check Another Bag'}
          </button>

          {!receiptPrinted ? (
            <div className="mt-2 px-6 py-3.5 rounded-xl bg-[#dcf2f0] text-[#0e7479] font-extrabold text-[22px]">
              {language === 'ja'
                ? '引換証の発行が完了するまでお待ちください（約5秒）'
                : 'Please wait until printing is complete (approx. 5s)'}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
