import type {
  BagShape,
  KioskActionType,
  ScreenId,
  SbdSessionState,
} from '../types/sbd';
import type { SimulationState } from '../simulator/types';

const API_BASE = '/api';
const STORAGE_KEY = 'sbd_shared_session_v1';
const CHANNEL_NAME = 'sbd_sync_channel_v1';

let sessionCounter = 1;
let verifyTimer: ReturnType<typeof setTimeout> | null = null;
let paymentTimer: ReturnType<typeof setTimeout> | null = null;
let conveyTimer: ReturnType<typeof setTimeout> | null = null;
let receiptTimer: ReturnType<typeof setTimeout> | null = null;
let returnTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<(state: SbdSessionState) => void>();
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data && typeof event.data === 'object' && event.data.screenId) {
        notifyListeners(event.data as SbdSessionState, false);
      }
    };
  } catch {
    // ignore
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as SbdSessionState;
        notifyListeners(parsed, false);
      } catch {
        // ignore
      }
    }
  });
}

export function createInitialClientSessionState(
  checkedCount = 0,
  previousWeight = 0,
  keepPerson = false,
  preserveWeightKg = 24.0,
  preserveBagShape: BagShape = 'suitcase'
): SbdSessionState {
  const currentWeightKg = preserveWeightKg;
  const requiresHeavyTag = currentWeightKg > 20.0;
  const extraFeeYen = currentWeightKg > 20.0 ? 3000 : 0;
  const sessionId = `session-${String(sessionCounter).padStart(3, '0')}`;
  return {
    sessionId,
    screenId: 'SBD-001',
    simulatorState: keepPerson ? 'person_ready' : 'idle',
    bagShape: preserveBagShape,
    hasTray: false,
    bagNeedsTray: false,
    heavyTagWarningOpen: false,
    language: 'ja',
    cancelModalOpen: false,
    staffCalling: false,
    hazardousWarningOpen: false,
    bagMisplaced: false,
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
      currentWeightKg,
      freeAllowanceKg: 20.0,
      totalWeightKg: Number((previousWeight + currentWeightKg).toFixed(1)),
      checkedCount,
      extraFeeYen,
      requiresHeavyTag,
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
}

function clearLocalTimers() {
  if (verifyTimer) {
    clearTimeout(verifyTimer);
    verifyTimer = null;
  }
  if (paymentTimer) {
    clearTimeout(paymentTimer);
    paymentTimer = null;
  }
  if (conveyTimer) {
    clearTimeout(conveyTimer);
    conveyTimer = null;
  }
  if (receiptTimer) {
    clearTimeout(receiptTimer);
    receiptTimer = null;
  }
  if (returnTimer) {
    clearTimeout(returnTimer);
    returnTimer = null;
  }
}

export function getLocalSharedState(): SbdSessionState {
  if (typeof window === 'undefined') {
    return createInitialClientSessionState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as SbdSessionState;
    }
  } catch {
    // ignore
  }
  const initial = createInitialClientSessionState();
  saveLocalSharedState(initial, false);
  return initial;
}

function notifyListeners(state: SbdSessionState, broadcast = true) {
  for (const listener of listeners) {
    listener(state);
  }
  if (broadcast && broadcastChannel) {
    try {
      broadcastChannel.postMessage(state);
    } catch {
      // ignore
    }
  }
}

export function saveLocalSharedState(
  state: SbdSessionState,
  broadcast = true
): SbdSessionState {
  const next: SbdSessionState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
  notifyListeners(next, broadcast);
  return next;
}

