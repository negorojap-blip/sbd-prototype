import { useState, useEffect, useCallback } from 'react';
import type { KioskActionType, ScreenId, SbdSessionState } from '../types/sbd';
import {
  getSessionState,
  subscribeSessionEvents,
  sendKioskAction,
  simulatePlaceBag,
  simulateScanBoardingPass,
  simulateVerifyComplete,
  simulateConveyComplete,
  simulateGotoScreen,
  simulateReset,
} from '../api/sbdApi';

const DEFAULT_STATE: SbdSessionState = {
  screenId: 'SBD-001',
  language: 'ja',
  cancelModalOpen: false,
  staffCalling: false,
  hazardousWarningOpen: false,
  bagMisplaced: false,
  bagShape: 'suitcase',
  hasTray: false,
  bagNeedsTray: false,
  heavyTagWarningOpen: false,
  flightInfo: {
    origin: '東京 (羽田)',
    originEn: 'Tokyo (Haneda)',
    destination: '札幌 (新千歳)',
    destinationEn: 'Sapporo (New Chitose)',
    airportCode: 'CTS',
    flightNumber: 'AB 123',
    departureDate: '2026年10月17日',
    departureDateEn: 'Oct 17, 2026',
    departureTime: '14:30',
  },
  baggageInfo: {
    currentWeightKg: 24.0,
    freeAllowanceKg: 20.0,
    totalWeightKg: 24.0,
    checkedCount: 0,
    extraFeeYen: 3000,
    requiresHeavyTag: true,
  },
  deviceStatus: {
    bagPlaced: false,
    tagBarcodeRead: false,
    boardingPassScanned: false,
    paymentCompleted: false,
    heavyTagIssued: false,
    heavyTagAttached: false,
    conveying: false,
    receiptPrinted: false,
  },
  countdownSeconds: 30,
  updatedAt: new Date().toISOString(),
};

export function useSbdSession() {
  const [session, setSession] = useState<SbdSessionState>(DEFAULT_STATE);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    getSessionState()
      .then((data) => {
        setSession(data);
        setConnected(true);
      })
      .catch(() => {
        setConnected(false);
      });

    const unsubscribe = subscribeSessionEvents((updated) => {
      setSession(updated);
      setConnected(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session.screenId !== 'SBD-010') return;

    const timer = setInterval(() => {
      setSession((prev) => {
        if (prev.screenId !== 'SBD-010') return prev;
        if (prev.countdownSeconds <= 1) {
          simulateReset().catch(() => {});
          return { ...prev, screenId: 'SBD-001', countdownSeconds: 30 };
        }
        return { ...prev, countdownSeconds: prev.countdownSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session.screenId]);

  const dispatchAction = useCallback(async (action: KioskActionType) => {
    try {
      const updated = await sendKioskAction(action);
      setSession(updated);
    } catch {
      setSession((prev) => applyLocalFallback(prev, action));
    }
  }, []);

  const triggerDeviceEvent = useCallback(
    async (
      type:
        | 'PLACE_BAG'
        | 'SCAN_BOARDING_PASS'
        | 'VERIFY_COMPLETE'
        | 'CONVEY_COMPLETE'
        | 'RESET',
      screenId?: ScreenId,
      cancelModalOpen?: boolean
    ) => {
      try {
        let updated: SbdSessionState;
        if (screenId) {
          updated = await simulateGotoScreen(screenId, cancelModalOpen);
        } else if (type === 'PLACE_BAG') {
          updated = await simulatePlaceBag();
        } else if (type === 'SCAN_BOARDING_PASS') {
          updated = await simulateScanBoardingPass();
        } else if (type === 'VERIFY_COMPLETE') {
          updated = await simulateVerifyComplete();
        } else if (type === 'CONVEY_COMPLETE') {
          updated = await simulateConveyComplete();
        } else {
          updated = await simulateReset();
        }
        setSession(updated);
      } catch {
        // ignore
      }
    },
    []
  );

  return {
    session,
    connected,
    dispatchAction,
    triggerDeviceEvent,
  };
}

function applyLocalFallback(
  prev: SbdSessionState,
  action: KioskActionType
): SbdSessionState {
  switch (action) {
    case 'CONFIRM_CONTENTS_NO':
      return { ...prev, screenId: 'SBD-003', hazardousWarningOpen: false };
    case 'CONFIRM_CONTENTS_YES':
      return { ...prev, hazardousWarningOpen: true };
    case 'DISMISS_HAZARDOUS_WARNING':
      return { ...prev, hazardousWarningOpen: false };
    case 'DISMISS_BAG_MISPLACED':
      return { ...prev, bagMisplaced: false };
    case 'DISMISS_TRAY_REQUIRED':
      return { ...prev, bagNeedsTray: false };
    case 'DISMISS_HEAVY_TAG_WARNING':
      return { ...prev, heavyTagWarningOpen: false };
    case 'CONFIRM_FLIGHT':
      return { ...prev, screenId: 'SBD-006' };
    case 'CONFIRM_WEIGHT':
      return {
        ...prev,
        screenId:
          prev.baggageInfo.currentWeightKg > 20.0 ? 'SBD-P01' : 'SBD-009',
      };
    case 'COMPLETE_PAYMENT':
      return {
        ...prev,
        screenId:
          prev.baggageInfo.currentWeightKg > 20.0 ? 'SBD-007' : 'SBD-009',
      };
    case 'CONFIRM_HEAVY_TAG':
      return { ...prev, screenId: 'SBD-009' };
    case 'ADD_ANOTHER_BAG':
      return { ...DEFAULT_STATE, language: prev.language };
    case 'EXTEND_TIME':
      return {
        ...prev,
        countdownSeconds: Math.min(prev.countdownSeconds + 30, 99),
      };
    case 'OPEN_CANCEL_MODAL':
      return { ...prev, cancelModalOpen: true };
    case 'CLOSE_CANCEL_MODAL':
      return { ...prev, cancelModalOpen: false };
    case 'CONFIRM_CANCEL':
      return { ...DEFAULT_STATE, language: prev.language };
    case 'CALL_STAFF':
      return { ...prev, staffCalling: true };
    case 'DISMISS_STAFF':
      return { ...prev, staffCalling: false };
    case 'TOGGLE_LANGUAGE':
      return { ...prev, language: prev.language === 'ja' ? 'en' : 'ja' };
    default:
      return prev;
  }
}
