import React from 'react';
import { Headphones, AlertTriangle } from 'lucide-react';
import type { Language } from '../../types/sbd';

interface StaffCallModalProps {
  staffCalling: boolean;
  hazardousWarningOpen: boolean;
  language: Language;
  onDismissStaff: () => void;
  onDismissHazardous: () => void;
  onConfirmCancel: () => void;
}

export const StaffCallModal: React.FC<StaffCallModalProps> = ({
  staffCalling,
  hazardousWarningOpen,
  language,
  onDismissStaff,
  onDismissHazardous,
  onConfirmCancel,
}) => {
  if (!staffCalling && !hazardousWarningOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-6">
      <div className="bg-white rounded-[28px] w-full max-w-[740px] px-12 py-10 shadow-2xl flex flex-col items-center text-center">
        {hazardousWarningOpen ? (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-[32px] font-extrabold text-[#0b253c] mb-4">
              {language === 'ja'
                ? '制限品が含まれている可能性があります'
                : 'Restricted Items Detected'}
            </h2>
            <p className="text-[21px] text-slate-700 mb-8 leading-relaxed">
              {language === 'ja'
                ? '預けられないお品物（モバイルバッテリー等）は手荷物から取り出し、機内へお持ち込みいただくか係員へご確認ください。'
                : 'Please remove restricted items (such as power banks) from your checked baggage or consult airport staff.'}
            </p>
            <div className="w-full flex gap-6">
              <button
                type="button"
                onClick={onDismissHazardous}
                className="flex-1 h-[68px] rounded-xl bg-[#005a60] text-white font-bold text-[22px] cursor-pointer"
              >
                {language === 'ja' ? '確認画面に戻る' : 'Back to Check'}
              </button>
              <button
                type="button"
                onClick={onConfirmCancel}
                className="flex-1 h-[68px] rounded-xl bg-[#a6192e] text-white font-bold text-[22px] cursor-pointer"
              >
                {language === 'ja' ? '手続きを中止する' : 'Cancel Process'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-sky-100 text-[#0b4f6c] flex items-center justify-center mb-5">
              <Headphones className="w-10 h-10" />
            </div>
            <h2 className="text-[32px] font-extrabold text-[#0b253c] mb-4">
              {language === 'ja' ? '係員をお呼びしています' : 'Calling Staff'}
            </h2>
            <p className="text-[21px] text-slate-700 mb-8">
              {language === 'ja'
                ? '係員が参りますので、そのまましばらくお待ちください。'
                : 'A staff member will be with you shortly. Please wait.'}
            </p>
            <button
              type="button"
              onClick={onDismissStaff}
              className="px-12 h-[64px] rounded-xl bg-[#005a60] text-white font-bold text-[22px] cursor-pointer"
            >
              {language === 'ja' ? '閉じる' : 'Close'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