export function subscribeSessionEvents(
  onUpdate: (state: SbdSessionState) => void
): () => void {
  listeners.add(onUpdate);
  let eventSource: EventSource | null = null;

  if (typeof window !== 'undefined' && 'EventSource' in window) {
    try {
      eventSource = new EventSource(`${API_BASE}/events`);
      eventSource.onmessage = (event) => {
        try {
          const parsed: SbdSessionState = JSON.parse(event.data);
          saveLocalSharedState(parsed, false);
        } catch {
          // ignore
        }
      };
      eventSource.onerror = () => {
        // On Vercel static hosting, /api/events will not be an SSE stream; close it cleanly and rely on BroadcastChannel + localStorage
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
      };
    } catch {
      // ignore
    }
  }

  return () => {
    listeners.delete(onUpdate);
    if (eventSource) {
      eventSource.close();
    }
  };
}

function applyLocalWeightKg(state: SbdSessionState, weightKg: number) {
  state.baggageInfo.currentWeightKg = Number(weightKg.toFixed(1));
  state.baggageInfo.totalWeightKg = Number(weightKg.toFixed(1));
  state.baggageInfo.requiresHeavyTag = weightKg > 20.0;
  state.baggageInfo.extraFeeYen = weightKg > 20.0 ? 3000 : 0;
}

function startLocalReceiptPrintingSequence(
  state: SbdSessionState,
  printDurationMs = 5000
) {
  if (receiptTimer) clearTimeout(receiptTimer);
  const activeSessionId = state.sessionId;
  state.deviceStatus.conveying = false;
  state.deviceStatus.receiptPrinted = false;
  state.simulatorState = 'completed';
  state.screenId = 'SBD-010';
  state.countdownSeconds = 30;

  receiptTimer = setTimeout(() => {
    const current = getLocalSharedState();
    if (current.sessionId !== activeSessionId) return;
    if (current.screenId === 'SBD-010') {
      current.deviceStatus.receiptPrinted = true;
      current.countdownSeconds = 30;
      saveLocalSharedState(current, true);
    }
  }, printDurationMs);
}

function startLocalConveyingSequence(
  state: SbdSessionState,
  conveyDurationMs = 5000
) {
  if (conveyTimer) clearTimeout(conveyTimer);
  if (receiptTimer) clearTimeout(receiptTimer);
  if (returnTimer) clearTimeout(returnTimer);
  const activeSessionId = state.sessionId;
  state.heavyTagWarningOpen = false;
  state.deviceStatus.conveying = true;
  state.deviceStatus.receiptPrinted = false;
  state.simulatorState = 'conveying';
  state.screenId = 'SBD-009';

  conveyTimer = setTimeout(() => {
    const current = getLocalSharedState();
    if (current.sessionId !== activeSessionId) return;
    if (
      current.screenId === 'SBD-009' ||
      current.simulatorState === 'conveying'
    ) {
      startLocalReceiptPrintingSequence(current, 5000);
      saveLocalSharedState(current, true);
    }
  }, conveyDurationMs);
}

function startLocalHeavyTagMissingReturnSequence(state: SbdSessionState) {
  if (conveyTimer) clearTimeout(conveyTimer);
  if (returnTimer) clearTimeout(returnTimer);
  const activeSessionId = state.sessionId;
  state.heavyTagWarningOpen = false;
  state.deviceStatus.conveying = true;
  state.simulatorState = 'conveying';
  state.screenId = 'SBD-009';

  conveyTimer = setTimeout(() => {
    const current = getLocalSharedState();
    if (current.sessionId !== activeSessionId) return;
    current.simulatorState = 'returning';
    saveLocalSharedState(current, true);

    returnTimer = setTimeout(() => {
      const latest = getLocalSharedState();
      if (latest.sessionId !== activeSessionId) return;
      latest.deviceStatus.conveying = false;
      latest.simulatorState = 'ready_to_convey';
      latest.screenId = 'SBD-007';
      latest.heavyTagWarningOpen = true;
      saveLocalSharedState(latest, true);
    }, 2200);
  }, 2500);
}

