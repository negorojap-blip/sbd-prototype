import type { IncomingMessage, ServerResponse } from 'http';

export type SimulatorStateType =
  | 'idle'
  | 'person_arriving'
  | 'person_ready'
  | 'bag_placing'
  | 'bag_ready'
  | 'barcode_reading'
  | 'ready_to_convey'
  | 'conveying'
  | 'returning'
  | 'completed';

export type BagShapeType = 'suitcase' | 'knapsack';

export interface ServerSessionState {
  sessionId: string;
  screenId:
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
  simulatorState: SimulatorStateType;
  bagShape: BagShapeType;
  hasTray: boolean;
  bagNeedsTray: boolean;
  heavyTagWarningOpen: boolean;
  language: 'ja' | 'en';
  cancelModalOpen: boolean;
  staffCalling: boolean;
  hazardousWarningOpen: boolean;
  bagMisplaced: boolean;
  flightInfo: {
    origin: string;
    originEn: string;
    destination: string;
    destinationEn: string;
    airportCode: string;
    flightNumber: string;
    departureDate: string;
    departureDateEn: string;
    departureTime: string;
  };
  baggageInfo: {
    currentWeightKg: number;
    freeAllowanceKg: number;
    totalWeightKg: number;
    checkedCount: number;
    extraFeeYen: number;
    requiresHeavyTag: boolean;
  };
  deviceStatus: {
    bagPlaced: boolean;
    tagBarcodeRead: boolean;
    boardingPassScanned: boolean;
    paymentCompleted: boolean;
    heavyTagIssued: boolean;
    heavyTagAttached: boolean;
    conveying: boolean;
    receiptPrinted: boolean;
  };
  countdownSeconds: number;
  updatedAt: string;
}

let sessionCounter = 1;

