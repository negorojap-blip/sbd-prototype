import React, { useState } from 'react';
import {
  Settings2,
  ChevronUp,
  ChevronDown,
  Radio,
  ExternalLink,
} from 'lucide-react';
import type { ScreenId } from '../types/sbd';

interface DemoControlBarProps {
  currentScreen: ScreenId;
  cancelModalOpen: boolean;
  connected: boolean;
  onTriggerDevice: (
    type:
      | 'PLACE_BAG'
      | 'SCAN_BOARDING_PASS'
      | 'VERIFY_COMPLETE'
      | 'CONVEY_COMPLETE'
      | 'RESET',
    screenId?: ScreenId,
    cancelModalOpen?: boolean
  ) => void;
}

const ALL_SCREENS: { id: ScreenId; label: string }[] = [
  { id: 'SBD-001', label: '001: 手荷物を置く' },
  { id: 'SBD-002', label: '002: 中身の確認' },
  { id: 'SBD-003', label: '003: 搭乗券読取' },
  { id: 'SBD-004', label: '004: 情報確認中' },
  { id: 'SBD-005', label: '005: 搭乗便確認' },
  { id: 'SBD-006', label: '006: 重量・料金' },
  { id: 'SBD-007', label: '007: ヘビータグ' },
  { id: 'SBD-009', label: '009: 搬送中' },
  { id: 'SBD-010', label: '010: 完了・引換証' },
];

export const DemoControlBar: React.FC<DemoControlBarProps> = ({
  currentScreen,
  cancelModalOpen,
  connected,
  onTriggerDevice,
}) => {
  const [expanded, setExpanded] = useState(false);

  const openSimulatorWindow = () => {
    window.open(
      '/simulator',
      'sbd_simulator_window',
      'width=840,height=900,menubar=no,toolbar=no,location=no,status=no'
    );
  };

  return (
    <div className="fixed top-2 left-2 z-50 flex items-center gap-2">
      {!expanded ? (
        <>
          <button
            type="button"
            onClick={openSimulatorWindow}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-700/90 hover:bg-teal-700 text-white text-xs font-bold shadow-md backdrop-blur-xs cursor-pointer transition opacity-75 hover:opacity-100"
            title="手荷物預け入れシミュレーターを別ウィンドウで開く"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>シミュレーターを別Windowで開く</span>
          </button>

          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 text-white text-xs font-medium shadow-md backdrop-blur-xs cursor-pointer transition opacity-40 hover:opacity-100"
            title="デモ・REST API操作パネルを開く"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <Settings2 className="w-3.5 h-3.5" />
            <span>Demo / API</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </>
      ) : (
        <div className="bg-slate-900/95 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 w-[560px] backdrop-blur-md text-xs">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Radio
                className={`w-4 h-4 ${
                  connected ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
              <span className="font-bold text-sm">
                装置シミュレータ連携 (REST API: /api/device/*)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openSimulatorWindow}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-700 hover:bg-teal-600 text-white font-bold cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>シミュレーターWindowを開く</span>
              </button>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <span>閉じる</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hardware Sensor Event Triggers */}
          <div className="mb-3">
            <div className="text-slate-400 mb-1.5 font-semibold">
              センサー・装置イベント送信 (POST /api/device/...)
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onTriggerDevice('PLACE_BAG')}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 font-bold cursor-pointer"
              >
                ① 手荷物検知 (place-bag)
              </button>
              <button
                type="button"
                onClick={() => onTriggerDevice('SCAN_BOARDING_PASS')}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold cursor-pointer"
              >
                ② 搭乗券読取 (scan-boarding-pass)
              </button>
              <button
                type="button"
                onClick={() => onTriggerDevice('VERIFY_COMPLETE')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold cursor-pointer"
              >
                ③ 照合完了 (verify-complete)
              </button>
              <button
                type="button"
                onClick={() => onTriggerDevice('CONVEY_COMPLETE')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold cursor-pointer"
              >
                ④ 搬送完了 (convey-complete)
              </button>
              <button
                type="button"
                onClick={() => onTriggerDevice('RESET')}
                className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 font-bold cursor-pointer"
              >
                初期化 (reset)
              </button>
            </div>
          </div>

          {/* Direct Screen Switcher */}
          <div>
            <div className="text-slate-400 mb-1.5 font-semibold">
              画面ダイレクト切替 (全9画面 + SBD-118 中止ポップアップ)
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {ALL_SCREENS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onTriggerDevice('RESET', s.id, false)}
                  className={`px-2.5 py-1.5 rounded-lg text-left font-medium transition cursor-pointer ${
                    currentScreen === s.id && !cancelModalOpen
                      ? 'bg-white text-slate-900 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onTriggerDevice('RESET', 'SBD-003', true)}
                className={`px-2.5 py-1.5 rounded-lg text-left font-medium transition cursor-pointer col-span-3 ${
                  cancelModalOpen
                    ? 'bg-amber-400 text-slate-900 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                }`}
              >
                SBD-118: 手続き中止の確認ポップアップを表示
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