function startLocalPaymentCompleteSequence(
  state: SbdSessionState,
  delayMs = 2200
) {
  if (paymentTimer) clearTimeout(paymentTimer);
  const activeSessionId = state.sessionId;
  state.deviceStatus.paymentCompleted = true;

  paymentTimer = setTimeout(() => {
    const current = getLocalSharedState();
    if (current.sessionId !== activeSessionId) return;
    if (current.screenId === 'SBD-P01') {
      if (current.baggageInfo.currentWeightKg > 20.0) {
        current.baggageInfo.requiresHeavyTag = true;
        current.deviceStatus.heavyTagIssued = true;
        current.deviceStatus.heavyTagAttached = false;
        current.heavyTagWarningOpen = false;
        current.screenId = 'SBD-007';
      } else {
        current.baggageInfo.requiresHeavyTag = false;
        startLocalConveyingSequence(current, 5000);
      }
      saveLocalSharedState(current, true);
    }
  }, delayMs);
}

async function tryFetchJson(
  url: string,
  options?: RequestInit
): Promise<SbdSessionState | null> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      return null;
    }
    const data = (await res.json()) as SbdSessionState;
    return saveLocalSharedState(data, true);
  } catch {
    return null;
  }
}

export async function getSessionState(): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/session`);
  if (remote) return remote;
  return getLocalSharedState();
}

export async function sendKioskAction(
  action: KioskActionType
): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/kiosk/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  if (remote) return remote;

  let state = getLocalSharedState();
  switch (action) {
    case 'CONFIRM_CONTENTS_NO':
      state.hazardousWarningOpen = false;
      state.screenId = 'SBD-003';
      break;
    case 'CONFIRM_CONTENTS_YES':
      state.hazardousWarningOpen = true;
      break;
    case 'DISMISS_HAZARDOUS_WARNING':
      state.hazardousWarningOpen = false;
      break;
    case 'DISMISS_BAG_MISPLACED':
      state.bagMisplaced = false;
      break;
    case 'DISMISS_TRAY_REQUIRED':
      state.bagNeedsTray = false;
      break;
    case 'DISMISS_HEAVY_TAG_WARNING':
      state.heavyTagWarningOpen = false;
      break;
    case 'CONFIRM_FLIGHT':
      state.screenId = 'SBD-006';
      break;
    case 'CONFIRM_WEIGHT':
      if (state.baggageInfo.currentWeightKg > 20.0) {
        state.baggageInfo.requiresHeavyTag = true;
        state.baggageInfo.extraFeeYen = 3000;
        state.deviceStatus.paymentCompleted = false;
        state.screenId = 'SBD-P01';
      } else {
        state.baggageInfo.requiresHeavyTag = false;
        state.baggageInfo.extraFeeYen = 0;
        startLocalConveyingSequence(state, 5000);
      }
      break;
    case 'COMPLETE_PAYMENT':
      if (!state.deviceStatus.paymentCompleted) {
        startLocalPaymentCompleteSequence(state, 2200);
      }
      break;
    case 'CONFIRM_HEAVY_TAG':
      if (!state.deviceStatus.heavyTagAttached) {
        startLocalHeavyTagMissingReturnSequence(state);
      } else {
        state.heavyTagWarningOpen = false;
        startLocalConveyingSequence(state, 5000);
      }
      break;
    case 'ADD_ANOTHER_BAG': {
      clearLocalTimers();
      const newCount = state.baggageInfo.checkedCount + 1;
      const prevTotal = state.baggageInfo.totalWeightKg;
      const currentLang = state.language;
      const currentWeight = state.baggageInfo.currentWeightKg;
      const currentShape = state.bagShape || 'suitcase';
      state = createInitialClientSessionState(
        newCount,
        prevTotal,
        true,
        currentWeight,
        currentShape
      );
      state.language = currentLang;
      break;
    }
    case 'EXTEND_TIME':
      state.countdownSeconds = Math.min(state.countdownSeconds + 30, 99);
      break;
    case 'OPEN_CANCEL_MODAL':
      state.cancelModalOpen = true;
      break;
    case 'CLOSE_CANCEL_MODAL':
      state.cancelModalOpen = false;
      break;
    case 'CONFIRM_CANCEL': {
      clearLocalTimers();
      sessionCounter += 1;
      const currentLang = state.language;
      const currentWeight = state.baggageInfo.currentWeightKg;
      const currentShape = state.bagShape || 'suitcase';
      state = createInitialClientSessionState(
        0,
        0,
        false,
        currentWeight,
        currentShape
      );
      state.language = currentLang;
      break;
    }
    case 'CALL_STAFF':
      state.staffCalling = true;
      break;
    case 'DISMISS_STAFF':
      state.staffCalling = false;
      break;
    case 'TOGGLE_LANGUAGE':
      state.language = state.language === 'ja' ? 'en' : 'ja';
      break;
  }

  return saveLocalSharedState(state, true);
}

export async function updateSimulatorState(
  simulatorState: SimulationState
): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/device/simulator-state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ simulatorState }),
  });
  if (remote) return remote;

  const state = getLocalSharedState();
  state.simulatorState = simulatorState;
  return saveLocalSharedState(state, true);
}

export async function simulateSetBagShape(
  bagShape: BagShape
): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/device/bag-shape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bagShape }),
  });
  if (remote) return remote;

  const state = getLocalSharedState();
  state.bagShape = bagShape;
  if (bagShape === 'suitcase') {
    state.bagNeedsTray = false;
    state.hasTray = false;
  }
  return saveLocalSharedState(state, true);
}

export async function simulateTakeTray(): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/device/take-tray`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (remote) return remote;

  const state = getLocalSharedState();
  const wasWaitingForTrayOnBelt = state.bagNeedsTray;
  state.hasTray = true;
  state.bagNeedsTray = false;
  if (wasWaitingForTrayOnBelt && !state.bagMisplaced) {
    state.deviceStatus.bagPlaced = true;
    state.deviceStatus.tagBarcodeRead = true;
    state.simulatorState = 'bag_ready';
    if (state.screenId === 'SBD-001') {
      state.screenId = 'SBD-002';
    }
  }
  return saveLocalSharedState(state, true);
}