export function createInitialSessionState(
  checkedCount = 0,
  previousWeight = 0,
  keepPerson = false,
  preserveWeightKg = 24.0,
  preserveBagShape: BagShapeType = 'suitcase'
): ServerSessionState {
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

export function createSbdApiMiddleware() {
  let state: ServerSessionState = createInitialSessionState();
  const sseClients = new Set<ServerResponse>();
  let verifyTimer: ReturnType<typeof setTimeout> | null = null;
  let paymentTimer: ReturnType<typeof setTimeout> | null = null;
  let conveyTimer: ReturnType<typeof setTimeout> | null = null;
  let returnTimer: ReturnType<typeof setTimeout> | null = null;

  function clearTimers() {
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
    if (returnTimer) {
      clearTimeout(returnTimer);
      returnTimer = null;
    }
  }

  function broadcastState() {
    state.updatedAt = new Date().toISOString();
    const payload = `data: ${JSON.stringify(state)}\n\n`;
    for (const client of sseClients) {
      client.write(payload);
    }
  }

  function applyWeightKg(weightKg: number) {
    state.baggageInfo.currentWeightKg = Number(weightKg.toFixed(1));
    state.baggageInfo.totalWeightKg = Number(weightKg.toFixed(1));
    state.baggageInfo.requiresHeavyTag = weightKg > 20.0;
    state.baggageInfo.extraFeeYen = weightKg > 20.0 ? 3000 : 0;
  }

  function startPaymentCompleteSequence(delayMs = 2200) {
    if (paymentTimer) clearTimeout(paymentTimer);
    const activeSessionId = state.sessionId;
    state.deviceStatus.paymentCompleted = true;

    paymentTimer = setTimeout(() => {
      if (state.sessionId !== activeSessionId) return;
      if (state.screenId === 'SBD-P01') {
        if (state.baggageInfo.currentWeightKg > 20.0) {
          state.baggageInfo.requiresHeavyTag = true;
          state.deviceStatus.heavyTagIssued = true;
          state.deviceStatus.heavyTagAttached = false;
          state.heavyTagWarningOpen = false;
          state.screenId = 'SBD-007';
        } else {
          state.baggageInfo.requiresHeavyTag = false;
          startConveyingSequence(5000);
        }
        broadcastState();
      }
    }, delayMs);
  }

  function startConveyingSequence(conveyDurationMs = 5000) {
    if (conveyTimer) clearTimeout(conveyTimer);
    if (returnTimer) clearTimeout(returnTimer);
    const activeSessionId = state.sessionId;
    state.heavyTagWarningOpen = false;
    state.deviceStatus.conveying = true;
    state.simulatorState = 'conveying';
    state.screenId = 'SBD-009';

    conveyTimer = setTimeout(() => {
      if (state.sessionId !== activeSessionId) return;
      if (state.screenId === 'SBD-009' || state.simulatorState === 'conveying') {
        state.deviceStatus.conveying = false;
        state.deviceStatus.receiptPrinted = true;
        state.simulatorState = 'completed';
        state.screenId = 'SBD-010';
        state.countdownSeconds = 30;
        broadcastState();
      }
    }, conveyDurationMs);
  }

  function startHeavyTagMissingReturnSequence() {
    if (conveyTimer) clearTimeout(conveyTimer);
    if (returnTimer) clearTimeout(returnTimer);
    const activeSessionId = state.sessionId;
    state.heavyTagWarningOpen = false;
    state.deviceStatus.conveying = true;
    state.simulatorState = 'conveying';
    state.screenId = 'SBD-009';

    // 1. Move slowly partway into tunnel (2.5s), then sensor detects missing heavy tag and reverses belt!
    conveyTimer = setTimeout(() => {
      if (state.sessionId !== activeSessionId) return;
      state.simulatorState = 'returning';
      broadcastState();

      // 2. After returning slowly to front of belt (2.2s), return screen to SBD-007 and open warning popup!
      returnTimer = setTimeout(() => {
        if (state.sessionId !== activeSessionId) return;
        state.deviceStatus.conveying = false;
        state.simulatorState = 'ready_to_convey';
        state.screenId = 'SBD-007';
        state.heavyTagWarningOpen = true;
        broadcastState();
      }, 2200);
    }, 2500);
  }

  function readJsonBody(req: IncomingMessage): Promise<Record<string, any>> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        if (!body) return resolve({});
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({});
        }
      });
    });
  }

  function sendJson(res: ServerResponse, status: number, data: unknown) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end(JSON.stringify(data));
  }

  return async function sbdMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    const url = req.url?.split('?')[0] || '';
    if (!url.startsWith('/api/')) {
      return next();
    }

    if (req.method === 'OPTIONS') {
      return sendJson(res, 200, { ok: true });
    }

    // 1. SSE Event Stream
    if (req.method === 'GET' && url === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });
      res.write(`data: ${JSON.stringify(state)}\n\n`);
      sseClients.add(res);
      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    // 2. GET /api/session
    if (req.method === 'GET' && url === '/api/session') {
      return sendJson(res, 200, state);
    }

    // 3. POST /api/kiosk/action
    if (req.method === 'POST' && url === '/api/kiosk/action') {
      const body = await readJsonBody(req);
      const { action } = body;

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
            startConveyingSequence(5000);
          }
          break;
        case 'COMPLETE_PAYMENT':
          if (!state.deviceStatus.paymentCompleted) {
            startPaymentCompleteSequence(2200);
          }
          break;
        case 'CONFIRM_HEAVY_TAG':
          if (!state.deviceStatus.heavyTagAttached) {
            startHeavyTagMissingReturnSequence();
          } else {
            state.heavyTagWarningOpen = false;
            startConveyingSequence(5000);
          }
          break;
        case 'ADD_ANOTHER_BAG': {
          clearTimers();
          const newCount = state.baggageInfo.checkedCount + 1;
          const prevTotal = state.baggageInfo.totalWeightKg;
          const currentLang = state.language;
          const currentWeight = state.baggageInfo.currentWeightKg;
          const currentShape = state.bagShape;
          state = createInitialSessionState(
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
          clearTimers();
          sessionCounter += 1;
          const currentLang = state.language;
          const currentWeight = state.baggageInfo.currentWeightKg;
          const currentShape = state.bagShape;
          state = createInitialSessionState(
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

      broadcastState();
      return sendJson(res, 200, state);
    }

    // 4. Simulator / Hardware Device REST API Endpoints
    if (req.method === 'POST' && url === '/api/device/simulator-state') {
      const body = await readJsonBody(req);
      if (body.simulatorState) {
        state.simulatorState = body.simulatorState;
      }
      broadcastState();
      return sendJson(res, 200, state);
    }

    // POST /api/device/bag-shape : Switch between 'suitcase' and 'knapsack'
    if (req.method === 'POST' && url === '/api/device/bag-shape') {
      const body = await readJsonBody(req);
      if (body.bagShape === 'suitcase' || body.bagShape === 'knapsack') {
        state.bagShape = body.bagShape;
        if (body.bagShape === 'suitcase') {
          state.bagNeedsTray = false;
          state.hasTray = false;
        }
      }
      broadcastState();
      return sendJson(res, 200, state);
    }

    // POST /api/device/take-tray : User takes a tray (通い箱) in the simulator
    if (req.method === 'POST' && url === '/api/device/take-tray') {
      const wasWaitingForTrayOnBelt = state.bagNeedsTray;
      state.hasTray = true;
      state.bagNeedsTray = false;

      // If the knapsack was already placed on the belt and triggered the tray prompt,
      // putting it into the tray completes placement and advances SBD-001 -> SBD-002!
      if (wasWaitingForTrayOnBelt && !state.bagMisplaced) {
        state.deviceStatus.bagPlaced = true;
        state.deviceStatus.tagBarcodeRead = true;
        state.simulatorState = 'bag_ready';
        if (state.screenId === 'SBD-001') {
          state.screenId = 'SBD-002';
        }
      }

      broadcastState();
      return sendJson(res, 200, state);
    }

    // POST /api/device/place-bag : Placed in correct or incorrect position, or knapsack without tray
    if (req.method === 'POST' && url === '/api/device/place-bag') {
      const body = await readJsonBody(req);
      if (typeof body.weightKg === 'number') {
        applyWeightKg(body.weightKg);
      }

      if (body.misplaced === true) {
        state.bagMisplaced = true;
        state.bagNeedsTray = false;
        state.deviceStatus.bagPlaced = false;
        state.simulatorState = 'person_ready';
        broadcastState();
        return sendJson(res, 200, state);
      }

      // If it's a knapsack and NOT yet inside a tray (通い箱), prompt user on Web App to use a tray!
      if (state.bagShape === 'knapsack' && !state.hasTray) {
        state.bagMisplaced = false;
        state.bagNeedsTray = true;
        state.deviceStatus.bagPlaced = false;
        state.simulatorState = 'person_ready';
        broadcastState();
        return sendJson(res, 200, state);
      }

      // Bag placed in the CORRECT center position (and in tray if knapsack)
      state.bagMisplaced = false;
      state.bagNeedsTray = false;
      state.deviceStatus.bagPlaced = true;
      state.deviceStatus.tagBarcodeRead = true;
      state.simulatorState = 'bag_ready';
      if (state.screenId === 'SBD-001') {
        state.screenId = 'SBD-002';
      }
      broadcastState();
      return sendJson(res, 200, state);
    }

    // POST /api/device/measure-weight
    if (req.method === 'POST' && url === '/api/device/measure-weight') {
      const body = await readJsonBody(req);
      if (typeof body.weightKg === 'number') {
        applyWeightKg(body.weightKg);
      } else if (typeof body.currentWeightKg === 'number') {
        applyWeightKg(body.currentWeightKg);
      }
      broadcastState();
      return sendJson(res, 200, state);
    }

    // POST /api/device/complete-payment
    if (req.method === 'POST' && url === '/api/device/complete-payment') {
      if (!state.deviceStatus.paymentCompleted) {
        startPaymentCompleteSequence(2200);
      }
      broadcastState();
      return sendJson(res, 200, state);
    }

    // POST /api/device/attach-heavy-tag
    if (req.method === 'POST' && url === '/api/device/attach-heavy-tag') {
      state.deviceStatus.heavyTagAttached = true;
      state.heavyTagWarningOpen = false;
      broadcastState();
      return sendJson(res, 200, state);
    }

    // POST /api/device/scan-boarding-pass
    if (req.method === 'POST' && url === '/api/device/scan-boarding-pass') {
      const body = await readJsonBody(req);
      const activeSessionId = state.sessionId;
      state.deviceStatus.boardingPassScanned = true;
      state.simulatorState = 'ready_to_convey';
      if (body.flightInfo) {
        state.flightInfo = { ...state.flightInfo, ...body.flightInfo };
      }
      state.screenId = 'SBD-004';
      broadcastState();

      const delayMs =
        typeof body.verifyDelayMs === 'number' ? body.verifyDelayMs : 1800;
      if (delayMs > 0) {
        if (verifyTimer) clearTimeout(verifyTimer);
        verifyTimer = setTimeout(() => {
          if (state.sessionId !== activeSessionId) return;
          if (state.screenId === 'SBD-004') {
            state.screenId = 'SBD-005';
            broadcastState();
          }
        }, delayMs);
      }
      return sendJson(res, 200, state);
    }

    // POST /api/device/verify-complete
    if (req.method === 'POST' && url === '/api/device/verify-complete') {
      if (verifyTimer) clearTimeout(verifyTimer);
      state.screenId = 'SBD-005';
      broadcastState();
      return sendJson(res, 200, state);
    }

    // POST /api/device/convey-complete
    if (req.method === 'POST' && url === '/api/device/convey-complete') {
      if (conveyTimer) clearTimeout(conveyTimer);
      state.deviceStatus.conveying = false;
      state.deviceStatus.receiptPrinted = true;
      state.simulatorState = 'completed';
      state.screenId = 'SBD-010';
      state.countdownSeconds = 30;
      broadcastState();
      return sendJson(res, 200, state);
    }

    // POST /api/device/goto-screen
    if (req.method === 'POST' && url === '/api/device/goto-screen') {
      clearTimers();
      const body = await readJsonBody(req);
      if (body.screenId) {
        state.screenId = body.screenId;
        state.bagMisplaced = false;
        state.bagNeedsTray = false;
        if (body.screenId === 'SBD-001') {
          state.simulatorState = 'idle';
        } else if (body.screenId === 'SBD-002' || body.screenId === 'SBD-003') {
          state.simulatorState = 'bag_ready';
        } else if (
          body.screenId === 'SBD-004' ||
          body.screenId === 'SBD-005' ||
          body.screenId === 'SBD-006' ||
          body.screenId === 'SBD-P01'
        ) {
          state.simulatorState = 'ready_to_convey';
          if (body.screenId === 'SBD-P01') {
            state.deviceStatus.paymentCompleted = false;
          }
        } else if (body.screenId === 'SBD-007') {
          state.simulatorState = 'ready_to_convey';
          state.deviceStatus.heavyTagIssued = true;
          state.deviceStatus.heavyTagAttached = false;
        } else if (body.screenId === 'SBD-009') {
          startConveyingSequence(5000);
        } else if (body.screenId === 'SBD-010') {
          state.simulatorState = 'completed';
          state.countdownSeconds = 30;
        }
      }
      if (typeof body.cancelModalOpen === 'boolean') {
        state.cancelModalOpen = body.cancelModalOpen;
      }
      broadcastState();
      return sendJson(res, 200, state);
    }

    // POST /api/device/reset
    if (req.method === 'POST' && url === '/api/device/reset') {
      clearTimers();
      sessionCounter += 1;
      const currentWeight = state.baggageInfo.currentWeightKg;
      const currentShape = state.bagShape;
      state = createInitialSessionState(
        0,
        0,
        false,
        currentWeight,
        currentShape
      );
      broadcastState();
      return sendJson(res, 200, state);
    }

    return sendJson(res, 404, { error: 'Not found', url });
  };
}
