import type { SimulationState } from '../simulator/types';

export type ScreenId =
  | 'SBD-001'
  | 'SBD-002'
  | 'SBD-003'
  | 'SBD-004'
  | 'SBD-005'
  | 'SBD-006'
  | 'SBD-P01'
  | 'SBD-007'
  | 'SBD-009'
  | 'SBD-010';

export type StepNumber = 1 | 2 | 3 | 4;

export type Language = 'ja' | 'en';

export type BagShape = 'suitcase' | 'knapsack';

export interface FlightInfo {
  origin: string;
  originEn: string;
  destination: string;
  destinationEn: string;
  airportCode: string;
  flightNumber: string;
  departureDate: string;
  departureDateEn: string;
  departureTime: string;
}

export interface BaggageInfo {
  currentWeightKg: number;
  freeAllowanceKg: number;
  totalWeightKg: number;
  checkedCount: number;
  extraFeeYen: number;
  requiresHeavyTag: boolean;
}

export interface DeviceStatus {
  bagPlaced: boolean;
  tagBarcodeRead: boolean;
  boardingPassScanned: boolean;
  paymentCompleted?: boolean;
  heavyTagIssued: boolean;
  heavyTagAttached?: boolean;
  conveying: boolean;
  receiptPrinted: boolean;
}

export interface SbdSessionState {
  sessionId?: string;
  screenId: ScreenId;
  simulatorState?: SimulationState;
  bagShape?: BagShape;
  hasTray?: boolean;
  bagNeedsTray?: boolean;
  heavyTagWarningOpen?: boolean;
  language: Language;
  cancelModalOpen: boolean;
  staffCalling: boolean;
  hazardousWarningOpen: boolean;
  bagMisplaced?: boolean;
  flightInfo: FlightInfo;
  baggageInfo: BaggageInfo;
  deviceStatus: DeviceStatus;
  countdownSeconds: number;
  updatedAt: string;
}

export type KioskActionType =
  | 'CONFIRM_CONTENTS_NO'
  | 'CONFIRM_CONTENTS_YES'
  | 'DISMISS_HAZARDOUS_WARNING'
  | 'DISMISS_BAG_MISPLACED'
  | 'DISMISS_TRAY_REQUIRED'
  | 'DISMISS_HEAVY_TAG_WARNING'
  | 'CONFIRM_FLIGHT'
  | 'CONFIRM_WEIGHT'
  | 'COMPLETE_PAYMENT'
  | 'CONFIRM_HEAVY_TAG'
  | 'ADD_ANOTHER_BAG'
  | 'EXTEND_TIME'
  | 'OPEN_CANCEL_MODAL'
  | 'CLOSE_CANCEL_MODAL'
  | 'CONFIRM_CANCEL'
  | 'CALL_STAFF'
  | 'DISMISS_STAFF'
  | 'TOGGLE_LANGUAGE';

export const SCREEN_STEP_MAP: Record<ScreenId, StepNumber> = {
  'SBD-001': 1,
  'SBD-002': 1,
  'SBD-003': 2,
  'SBD-004': 2,
  'SBD-005': 2,
  'SBD-006': 3,
  'SBD-P01': 3,
  'SBD-007': 3,
  'SBD-009': 4,
  'SBD-010': 4,
};