export async function simulatePlaceBag(params?: {
  weightKg?: number;
  requiresHeavyTag?: boolean;
  misplaced?: boolean;
}): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/device/place-bag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params || {}),
  });
  if (remote) return remote;

  const state = getLocalSharedState();
  if (typeof params?.weightKg === 'number') {
    applyLocalWeightKg(state, params.weightKg);
  }

  if (params?.misplaced === true) {
    state.bagMisplaced = true;
    state.bagNeedsTray = false;
    state.deviceStatus.bagPlaced = false;
    state.simulatorState = 'person_ready';
    return saveLocalSharedState(state, true);
  }

  if (state.bagShape === 'knapsack' && !state.hasTray) {
    state.bagMisplaced = false;
    state.bagNeedsTray = true;
    state.deviceStatus.bagPlaced = false;
    state.simulatorState = 'person_ready';
    return saveLocalSharedState(state, true);
  }

  state.bagMisplaced = false;
  state.bagNeedsTray = false;
  state.deviceStatus.bagPlaced = true;
  state.deviceStatus.tagBarcodeRead = true;
  state.simulatorState = 'bag_ready';
  if (state.screenId === 'SBD-001') {
    state.screenId = 'SBD-002';
  }
  return saveLocalSharedState(state, true);
}

export async function simulateMeasureWeight(
  weightKg: number
): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/device/measure-weight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weightKg }),
  });
  if (remote) return remote;

  const state = getLocalSharedState();
  applyLocalWeightKg(state, weightKg);
  return saveLocalSharedState(state, true);
}

