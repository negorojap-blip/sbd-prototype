import React from 'react';
import {
  UserPlus,
  Luggage,
  Smartphone,
  CheckCircle2,
  Lock,
  PlayCircle,
  Loader2,
  Scale,
  Tag,
  AlertTriangle,
  Backpack,
  PackageOpen,
  QrCode,
} from 'lucide-react';
import type { SimulationState } from '../types';
import type { BagShape, ScreenId } from '../../types/sbd';

interface SimulatorControlsProps {
  state: SimulationState;
  kioskScreenId: ScreenId;
  weightKg: number;
  bagShape: BagShape;
  hasTray: boolean;
  bagNeedsTray: boolean;
  bagMisplaced: boolean;
  paymentCompleted: boolean;
  heavyTagIssued: boolean;
  heavyTagAttached: boolean;
  onChangeWeight: (weightKg: number) => void;
  onChangeBagShape: (bagShape: BagShape) => void;
  onTakeTray: () => void;
  onCallPerson: () => void;
  onPlaceBag: () => void;
  onPlaceBagMisplaced: () => void;
  onScanBarcode: () => void;
  onCompletePayment: () => void;
  onAttachHeavyTag: () => void;
}

type ButtonStatus = 'active' | 'running' | 'completed' | 'disabled';

const WEIGHT_PRESETS = [
  { kg: 15.0, label: '15.0 kg (通常)' },
  { kg: 18.0, label: '18.0 kg (通常)' },
  { kg: 20.0, label: '20.0 kg (上限)' },
  { kg: 24.0, label: '24.0 kg (超過・HEAVY)' },
  { kg: 28.0, label: '28.0 kg (超過・HEAVY)' },
];

