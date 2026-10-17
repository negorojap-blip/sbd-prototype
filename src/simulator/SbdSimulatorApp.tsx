import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, ExternalLink, Activity } from 'lucide-react';
import { STATE_LABELS_JA, type SimulationState } from './types';
import type { BagShape, ScreenId, SbdSessionState } from '../types/sbd';
import {
  getSessionState,
  subscribeSessionEvents,
  updateSimulatorState,
  simulatePlaceBag,
  simulateSetBagShape,
  simulateTakeTray,
  simulateMeasureWeight,
  simulateCompletePayment,
  simulateAttachHeavyTag,
  simulateScanBoardingPass,
  simulateReset,
} from '../api/sbdApi';
import { SimulatorScene } from './components/SimulatorScene';
import { SimulatorControls } from './components/SimulatorControls';

export const SbdSimulatorApp: React.FC = () => {
  const [state, setState] = useState<SimulationState>('idle');
  const [kioskScreenId, setKioskScreenId] = useState<ScreenId>('SBD-001');
  const [weightKg, setWeightKg] = useState<number>(24.0);
  const [bagShape, setBagShape] = useState<BagShape>('suitcase');
  const [hasTray, setHasTray] = useState<boolean>(false);
  const [bagNeedsTray, setBagNeedsTray] = useState<boolean>(false);
  const [bagMisplaced, setBagMisplaced] = useState<boolean>(false);
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);
  const [heavyTagIssued, setHeavyTagIssued] = useState<boolean>(false);
  const [heavyTagAttached, setHeavyTagAttached] = useState<boolean>(false);

  const stateRef = useRef<SimulationState>('idle');
  const bagShapeRef = useRef<BagShape>('suitcase');
  const hasTrayRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>('session-001');
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const updateLocalState = useCallback((next: SimulationState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const clearAllTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      clearTimeout(timer);
    }
    timersRef.current.clear();
  }, []);

  const scheduleSafeTimeout = useCallback(
    (callback: () => void, delayMs: number) => {
      const capturedSessionId = sessionIdRef.current;
      const timer = setTimeout(() => {
        timersRef.current.delete(timer);
        if (sessionIdRef.current !== capturedSessionId) {
          return;
        }
        callback();
      }, delayMs);
      timersRef.current.add(timer);
    },
    []
  );

  // Subscribe to session events (SSE + BroadcastChannel / localStorage) to stay synchronized with the SBD Kiosk Window
  useEffect(() => {
    const applyServerSession = (data: SbdSessionState) => {
      if (data.sessionId && data.sessionId !== sessionIdRef.current) {
        clearAllTimers();
        sessionIdRef.current = data.sessionId;
      }
      setKioskScreenId(data.screenId);
      setBagMisplaced(Boolean(data.bagMisplaced));
      setBagNeedsTray(Boolean(data.bagNeedsTray));
      setHasTray(Boolean(data.hasTray));
      hasTrayRef.current = Boolean(data.hasTray);

      if (data.bagShape) {
        setBagShape(data.bagShape);
        bagShapeRef.current = data.bagShape;
      }

      setWeightKg(data.baggageInfo.currentWeightKg);
      setPaymentCompleted(Boolean(data.deviceStatus.paymentCompleted));
      setHeavyTagIssued(Boolean(data.deviceStatus.heavyTagIssued));
      setHeavyTagAttached(Boolean(data.deviceStatus.heavyTagAttached));

      if (data.simulatorState && data.simulatorState !== stateRef.current) {
        updateLocalState(data.simulatorState);
      }
    };

    getSessionState()
      .then(applyServerSession)
      .catch(() => {});

    const unsubscribe = subscribeSessionEvents(applyServerSession);

    return () => {
      unsubscribe();
      clearAllTimers();
    };
  }, [clearAllTimers, updateLocalState]);

  // Change Weight handler
  const handleChangeWeight = useCallback((nextKg: number) => {
    setWeightKg(nextKg);
    simulateMeasureWeight(nextKg).catch(() => {});
  }, []);

  // Change Bag Shape handler (Suitcase vs Knapsack)
  const handleChangeBagShape = useCallback((nextShape: BagShape) => {
    setBagShape(nextShape);
    bagShapeRef.current = nextShape;
    if (nextShape === 'suitcase') {
      setHasTray(false);
      hasTrayRef.current = false;
      setBagNeedsTray(false);
    }
    simulateSetBagShape(nextShape).catch(() => {});
  }, []);

  // Take Tray (通い箱を取る) handler
  const handleTakeTray = useCallback(() => {
    setHasTray(true);
    hasTrayRef.current = true;
    setBagNeedsTray(false);
    simulateTakeTray().catch(() => {});
  }, []);

  // Step 1: 「1. 人を呼ぶ」
  const handleCallPerson = useCallback(() => {
    if (stateRef.current !== 'idle') return;

    updateLocalState('person_arriving');
    updateSimulatorState('person_arriving').catch(() => {});

    scheduleSafeTimeout(() => {
      if (stateRef.current !== 'person_arriving') return;
      updateLocalState('person_ready');
      updateSimulatorState('person_ready').catch(() => {});
    }, 1500);
  }, [scheduleSafeTimeout, updateLocalState]);

  // Step 2 (Button): 「2. 荷物を置く（中央）」
  const handlePlaceBag = useCallback(() => {
    if (stateRef.current !== 'person_ready') return;

    setBagMisplaced(false);

    // If knapsack without tray, placing on belt triggers the TrayRequiredModal on Web App
    if (bagShapeRef.current === 'knapsack' && !hasTrayRef.current) {
      setBagNeedsTray(true);
      simulatePlaceBag({ misplaced: false }).catch(() => {});
      return;
    }

    updateLocalState('bag_placing');
    updateSimulatorState('bag_placing').catch(() => {});

    scheduleSafeTimeout(() => {
      if (stateRef.current !== 'bag_placing') return;
      updateLocalState('bag_ready');
      simulatePlaceBag({ misplaced: false }).catch(() => {});
    }, 650);
  }, [scheduleSafeTimeout, updateLocalState]);

  // Step 2 (Drag & Drop on Scene): Correct or Misplaced
  const handleBagDropped = useCallback(
    (misplaced: boolean) => {
      if (stateRef.current !== 'person_ready') return;

      if (misplaced) {
        setBagMisplaced(true);
        setBagNeedsTray(false);
        simulatePlaceBag({ misplaced: true }).catch(() => {});
      } else if (bagShapeRef.current === 'knapsack' && !hasTrayRef.current) {
        // Placed in center zone, but knapsack requires a tray!
        setBagMisplaced(false);
        setBagNeedsTray(true);
        simulatePlaceBag({ misplaced: false }).catch(() => {});
      } else {
        setBagMisplaced(false);
        setBagNeedsTray(false);
        updateLocalState('bag_ready');
        simulatePlaceBag({ misplaced: false }).catch(() => {});
      }
    },
    [updateLocalState]
  );

  // Step 2 (Sub-button): Place in incorrect spot to trigger warning
  const handlePlaceBagMisplaced = useCallback(() => {
    if (stateRef.current !== 'person_ready') return;
    setBagMisplaced(true);
    setBagNeedsTray(false);
    simulatePlaceBag({ misplaced: true }).catch(() => {});
  }, []);

  // Step 3: 「3. バーコードをかざす」（ボタンまたはシーン内の人をクリック）
  const handleScanBarcode = useCallback(() => {
    if (stateRef.current !== 'bag_ready' && kioskScreenId !== 'SBD-003') return;

    updateLocalState('barcode_reading');
    updateSimulatorState('barcode_reading').catch(() => {});

    scheduleSafeTimeout(() => {
      if (stateRef.current !== 'barcode_reading') return;
      updateLocalState('ready_to_convey');
      simulateScanBoardingPass().catch(() => {});
    }, 1000);
  }, [kioskScreenId, scheduleSafeTimeout, updateLocalState]);

  // Step 3.5: QRコード決済を完了する（SBD-P01表示中）
  const handleCompletePayment = useCallback(() => {
    setPaymentCompleted(true);
    simulateCompletePayment().catch(() => {});
  }, []);

  // Step 4: Attach Heavy Tag
  const handleAttachHeavyTag = useCallback(() => {
    setHeavyTagAttached(true);
    simulateAttachHeavyTag().catch(() => {});
  }, []);

  // Reset
  const handleReset = useCallback(() => {
    clearAllTimers();
    setBagMisplaced(false);
    setBagNeedsTray(false);
    setHasTray(false);
    hasTrayRef.current = false;
    setPaymentCompleted(false);
    setHeavyTagIssued(false);
    setHeavyTagAttached(false);
    updateLocalState('idle');
    simulateReset()
      .then((data) => {
        if (data.sessionId) {
          sessionIdRef.current = data.sessionId;
        }
        setKioskScreenId(data.screenId);
      })
      .catch(() => {});
  }, [clearAllTimers, updateLocalState]);

  const handleOpenKioskWindow = () => {
    window.open(
      '/?window=kiosk',
      'sbd_kiosk_window',
      'width=1280,height=820,menubar=no,toolbar=no,location=no,status=no'
    );
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#0b253c] flex flex-col">
      {/* Compact Header */}
      <header className="bg-white border-b border-slate-300 px-4 py-2 shadow-xs">
        <div className="max-w-[820px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[18px] font-extrabold tracking-tight text-[#0b253c]">
              手荷物預け入れシミュレーター
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-bold text-[#0b253c]">
              <Activity className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
              <span>{STATE_LABELS_JA[state]}</span>
              <span className="text-slate-400">|</span>
              <span className="font-mono text-teal-800">
                SBD画面: {kioskScreenId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenKioskWindow}
              className="min-h-[36px] px-3 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
              title="SBDキオスク画面（Reactアプリ）を別ウィンドウで開きます"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span>SBD画面を別Windowで開く</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="min-h-[36px] px-3.5 py-1 rounded-xl border-2 border-slate-600 bg-white hover:bg-slate-100 active:scale-[0.99] text-[#0b253c] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
              <span>リセット</span>
            </button>
          </div>
        </div>
      </header>

      {/* Single-Column Simulator Layout */}
      <main className="flex-1 max-w-[820px] w-full mx-auto px-4 py-2.5 flex flex-col gap-2.5">
        <div className="w-full h-[310px]">
          <SimulatorScene
            state={state}
            kioskScreenId={kioskScreenId}
            weightKg={weightKg}
            bagShape={bagShape}
            hasTray={hasTray}
            bagNeedsTray={bagNeedsTray}
            bagMisplaced={bagMisplaced}
            paymentCompleted={paymentCompleted}
            heavyTagIssued={heavyTagIssued}
            heavyTagAttached={heavyTagAttached}
            onBagDropped={handleBagDropped}
            onTakeTray={handleTakeTray}
            onScanBarcode={handleScanBarcode}
            onCompletePayment={handleCompletePayment}
            onAttachHeavyTag={handleAttachHeavyTag}
          />
        </div>

        <SimulatorControls
          state={state}
          kioskScreenId={kioskScreenId}
          weightKg={weightKg}
          bagShape={bagShape}
          hasTray={hasTray}
          bagNeedsTray={bagNeedsTray}
          bagMisplaced={bagMisplaced}
          paymentCompleted={paymentCompleted}
          heavyTagIssued={heavyTagIssued}
          heavyTagAttached={heavyTagAttached}
          onChangeWeight={handleChangeWeight}
          onChangeBagShape={handleChangeBagShape}
          onTakeTray={handleTakeTray}
          onCallPerson={handleCallPerson}
          onPlaceBag={handlePlaceBag}
          onPlaceBagMisplaced={handlePlaceBagMisplaced}
          onScanBarcode={handleScanBarcode}
          onCompletePayment={handleCompletePayment}
          onAttachHeavyTag={handleAttachHeavyTag}
        />
      </main>
    </div>
  );
};