export async function simulateCompletePayment(): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/device/complete-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (remote) return remote;

  const state = getLocalSharedState();
  if (!state.deviceStatus.paymentCompleted) {
    startLocalPaymentCompleteSequence(state, 2200);
  }
  return saveLocalSharedState(state, true);
}

export async function simulateAttachHeavyTag(): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/device/attach-heavy-tag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (remote) return remote;

  const state = getLocalSharedState();
  state.deviceStatus.heavyTagAttached = true;
  state.heavyTagWarningOpen = false;
  return saveLocalSharedState(state, true);
}

export async function simulateScanBoardingPass(params?: {
  verifyDelayMs?: number;
}): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/device/scan-boarding-pass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params || {}),
  });
  if (remote) return remote;

  const state = getLocalSharedState();
  const activeSessionId = state.sessionId;
  state.deviceStatus.boardingPassScanned = true;
  state.simulatorState = 'ready_to_convey';
  state.screenId = 'SBD-004';
  const saved = saveLocalSharedState(state, true);

  const delayMs =
    typeof params?.verifyDelayMs === 'number' ? params.verifyDelayMs : 1800;
  if (delayMs > 0) {
    if (verifyTimer) clearTimeout(verifyTimer);
    verifyTimer = setTimeout(() => {
      const current = getLocalSharedState();
      if (current.sessionId !== activeSessionId) return;
      if (current.screenId === 'SBD-004') {
        current.screenId = 'SBD-005';
        saveLocalSharedState(current, true);
      }
    }, delayMs);
  }
  return saved;
}

export async function simulateVerifyComplete(): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/device/verify-complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (remote) return remote;

  if (verifyTimer) clearTimeout(verifyTimer);
  const state = getLocalSharedState();
  state.screenId = 'SBD-005';
  return saveLocalSharedState(state, true);
}

export async function simulateConveyComplete(): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/device/convey-complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (remote) return remote;

  if (conveyTimer) clearTimeout(conveyTimer);
  const state = getLocalSharedState();
  startLocalReceiptPrintingSequence(state, 5000);
  return saveLocalSharedState(state, true);
}

export async function simulateGotoScreen(
  screenId: ScreenId,
  cancelModalOpen = false
): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/device/goto-screen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ screenId, cancelModalOpen }),
  });
  if (remote) return remote;

  clearLocalTimers();
  const state = getLocalSharedState();
  state.screenId = screenId;
  state.bagMisplaced = false;
  state.bagNeedsTray = false;
  state.cancelModalOpen = cancelModalOpen;
  if (screenId === 'SBD-001') {
    state.simulatorState = 'idle';
  } else if (screenId === 'SBD-002' || screenId === 'SBD-003') {
    state.simulatorState = 'bag_ready';
  } else if (
    screenId === 'SBD-004' ||
    screenId === 'SBD-005' ||
    screenId === 'SBD-006' ||
    screenId === 'SBD-P01'
  ) {
    state.simulatorState = 'ready_to_convey';
    if (screenId === 'SBD-P01') {
      state.deviceStatus.paymentCompleted = false;
    }
  } else if (screenId === 'SBD-007') {
    state.simulatorState = 'ready_to_convey';
    state.deviceStatus.heavyTagIssued = true;
    state.deviceStatus.heavyTagAttached = false;
  } else if (screenId === 'SBD-009') {
    startLocalConveyingSequence(state, 5000);
  } else if (screenId === 'SBD-010') {
    startLocalReceiptPrintingSequence(state, 5000);
  }
  return saveLocalSharedState(state, true);
}

export async function simulateReset(): Promise<SbdSessionState> {
  const remote = await tryFetchJson(`${API_BASE}/device/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (remote) return remote;

  clearLocalTimers();
  sessionCounter += 1;
  const current = getLocalSharedState();
  const next = createInitialClientSessionState(
    0,
    0,
    false,
    current.baggageInfo.currentWeightKg,
    current.bagShape || 'suitcase'
  );
  return saveLocalSharedState(next, true);
}
