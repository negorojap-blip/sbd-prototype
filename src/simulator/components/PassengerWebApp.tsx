import React, { useEffect, useState } from 'react';
import {
  Monitor,
  Luggage,
  QrCode,
  CheckCircle2,
  SendHorizontal,
  Loader2,
  Lock,
} from 'lucide-react';
import { simulationEventBus } from '../eventBus';
import type { SimulationEvent } from '../types';

interface PassengerWebAppProps {
  sessionId: string;
}

type WebAppScreenStatus =
  | 'wait_bag' // 「手荷物を置いてください」
  | 'wait_barcode' // 「搭乗券をかざしてください」
  | 'reading_barcode' // 「搭乗券を読み取っています」
  | 'barcode_verified' // 「搭乗券を確認しました」＋有効な「手荷物を搬送する」ボタン
  | 'conveying' // 「手荷物を搬送しています」＋無効な「手荷物を搬送する」ボタン
  | 'completed'; // 「手荷物のお預けが完了しました」

export const PassengerWebApp: React.FC<PassengerWebAppProps> = ({
  sessionId,
}) => {
  const [screenStatus, setScreenStatus] =
    useState<WebAppScreenStatus>('wait_bag');
  const [boardingPassId, setBoardingPassId] = useState<string | null>(null);

  // Subscribe ONLY to SimulationEventBus (Decoupled from Simulator internal variables)
  useEffect(() => {
    const unsubscribe = simulationEventBus.subscribe((event: SimulationEvent) => {
      switch (event.type) {
        case 'simulation.reset':
          setScreenStatus('wait_bag');
          setBoardingPassId(null);
          break;
        case 'person.arrived':
          // Webアプリは引き続き「手荷物を置いてください」
          setScreenStatus('wait_bag');
          break;
        case 'bag.placed':
          setScreenStatus('wait_barcode');
          break;
        case 'barcode.reading_started':
          setScreenStatus('reading_barcode');
          break;
        case 'boarding_pass.read':
          setScreenStatus('barcode_verified');
          if (
            event.payload &&
            typeof event.payload.boardingPassId === 'string'
          ) {
            setBoardingPassId(event.payload.boardingPassId);
          }
          break;
        case 'conveyor.started':
          setScreenStatus('conveying');
          break;
        case 'bag.transferred':
          setScreenStatus('completed');
          break;
      }
    });

    return unsubscribe;
  }, []);

  const handleRequestConvey = () => {
    if (screenStatus !== 'barcode_verified') return;
    // Webアプリからシミュレーターへ搬送指示イベントを発行
    simulationEventBus.emit(sessionId, 'conveyor.start_requested');
  };

  // Main message text required by specification
  const getMainMessage = (): string => {
    switch (screenStatus) {
      case 'wait_bag':
        return '手荷物を置いてください';
      case 'wait_barcode':
        return '搭乗券をかざしてください';
      case 'reading_barcode':
        return '搭乗券を読み取っています';
      case 'barcode_verified':
        return '搭乗券を確認しました';
      case 'conveying':
        return '手荷物を搬送しています';
      case 'completed':
        return '手荷物のお預けが完了しました';
    }
  };

  const showConveyButton =
    screenStatus === 'barcode_verified' || screenStatus === 'conveying';
  const isConveyButtonEnabled = screenStatus === 'barcode_verified';

  return (
    <section
      aria-label="利用者向けWebアプリ"
      className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col justify-between overflow-hidden"
    >
      {/* Top Kiosk Terminal Frame Header */}
      <div className="bg-[#0b253c] text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Monitor className="w-5 h-5 text-sky-300" aria-hidden="true" />
          <h2 className="text-[17px] font-extrabold tracking-tight">
            利用者向けWebアプリ（装置タッチパネル画面）
          </h2>
        </div>
        <span className="text-xs bg-slate-800 text-sky-200 px-2.5 py-1 rounded-md border border-slate-600 font-mono">
          イベント連動ビュー
        </span>
      </div>

      {/* Kiosk Screen Display Area */}
      <div className="p-6 flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-slate-50 min-h-[250px]">
        {/* Status Icon */}
        <div className="mb-4">
          {screenStatus === 'wait_bag' && (
            <div className="w-16 h-16 rounded-full bg-slate-100 text-[#0b253c] flex items-center justify-center mx-auto border border-slate-200">
              <Luggage className="w-8 h-8" aria-hidden="true" />
            </div>
          )}
          {screenStatus === 'wait_barcode' && (
            <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center mx-auto border border-sky-200">
              <QrCode className="w-8 h-8" aria-hidden="true" />
            </div>
          )}
          {screenStatus === 'reading_barcode' && (
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
              <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
            </div>
          )}
          {screenStatus === 'barcode_verified' && (
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center mx-auto border border-teal-300">
              <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
            </div>
          )}
          {screenStatus === 'conveying' && (
            <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center mx-auto border border-sky-300">
              <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
            </div>
          )}
          {screenStatus === 'completed' && (
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Main Screen Guidance Message */}
        <div
          role="status"
          aria-live="polite"
          className="text-[26px] font-extrabold text-[#0b253c] tracking-tight mb-2"
        >
          {getMainMessage()}
        </div>

        {/* Sub-details when boarding pass is verified */}
        {boardingPassId &&
          (screenStatus === 'barcode_verified' ||
            screenStatus === 'conveying' ||
            screenStatus === 'completed') && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 mb-4">
              <span>搭乗券ID: {boardingPassId}</span>
              <span className="text-emerald-700 font-bold">✓ 有効 (valid)</span>
            </div>
          )}

        {/* Convey Action Button (Only shown in barcode_verified or conveying states) */}
        {showConveyButton && (
          <div className="w-full max-w-[380px] mt-3">
            <button
              type="button"
              disabled={!isConveyButtonEnabled}
              onClick={handleRequestConvey}
              className={`w-full min-h-[56px] px-6 py-3 rounded-xl font-extrabold text-[18px] flex items-center justify-between gap-3 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 ${
                isConveyButtonEnabled
                  ? 'bg-[#005a60] hover:bg-[#00484d] text-white cursor-pointer shadow-md active:scale-[0.99]'
                  : 'bg-slate-200 text-slate-500 border-2 border-slate-300 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-2.5">
                {isConveyButtonEnabled ? (
                  <SendHorizontal className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Lock className="w-5 h-5" aria-hidden="true" />
                )}
                <span>手荷物を搬送する</span>
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  isConveyButtonEnabled
                    ? 'bg-teal-100 text-teal-900'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {isConveyButtonEnabled ? '現在の操作（有効）' : '搬送中（無効）'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Note inside Passenger Web App */}
      <div className="bg-slate-100 px-5 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <span>受信イベントに応じて画面表示を自動更新</span>
        <span>送信指示: conveyor.start_requested</span>
      </div>
    </section>
  );
};