function getStepButtonStatus(
  step: 'call_person' | 'place_bag' | 'scan_barcode',
  state: SimulationState
): ButtonStatus {
  const order: SimulationState[] = [
    'idle',
    'person_arriving',
    'person_ready',
    'bag_placing',
    'bag_ready',
    'barcode_reading',
    'ready_to_convey',
    'conveying',
    'returning',
    'completed',
  ];
  const idx = order.indexOf(state);

  if (step === 'call_person') {
    if (state === 'idle') return 'active';
    if (state === 'person_arriving') return 'running';
    return 'completed';
  }

  if (step === 'place_bag') {
    if (idx < order.indexOf('person_ready')) return 'disabled';
    if (state === 'person_ready') return 'active';
    if (state === 'bag_placing') return 'running';
    return 'completed';
  }

  if (idx < order.indexOf('bag_ready')) return 'disabled';
  if (state === 'bag_ready') return 'active';
  if (state === 'barcode_reading') return 'running';
  return 'completed';
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  state,
  kioskScreenId,
  weightKg,
  bagShape,
  hasTray,
  bagNeedsTray,
  bagMisplaced,
  paymentCompleted,
  heavyTagIssued,
  heavyTagAttached,
  onChangeWeight,
  onChangeBagShape,
  onTakeTray,
  onCallPerson,
  onPlaceBag,
  onPlaceBagMisplaced,
  onScanBarcode,
  onCompletePayment,
  onAttachHeavyTag,
}) => {
  const isHeavy = weightKg > 20.0;
  const canTakeTray = state !== 'idle' && state !== 'completed' && !hasTray;

  const steps = [
    {
      id: 'call_person' as const,
      stepNum: 1,
      label: '人を呼ぶ',
      subLabel: '手荷物を持った利用者が装置前に来ます（約1.5秒）',
      icon: UserPlus,
      status: getStepButtonStatus('call_person', state),
      onClick: onCallPerson,
    },
    {
      id: 'place_bag' as const,
      stepNum: 2,
      label: bagMisplaced
        ? '荷物を正しい位置（中央）に置き直す'
        : bagShape === 'knapsack' && !hasTray
        ? '荷物を置く（通い箱なしで置くとSBD画面に案内が出ます）'
        : '荷物を置く（中央の正しい位置）',
      subLabel:
        '上のシーンで荷物をマウスでドラッグ＆ドロップ（またはこのボタンで設置）',
      icon: Luggage,
      status: getStepButtonStatus('place_bag', state),
      onClick: onPlaceBag,
    },
    {
      id: 'scan_barcode' as const,
      stepNum: 3,
      label: 'バーコードをかざす',
      subLabel:
        '上のシーンで「人（利用者）」をクリック（またはこのボタンで搭乗券を読み取らせます）',
      icon: Smartphone,
      status: getStepButtonStatus('scan_barcode', state),
      onClick: onScanBarcode,
    },
  ];

  return (
    <section
      aria-label="シミュレーター操作部"
      className="bg-white rounded-2xl border border-slate-300 shadow-xs p-3.5 flex flex-col gap-2.5 text-[#0b253c]"
    >
      {/* 1. Baggage Shape & Tray Selector (Compact Single Row) */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Backpack className="w-4 h-4 text-[#0b253c]" aria-hidden="true" />
            <span className="text-xs font-extrabold text-[#0b253c]">
              手荷物の形状：
            </span>
          </div>

          <button
            type="button"
            onClick={() => onChangeBagShape('suitcase')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
              bagShape === 'suitcase'
                ? 'bg-[#0b253c] text-white border-[#0b253c] shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <span>🧳 スーツケース</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeBagShape('knapsack')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
              bagShape === 'knapsack'
                ? 'bg-[#0b253c] text-white border-[#0b253c] shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <span>🎒 ナップサック（通い箱が必要）</span>
          </button>
        </div>

        {/* Interactive "通い箱を取る" Quick Button */}
        <button
          type="button"
          disabled={!canTakeTray}
          onClick={onTakeTray}
          className={`px-3 py-1 rounded-lg text-xs font-extrabold border flex items-center gap-1.5 transition ${
            hasTray
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 cursor-default'
              : bagNeedsTray
              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-600 shadow-sm cursor-pointer animate-pulse'
              : canTakeTray
              ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white border-[#0369a1] shadow-xs cursor-pointer'
              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
          }`}
        >
          <PackageOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>
            {hasTray
              ? '✓ 通い箱を使用中'
              : '📦 通い箱をベルトへ置く'}
          </span>
        </button>
      </div>

      {/* 2. Baggage Weight Selector (Compact) */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#0b253c]" aria-hidden="true" />
            <span className="text-xs font-extrabold text-[#0b253c]">
              手荷物の重量：
            </span>
            <span className="text-sm font-extrabold text-teal-800 font-mono">
              {weightKg.toFixed(1)} kg
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                isHeavy
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-sky-100 text-sky-900 border-sky-300'
              }`}
            >
              {isHeavy
                ? '20kg超：超過料金お支払い（SBD-P01）＆ヘビータグ（SBD-007）あり'
                : '20kg以下：追加料金・ヘビータグなし'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <label htmlFor="weight-slider" className="font-semibold">
              微調整:
            </label>
            <input
              id="weight-slider"
              type="range"
              min="5"
              max="32"
              step="0.5"
              value={weightKg}
              onChange={(e) => onChangeWeight(parseFloat(e.target.value))}
              className="w-24 accent-[#005a60] cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {WEIGHT_PRESETS.map((preset) => {
            const selected = Math.abs(weightKg - preset.kg) < 0.05;
            return (
              <button
                key={preset.kg}
                type="button"
                onClick={() => onChangeWeight(preset.kg)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                  selected
                    ? 'bg-[#0b253c] text-white border-[#0b253c] shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Step Action Buttons */}
      <div className="grid grid-cols-1 gap-2">
        {steps.map((item) => {
          const Icon = item.icon;
          const isEnabled = item.status === 'active';

          const statusBadge = {
            active: {
              text: '現在の操作（有効）',
              icon: PlayCircle,
              cls: 'bg-teal-100 text-teal-900 border-teal-400',
            },
            running: {
              text: '動作中（無効）',
              icon: Loader2,
              cls: 'bg-sky-100 text-sky-900 border-sky-300',
            },
            completed: {
              text: '完了（無効）',
              icon: CheckCircle2,
              cls: 'bg-emerald-50 text-emerald-800 border-emerald-300',
            },
            disabled: {
              text: '待機中（無効）',
              icon: Lock,
              cls: 'bg-slate-100 text-slate-600 border-slate-300',
            },
          }[item.status];

          const StatusIcon = statusBadge.icon;

          return (
            <div key={item.id} className="flex flex-col gap-1">
              <button
                type="button"
                disabled={!isEnabled}
                onClick={item.onClick}
                className={`w-full min-h-[48px] px-3.5 py-2 rounded-xl border-2 text-left flex items-center justify-between gap-3 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 ${
                  isEnabled
                    ? 'bg-[#005a60] hover:bg-[#00484d] border-[#00484d] text-white cursor-pointer shadow-sm active:scale-[0.99]'
                    : item.status === 'completed'
                    ? 'bg-emerald-50/40 border-emerald-300 text-slate-700 cursor-not-allowed'
                    : item.status === 'running'
                    ? 'bg-sky-50 border-sky-300 text-slate-800 cursor-wait'
                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 ${
                      isEnabled
                        ? 'bg-white text-[#005a60]'
                        : item.status === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.stepNum}
                  </span>
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <div>
                    <div className="text-[14.5px] font-bold leading-snug">
                      {item.label}
                    </div>
                    <div
                      className={`text-[11.5px] ${
                        isEnabled ? 'text-teal-100' : 'text-slate-500'
                      }`}
                    >
                      {item.subLabel}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 shrink-0 ${statusBadge.cls}`}
                >
                  <StatusIcon
                    className={`w-3.5 h-3.5 ${
                      item.status === 'running' ? 'animate-spin' : ''
                    }`}
                    aria-hidden="true"
                  />
                  <span>{statusBadge.text}</span>
                </span>
              </button>

              {/* Sub-buttons under Step 2 */}
              {item.id === 'place_bag' && isEnabled && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {bagShape === 'knapsack' && !hasTray && (
                    <button
                      type="button"
                      onClick={onTakeTray}
                      className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <PackageOpen className="w-3.5 h-3.5 text-sky-700" />
                      <span>
                        通い箱をベルトへ置く（装置右側の通い箱をドラッグ＆ドロップでも可）
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onPlaceBagMisplaced}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      正しくない位置に置く（Webアプリ側の警告ポップアップをテスト）
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Dynamic Alert Button when Knapsack was placed without a Tray */}
        {bagNeedsTray && !hasTray && (
          <button
            type="button"
            onClick={onTakeTray}
            className="w-full min-h-[58px] px-4 py-2.5 rounded-xl border-2 bg-amber-400 hover:bg-amber-300 border-amber-600 text-slate-950 text-left flex items-center justify-between gap-3 cursor-pointer shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <span className="w-8 h-8 rounded-lg font-extrabold text-sm flex items-center justify-center shrink-0 bg-slate-950 text-amber-400">
                📦
              </span>
              <PackageOpen className="w-5 h-5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-[16px] font-extrabold leading-snug">
                  通い箱を取る（ナップサックを通い箱に入れて預ける）
                </div>
                <div className="text-xs font-medium text-slate-800">
                  SBD画面に通い箱の案内が表示されています。装置右側の「通い箱」をベルトへドラッグ＆ドロップ（またはこのボタンを押下）してください
                </div>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-white text-slate-950 border-amber-700 flex items-center gap-1.5 shrink-0">
              <PlayCircle className="w-3.5 h-3.5" />
              <span>要対応（有効）</span>
            </span>
          </button>
        )}

        {/* Dynamic Action when SBD-P01 (Excess Baggage QR Payment Screen) is active */}
        {kioskScreenId === 'SBD-P01' && (
          <button
            type="button"
            disabled={paymentCompleted}
            onClick={onCompletePayment}
            className={`w-full min-h-[58px] px-4 py-2.5 rounded-xl border-2 text-left flex items-center justify-between gap-3 transition-all ${
              !paymentCompleted
                ? 'bg-[#005a60] hover:bg-[#00484d] border-[#00484d] text-white cursor-pointer shadow-md active:scale-[0.99]'
                : 'bg-emerald-50 border-emerald-400 text-emerald-950 cursor-default shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <span
                className={`w-8 h-8 rounded-lg font-extrabold text-sm flex items-center justify-center shrink-0 ${
                  !paymentCompleted
                    ? 'bg-white text-[#005a60]'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {paymentCompleted ? '✓' : '💳'}
              </span>
              <QrCode className="w-5 h-5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-[16px] font-extrabold leading-snug">
                  {paymentCompleted
                    ? 'お支払いが完了しました（次の画面へ切り替わります...）'
                    : 'QRコードを読み取ってお支払いを完了する（3,000円）'}
                </div>
                <div
                  className={`text-xs font-medium ${
                    !paymentCompleted ? 'text-teal-100' : 'text-emerald-800'
                  }`}
                >
                  {paymentCompleted
                    ? 'SBD画面でお支払い完了を表示しています。自動でヘビータグ画面（SBD-007）へ進みます'
                    : '上のシーンの「人（利用者）」をクリック、SBD画面のQRコードをクリック、またはこのボタンを押すと決済が完了します'}
                </div>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shrink-0 ${
                !paymentCompleted
                  ? 'bg-teal-100 text-teal-900 border-teal-400'
                  : 'bg-white text-emerald-900 border-emerald-400'
              }`}
            >
              {!paymentCompleted ? (
                <>
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>お支払い待ち（有効）</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>決済完了</span>
                </>
              )}
            </span>
          </button>
        )}

        {/* Dynamic Step 4: Issued HEAVY Tag Action (Shown when SBD-007 issues a Heavy Tag) */}
        {heavyTagIssued && (
          <button
            type="button"
            disabled={heavyTagAttached}
            onClick={onAttachHeavyTag}
            className={`w-full min-h-[58px] px-4 py-2.5 rounded-xl border-2 text-left flex items-center justify-between gap-3 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 ${
              !heavyTagAttached
                ? 'bg-amber-400 hover:bg-amber-300 border-amber-600 text-slate-950 cursor-pointer shadow-md active:scale-[0.99]'
                : 'bg-emerald-50/40 border-emerald-300 text-slate-700 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <span
                className={`w-8 h-8 rounded-lg font-extrabold text-sm flex items-center justify-center shrink-0 ${
                  !heavyTagAttached
                    ? 'bg-slate-950 text-amber-400'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                🏷
              </span>
              <Tag className="w-5 h-5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-[16px] font-extrabold leading-snug">
                  {heavyTagAttached
                    ? 'ヘビータグを取り付けました'
                    : '発行されたヘビータグを手荷物に取り付ける'}
                </div>
                <div
                  className={`text-xs font-medium ${
                    !heavyTagAttached ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {heavyTagAttached
                    ? 'SBD画面（SBD-007）で「タグを付けました」を押すと搬送が始まります'
                    : '上のシーンで発行口から出た「HEAVY」タグをクリック（またはこのボタンを押す）'}
                </div>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shrink-0 ${
                !heavyTagAttached
                  ? 'bg-white text-slate-950 border-amber-700'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              {!heavyTagAttached ? (
                <>
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>タグ発行中（有効）</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>取付完了（無効）</span>
                </>
              )}
            </span>
          </button>
        )}
      </div>
    </section>
  );
};
