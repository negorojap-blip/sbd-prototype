import React, { useState, useRef, useEffect } from 'react';
import type { SimulationState } from '../types';
import type { BagShape, ScreenId } from '../../types/sbd';

interface SimulatorSceneProps {
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
  onBagDropped: (misplaced: boolean) => void;
  onTakeTray: () => void;
  onScanBarcode: () => void;
  onCompletePayment: () => void;
  onAttachHeavyTag: () => void;
}

const HAND_POS = { x: 225, y: 330 };
const BELT_POS = { x: 455, y: 292 };
const TUNNEL_POS = { x: 685, y: 195 };
// Right side of the SBD device where the tray stack is located
const TRAY_STACK_POS = { x: 672, y: 356 };
const TRAY_TOP_INITIAL_POS = { x: 678, y: 368 };

export const SimulatorScene: React.FC<SimulatorSceneProps> = ({
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
  onBagDropped,
  onTakeTray,
  onScanBarcode,
  onCompletePayment,
  onAttachHeavyTag,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Bag Dragging & Misplaced position state
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>(HAND_POS);
  const [misplacedPos, setMisplacedPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [placedOnBeltWithoutTray, setPlacedOnBeltWithoutTray] = useState(false);
  const [hoverZone, setHoverZone] = useState<'none' | 'correct' | 'misplaced'>(
    'none'
  );
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Tray Dragging state
  const [isDraggingTray, setIsDraggingTray] = useState(false);
  const [trayDragPos, setTrayDragPos] = useState<{ x: number; y: number }>(
    TRAY_TOP_INITIAL_POS
  );
  const [isTrayHoveringBelt, setIsTrayHoveringBelt] = useState(false);
  const trayDragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Heavy tag attachment animation state
  const [isAttachingTag, setIsAttachingTag] = useState(false);

  // Reset drag & misplaced position when state leaves person_ready
  useEffect(() => {
    if (state !== 'person_ready') {
      setIsDragging(false);
      setHoverZone('none');
      setMisplacedPos(null);
      setPlacedOnBeltWithoutTray(false);
      setDragPos(HAND_POS);
    } else {
      if (!bagMisplaced) {
        setMisplacedPos(null);
      }
      if (!bagNeedsTray) {
        setPlacedOnBeltWithoutTray(false);
      }
      if (!bagMisplaced && !bagNeedsTray) {
        setDragPos(HAND_POS);
      }
    }
  }, [state, bagMisplaced, bagNeedsTray]);

  useEffect(() => {
    if (!heavyTagIssued || heavyTagAttached) {
      setIsAttachingTag(false);
    }
  }, [heavyTagIssued, heavyTagAttached]);

  useEffect(() => {
    if (hasTray || state === 'idle') {
      setIsDraggingTray(false);
      setIsTrayHoveringBelt(false);
      setTrayDragPos(TRAY_TOP_INITIAL_POS);
    }
  }, [hasTray, state]);

  const isPersonVisible = state !== 'idle';
  const isPersonArriving = state === 'person_arriving';

  const isBagVisible = state !== 'idle' && state !== 'completed';
  const isBagDraggable = state === 'person_ready';
  const isBagDetectedBadgeVisible =
    state === 'bag_ready' ||
    state === 'barcode_reading' ||
    state === 'ready_to_convey';

  const isBarcodeReading = state === 'barcode_reading';
  const isConveying = state === 'conveying';
  const isReturning = state === 'returning';

  // Tray can be dragged onto the belt when not yet placed and simulation not completed
  const canDragTray = state !== 'completed' && !hasTray;

  // Whether the bag is currently sitting on the belt (either in bag_ready+, or waiting for tray)
  const isBagOnBeltOrConveying =
    placedOnBeltWithoutTray ||
    bagNeedsTray ||
    state === 'bag_placing' ||
    state === 'bag_ready' ||
    state === 'barcode_reading' ||
    state === 'ready_to_convey' ||
    state === 'conveying' ||
    state === 'returning';

  // When hasTray is true, but the bag is still in the passenger's hand (person_ready),
  // render the placed tray waiting on the belt at BELT_POS!
  const isTrayWaitingEmptyOnBelt =
    hasTray && !isBagOnBeltOrConveying && state !== 'completed';

  // When both bag and tray are on the belt (or conveying together)
  const isBagInsideTray = hasTray && isBagOnBeltOrConveying;

  const clientToSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const transformed = pt.matrixTransform(ctm.inverse());
      return { x: transformed.x, y: transformed.y };
    }
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 820,
      y: 95 + ((clientY - rect.top) / rect.height) * 395,
    };
  };

  // Correct center zone on the belt vs. Misplaced zone for Bag
  const classifyDropPosition = (
    x: number,
    y: number
  ): 'hand' | 'correct' | 'misplaced' => {
    const centerX = x + 52;
    const centerY = y + 55;

    // 1. Correct Center Belt Target Zone
    if (
      centerX >= 450 &&
      centerX <= 565 &&
      centerY >= 300 &&
      centerY <= 390
    ) {
      return 'correct';
    }

    // 2. If barely moved from initial hand spot, treat as returning to hand
    const distFromHand = Math.hypot(x - HAND_POS.x, y - HAND_POS.y);
    if (distFromHand < 28 && !misplacedPos && !placedOnBeltWithoutTray) {
      return 'hand';
    }

    // 3. Anywhere else (belt edge, rail, too far left/right/front/back) is Misplaced!
    return 'misplaced';
  };

  // Check if Tray is over the belt drop zone
  const isTrayInBeltZone = (x: number, y: number): boolean => {
    const centerX = x + 58;
    const centerY = y + 25;
    return (
      centerX >= 400 &&
      centerX <= 625 &&
      centerY >= 280 &&
      centerY <= 435
    );
  };

  // === BAG DRAG HANDLERS ===
  const handleBagPointerDown = (e: React.PointerEvent<SVGGElement>) => {
    if (!isBagDraggable) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    const currentOrigin =
      misplacedPos ||
      (placedOnBeltWithoutTray || bagNeedsTray ? BELT_POS : HAND_POS);
    const pt = clientToSvgCoords(e.clientX, e.clientY);
    dragOffsetRef.current = {
      dx: pt.x - currentOrigin.x,
      dy: pt.y - currentOrigin.y,
    };
    setDragPos(currentOrigin);
    setIsDragging(true);
    const zone = classifyDropPosition(currentOrigin.x, currentOrigin.y);
    setHoverZone(zone === 'hand' ? 'none' : zone);
  };

  const handleBagPointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (!isDragging || !isBagDraggable) return;
    e.preventDefault();
    const pt = clientToSvgCoords(e.clientX, e.clientY);
    const nextX = Math.max(20, Math.min(700, pt.x - dragOffsetRef.current.dx));
    const nextY = Math.max(40, Math.min(395, pt.y - dragOffsetRef.current.dy));
    setDragPos({ x: nextX, y: nextY });

    const zone = classifyDropPosition(nextX, nextY);
    setHoverZone(zone === 'hand' ? 'none' : zone);
  };

  const handleBagPointerUp = (e: React.PointerEvent<SVGGElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const zone = classifyDropPosition(dragPos.x, dragPos.y);
    setIsDragging(false);
    setHoverZone('none');

    if (zone === 'correct') {
      setMisplacedPos(null);
      if (bagShape === 'knapsack' && !hasTray) {
        setPlacedOnBeltWithoutTray(true);
      } else {
        setPlacedOnBeltWithoutTray(false);
      }
      onBagDropped(false);
    } else if (zone === 'misplaced') {
      setPlacedOnBeltWithoutTray(false);
      setMisplacedPos({ x: dragPos.x, y: dragPos.y });
      onBagDropped(true);
    } else {
      setMisplacedPos(null);
      setPlacedOnBeltWithoutTray(false);
      setDragPos(HAND_POS);
    }
  };

  // === TRAY DRAG HANDLERS ===
  const handleTrayPointerDown = (e: React.PointerEvent<SVGGElement>) => {
    if (!canDragTray) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    const pt = clientToSvgCoords(e.clientX, e.clientY);
    trayDragOffsetRef.current = {
      dx: pt.x - TRAY_TOP_INITIAL_POS.x,
      dy: pt.y - TRAY_TOP_INITIAL_POS.y,
    };
    setTrayDragPos(TRAY_TOP_INITIAL_POS);
    setIsDraggingTray(true);
    setIsTrayHoveringBelt(false);
  };

  const handleTrayPointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (!isDraggingTray || !canDragTray) return;
    e.preventDefault();
    const pt = clientToSvgCoords(e.clientX, e.clientY);
    const nextX = Math.max(20, Math.min(720, pt.x - trayDragOffsetRef.current.dx));
    const nextY = Math.max(40, Math.min(440, pt.y - trayDragOffsetRef.current.dy));
    setTrayDragPos({ x: nextX, y: nextY });
    setIsTrayHoveringBelt(isTrayInBeltZone(nextX, nextY));
  };

  const handleTrayPointerUp = (e: React.PointerEvent<SVGGElement>) => {
    if (!isDraggingTray) return;
    e.preventDefault();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const droppedOnBelt = isTrayInBeltZone(trayDragPos.x, trayDragPos.y);
    setIsDraggingTray(false);
    setIsTrayHoveringBelt(false);

    if (droppedOnBelt) {
      onTakeTray();
    } else {
      setTrayDragPos(TRAY_TOP_INITIAL_POS);
    }
  };

  const handleHeavyTagClick = () => {
    if (!heavyTagIssued || heavyTagAttached || isAttachingTag) return;
    setIsAttachingTag(true);
    setTimeout(() => {
      setIsAttachingTag(false);
      onAttachHeavyTag();
    }, 850);
  };

  // Compute bag coordinates (x, y, scale)
  const getBagTransform = () => {
    if (state === 'person_ready') {
      if (isDragging) {
        return {
          transform: `translate(${dragPos.x}px, ${dragPos.y}px) scale(1.04)`,
          transition: 'none',
        };
      }
      if (misplacedPos && bagMisplaced) {
        return {
          transform: `translate(${misplacedPos.x}px, ${misplacedPos.y}px) scale(1)`,
          transition: 'transform 0.25s ease-out',
        };
      }
      if (placedOnBeltWithoutTray || bagNeedsTray) {
        return {
          transform: `translate(${BELT_POS.x}px, ${BELT_POS.y}px) scale(1)`,
          transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        };
      }
      return {
        transform: `translate(${HAND_POS.x}px, ${HAND_POS.y}px) scale(1)`,
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
      };
    }

    switch (state) {
      case 'bag_placing':
      case 'bag_ready':
      case 'barcode_reading':
      case 'ready_to_convey':
        return {
          transform: `translate(${BELT_POS.x}px, ${BELT_POS.y}px) scale(1)`,
          transition:
            state === 'bag_placing'
              ? 'transform 0.65s cubic-bezier(0.34, 1.2, 0.64, 1)'
              : 'transform 0.4s ease-out',
        };
      case 'returning':
        return {
          transform: `translate(${BELT_POS.x}px, ${BELT_POS.y}px) scale(1)`,
          transition: 'transform 2.15s cubic-bezier(0.22, 1, 0.36, 1)',
        };
      case 'conveying':
        // If heavy tag is required (>20kg) and NOT attached, move slowly partway to tunnel sensor before returning
        if (weightKg > 20.0 && !heavyTagAttached) {
          return {
            transform: `translate(595px, 234px) scale(0.86)`,
            transition: 'transform 2.45s cubic-bezier(0.4, 0, 0.2, 1)',
          };
        }
        return {
          transform: `translate(${TUNNEL_POS.x}px, ${TUNNEL_POS.y}px) scale(0.76)`,
          transition: 'transform 5s cubic-bezier(0.4, 0, 0.2, 1)',
        };
      default:
        return {
          transform: `translate(${TUNNEL_POS.x}px, ${TUNNEL_POS.y}px) scale(0.76)`,
          transition: 'none',
        };
    }
  };

  const bagStyle = getBagTransform();

  return (
    <div className="relative w-full h-full min-h-[290px] rounded-2xl overflow-hidden border border-slate-300 bg-gradient-to-b from-sky-100 via-slate-100 to-slate-200 shadow-inner select-none">
      {/* Top-Left Model Label */}
      <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-sm border border-slate-200 w-fit">
          <div className="text-[14px] font-extrabold text-[#0b253c] leading-tight">
            Amadeus S7
          </div>
          <div className="text-[10px] font-medium text-slate-600 mt-0.5">
            ※ Amadeus S7をモデルにした模式表現
          </div>
        </div>
      </div>

      {/* SVG Scene Canvas (Cropped top sky area: viewBox="0 95 820 395") */}
      <svg
        ref={svgRef}
        viewBox="0 95 820 395"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full touch-none"
        role="img"
        aria-label="セルフ手荷物預け機 Amadeus S7 シミュレーションシーン"
      >
        <defs>
          <linearGradient id="skyWindow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          <linearGradient id="floorTile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="kioskBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="steelRail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="suitcaseGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>
          <linearGradient id="knapsackGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="55%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="trayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <clipPath id="bagConveyClip">
            <polygon points="0,0 640,0 640,248 725,295 725,500 0,500" />
          </clipPath>
        </defs>

        {/* === 1. AIRPORT TERMINAL BACKGROUND === */}
        <rect x="0" y="95" width="820" height="215" fill="url(#skyWindow)" />
        <g stroke="#cbd5e1" strokeWidth="2" opacity="0.7">
          <line x1="120" y1="95" x2="120" y2="310" />
          <line x1="260" y1="95" x2="260" y2="310" />
          <line x1="400" y1="95" x2="400" y2="310" />
          <line x1="540" y1="95" x2="540" y2="310" />
          <line x1="680" y1="95" x2="680" y2="310" />
          <line x1="0" y1="135" x2="820" y2="135" />
          <line x1="0" y1="220" x2="820" y2="220" />
        </g>

        <rect x="65" y="95" width="38" height="215" fill="#e2e8f0" />
        <rect x="520" y="95" width="32" height="215" fill="#e2e8f0" />

        <g transform="translate(455, 102)">
          <rect
            x="0"
            y="0"
            width="145"
            height="30"
            rx="4"
            fill="#334155"
            opacity="0.85"
          />
          <text
            x="16"
            y="20"
            fill="#f8fafc"
            fontSize="13"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            ✈ Departures →
          </text>
        </g>

        <rect x="0" y="310" width="820" height="190" fill="url(#floorTile)" />
        <g stroke="#94a3b8" strokeWidth="1" opacity="0.35">
          <line x1="0" y1="355" x2="820" y2="355" />
          <line x1="0" y1="410" x2="820" y2="410" />
          <line x1="0" y1="470" x2="820" y2="470" />
          <line x1="160" y1="310" x2="60" y2="500" />
          <line x1="340" y1="310" x2="280" y2="500" />
          <line x1="520" y1="310" x2="500" y2="500" />
          <line x1="700" y1="310" x2="740" y2="500" />
        </g>

        {/* === 2. AMADEUS S7 DEVICE === */}
        <g id="simulator-device">
          <polygon
            points="575,140 740,140 785,165 785,375 575,345"
            fill="#cbd5e1"
            stroke="#94a3b8"
            strokeWidth="2"
          />

          <polygon points="605,168 718,168 718,325 605,305" fill="#0f172a" />
          <g stroke="#1e293b" strokeWidth="2">
            <line x1="628" y1="168" x2="628" y2="310" />
            <line x1="650" y1="168" x2="650" y2="314" />
            <line x1="672" y1="168" x2="672" y2="318" />
            <line x1="694" y1="168" x2="694" y2="322" />
          </g>

          <polygon
            points="335,255 445,255 470,270 470,415 335,415"
            fill="url(#kioskBody)"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <polygon
            points="365,155 450,155 470,168 455,265 350,265"
            fill="url(#kioskBody)"
            stroke="#94a3b8"
            strokeWidth="2"
          />

          <text
            x="354"
            y="302"
            fill="#1e3a8a"
            fontSize="14"
            fontWeight="800"
            letterSpacing="1"
          >
            amadeus
          </text>
          <text x="354" y="316" fill="#64748b" fontSize="9" fontWeight="bold">
            S7 SELF BAG DROP
          </text>

          {/* Tag Printer Slot on Kiosk Cabinet */}
          <rect
            x="412"
            y="276"
            width="28"
            height="9"
            rx="2"
            fill="#0f172a"
            stroke="#475569"
            strokeWidth="1.5"
          />

          <polygon
            points="372,167 438,167 427,232 361,232"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="2"
          />
          <polygon
            points="376,172 433,172 424,227 366,227"
            fill={
              state === 'completed'
                ? '#dcfce7'
                : state === 'ready_to_convey'
                ? '#e0f2fe'
                : '#f8fafc'
            }
          />
          <rect x="374" y="180" width="48" height="6" rx="2" fill="#0284c7" />
          <rect
            x="372"
            y="192"
            width="44"
            height="16"
            rx="2"
            fill={
              state === 'ready_to_convey'
                ? '#0d9488'
                : state === 'completed'
                ? '#16a34a'
                : '#cbd5e1'
            }
          />

          <g id="barcode-scanner-slot">
            <polygon
              points="365,240 422,240 416,262 358,262"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1.5"
            />
            <line
              x1="368"
              y1="246"
              x2="414"
              y2="246"
              stroke={isBarcodeReading ? '#ef4444' : '#38bdf8'}
              strokeWidth={isBarcodeReading ? '3.5' : '2'}
            />
            {isBarcodeReading && (
              <polygon
                points="370,247 412,247 428,288 352,288"
                fill="#ef4444"
                opacity="0.35"
                className="animate-pulse"
              />
            )}
          </g>

          {/* Weighing & Conveying Belt Surface */}
          <polygon
            points="385,405 565,430 715,315 585,295"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="2"
          />

          <g
            stroke={isConveying ? '#38bdf8' : '#475569'}
            strokeWidth="2"
            strokeDasharray={isConveying ? '8 6' : undefined}
          >
            <line x1="410" y1="392" x2="575" y2="414" />
            <line x1="445" y1="372" x2="605" y2="392" />
            <line x1="480" y1="352" x2="635" y2="370" />
            <line x1="515" y1="332" x2="665" y2="348" />
            <line x1="550" y1="312" x2="695" y2="326" />
          </g>

          {/* Drop Zone Guides on Belt when dragging Bag or Tray */}
          {(isBagDraggable || isDraggingTray) && (
            <g className="pointer-events-none">
              {/* Outer Belt Edge Warning Area when dragging Bag in misplaced zone */}
              {!isDraggingTray && hoverZone === 'misplaced' && (
                <polygon
                  points="380,408 568,432 710,318 580,295"
                  fill="#f59e0b"
                  fillOpacity="0.22"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
              )}

              {/* Correct Center Belt Target Zone */}
              <polygon
                points="428,386 548,402 612,354 502,338"
                fill={
                  isDraggingTray
                    ? isTrayHoveringBelt
                      ? '#14b8a6'
                      : '#38bdf8'
                    : hoverZone === 'correct'
                    ? '#14b8a6'
                    : '#38bdf8'
                }
                fillOpacity={
                  isDraggingTray
                    ? isTrayHoveringBelt
                      ? '0.45'
                      : '0.25'
                    : hoverZone === 'correct'
                    ? '0.42'
                    : '0.2'
                }
                stroke={
                  isDraggingTray
                    ? isTrayHoveringBelt
                      ? '#2dd4bf'
                      : '#38bdf8'
                    : hoverZone === 'correct'
                    ? '#2dd4bf'
                    : '#38bdf8'
                }
                strokeWidth={
                  (isDraggingTray && isTrayHoveringBelt) || hoverZone === 'correct'
                    ? '3.5'
                    : '2.5'
                }
                strokeDasharray="7 4"
              />
              <g transform="translate(425, 336)">
                <rect
                  x="0"
                  y="0"
                  width="184"
                  height="28"
                  rx="14"
                  fill={
                    isDraggingTray
                      ? isTrayHoveringBelt
                        ? '#0d9488'
                        : '#0284c7'
                      : hoverZone === 'correct'
                      ? '#0d9488'
                      : hoverZone === 'misplaced'
                      ? '#d97706'
                      : '#0284c7'
                  }
                  opacity="0.95"
                />
                <text
                  x="92"
                  y="18"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11.5"
                  fontWeight="bold"
                >
                  {isDraggingTray
                    ? isTrayHoveringBelt
                      ? '✓ ここへ通い箱をドロップ'
                      : 'ベルト中央へ通い箱をドロップ'
                    : hoverZone === 'correct'
                    ? '✓ 正しい位置（中央）で設置'
                    : hoverZone === 'misplaced'
                    ? '⚠ 位置ずれ（警告が出ます）'
                    : isTrayWaitingEmptyOnBelt
                    ? '通い箱の中へ手荷物をドロップ'
                    : '中央枠へドロップ（端は位置ずれ）'}
                </text>
              </g>
            </g>
          )}

          {/* Placed Empty Tray waiting on Belt (when user dragged tray onto belt BEFORE dragging the bag) */}
          {isTrayWaitingEmptyOnBelt && (
            <g
              transform={`translate(${BELT_POS.x}, ${BELT_POS.y})`}
              className="pointer-events-none"
            >
              <ellipse
                cx="52"
                cy="103"
                rx="58"
                ry="12"
                fill="#0f172a"
                opacity="0.28"
              />
              <ellipse
                cx="52"
                cy="74"
                rx="56"
                ry="14"
                fill="#dbeafe"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <path
                d="M -6,72 L 4,102 L 100,102 L 110,72 Z"
                fill="url(#trayGrad)"
                stroke="#1e3a8a"
                strokeWidth="2"
              />
              <rect
                x="-10"
                y="68"
                width="124"
                height="7"
                rx="3.5"
                fill="#2563eb"
                stroke="#93c5fd"
                strokeWidth="1.5"
              />
              <rect
                x="28"
                y="80"
                width="48"
                height="15"
                rx="3"
                fill="#f8fafc"
              />
              <text
                x="52"
                y="91"
                textAnchor="middle"
                fill="#0f172a"
                fontSize="9.5"
                fontWeight="900"
              >
                通い箱
              </text>
            </g>
          )}

          {/* Conveying / Returning Direction Arrow */}
          <g
            opacity={isConveying || isReturning ? '1' : '0.75'}
            transform={
              isReturning
                ? 'translate(632, 315) rotate(144)'
                : 'translate(565, 345) rotate(-36)'
            }
          >
            <path
              d="M 0,10 L 55,10 L 55,0 L 82,16 L 55,32 L 55,22 L 0,22 Z"
              fill={
                isReturning
                  ? '#ef4444'
                  : isConveying
                  ? '#2dd4bf'
                  : '#0284c7'
              }
            />
          </g>
          <text
            x="555"
            y="386"
            fill={isReturning ? '#fca5a5' : '#cbd5e1'}
            fontSize="11"
            fontWeight="bold"
            transform="rotate(-35 555 386)"
          >
            {isReturning ? '返却中（手前へ）' : '搬送方向（奥へ）'}
          </text>

          <polygon
            points="375,375 395,378 395,438 375,435"
            fill="url(#steelRail)"
            stroke="#64748b"
          />
          <polygon
            points="375,405 568,432 568,462 375,435"
            fill="url(#steelRail)"
            stroke="#64748b"
            strokeWidth="1.5"
          />
        </g>

        {/* === 3. INDEPENDENT PASSENGER ELEMENT (CLICKABLE TO SCAN BARCODE OR COMPLETE QR PAYMENT) === */}
        {isPersonVisible && (
          <g
            id="simulator-person"
            onClick={() => {
              if (kioskScreenId === 'SBD-P01') {
                onCompletePayment();
              } else if (state === 'bag_ready' || kioskScreenId === 'SBD-003') {
                onScanBarcode();
              }
            }}
            className={`${isPersonArriving ? 'animate-person-walk' : ''} ${
              state === 'bag_ready' ||
              kioskScreenId === 'SBD-003' ||
              kioskScreenId === 'SBD-P01'
                ? 'cursor-pointer group'
                : 'pointer-events-none'
            }`}
            style={
              isPersonArriving
                ? undefined
                : {
                    transform: 'translate(260px, 145px)',
                  }
            }
          >
            {/* Enlarged invisible click box for clicking the passenger */}
            <rect
              x="-24"
              y="-10"
              width="155"
              height="335"
              fill="transparent"
            />

            {/* Highlight ring around passenger when clickable for barcode scan or QR payment */}
            {(state === 'bag_ready' ||
              kioskScreenId === 'SBD-003' ||
              kioskScreenId === 'SBD-P01') && (
              <rect
                x="-22"
                y="4"
                width="148"
                height="312"
                rx="18"
                fill="none"
                stroke={
                  kioskScreenId === 'SBD-P01' || kioskScreenId === 'SBD-003'
                    ? '#0d9488'
                    : '#38bdf8'
                }
                strokeWidth="3"
                strokeDasharray="6 4"
              />
            )}

            <ellipse
              cx="35"
              cy="315"
              rx="42"
              ry="12"
              fill="#0f172a"
              opacity="0.22"
            />
            <rect
              x="14"
              y="185"
              width="19"
              height="112"
              rx="8"
              fill="#d6c7b2"
              stroke="#a89984"
              strokeWidth="1.5"
            />
            <rect
              x="38"
              y="185"
              width="19"
              height="112"
              rx="8"
              fill="#c4b39b"
              stroke="#a89984"
              strokeWidth="1.5"
            />
            <rect
              x="10"
              y="292"
              width="28"
              height="14"
              rx="6"
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <rect
              x="36"
              y="292"
              width="32"
              height="14"
              rx="6"
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <rect
              x="8"
              y="72"
              width="54"
              height="118"
              rx="18"
              fill="#1e293b"
            />
            <rect
              x="-16"
              y="84"
              width="34"
              height="82"
              rx="10"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <circle cx="36" cy="36" r="22" fill="#fed7aa" />
            <path
              d="M 14,34 Q 14,10 38,12 Q 58,12 56,32 Q 46,24 34,26 Q 22,28 14,34 Z"
              fill="#0f172a"
            />

            {/* Right Arm & Smartphone */}
            <g
              style={{
                transform:
                  isBarcodeReading || kioskScreenId === 'SBD-P01'
                    ? 'translate(42px, -8px) rotate(-28deg)'
                    : 'translate(0px, 0px) rotate(0deg)',
                transformOrigin: '48px 95px',
                transition: 'transform 0.45s ease-in-out',
              }}
            >
              <path
                d="M 46,88 L 78,124 L 106,105"
                fill="none"
                stroke="#1e293b"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="110" cy="102" r="8" fill="#fed7aa" />
              <g transform="translate(106, 82) rotate(15)">
                <rect
                  x="0"
                  y="0"
                  width="16"
                  height="28"
                  rx="3"
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <rect
                  x="2"
                  y="3"
                  width="12"
                  height="22"
                  rx="1"
                  fill={
                    isBarcodeReading || kioskScreenId === 'SBD-P01'
                      ? '#bae6fd'
                      : '#e2e8f0'
                  }
                />
              </g>
            </g>

            {/* Callout prompt when ready to scan barcode or complete QR payment */}
            {(state === 'bag_ready' ||
              kioskScreenId === 'SBD-003' ||
              kioskScreenId === 'SBD-P01') &&
              !isBarcodeReading && (
                <g transform="translate(-45, -36)">
                  <rect
                    x="0"
                    y="0"
                    width="196"
                    height="34"
                    rx="10"
                    fill={
                      kioskScreenId === 'SBD-P01' && paymentCompleted
                        ? '#0d9488'
                        : kioskScreenId === 'SBD-P01' ||
                          kioskScreenId === 'SBD-003'
                        ? '#f0fdfa'
                        : '#ffffff'
                    }
                    stroke={
                      kioskScreenId === 'SBD-P01' || kioskScreenId === 'SBD-003'
                        ? '#0d9488'
                        : '#0284c7'
                    }
                    strokeWidth="2.5"
                  />
                  <polygon
                    points="74,34 82,42 90,34"
                    fill={
                      kioskScreenId === 'SBD-P01' || kioskScreenId === 'SBD-003'
                        ? '#0d9488'
                        : '#0284c7'
                    }
                  />
                  <text
                    x="98"
                    y="21"
                    textAnchor="middle"
                    fill={
                      kioskScreenId === 'SBD-P01' && paymentCompleted
                        ? '#ffffff'
                        : '#0b253c'
                    }
                    fontSize="11.5"
                    fontWeight="bold"
                  >
                    {kioskScreenId === 'SBD-P01'
                      ? paymentCompleted
                        ? '✓ お支払いが完了しました！'
                        : '📱 クリックでQRコード決済完了'
                      : '📱 クリックでバーコードをかざす'}
                  </text>
                </g>
              )}

            {isBarcodeReading && (
              <g transform="translate(65, -5)">
                <rect
                  x="0"
                  y="0"
                  width="148"
                  height="36"
                  rx="10"
                  fill="#ffffff"
                  stroke="#0d9488"
                  strokeWidth="2"
                />
                <text
                  x="14"
                  y="23"
                  fill="#0b253c"
                  fontSize="12.5"
                  fontWeight="bold"
                >
                  搭乗券をかざしています
                </text>
              </g>
            )}
          </g>
        )}

        {/* === 4. INDEPENDENT LUGGAGE / BAG ELEMENT (DRAGGABLE IN person_ready) === */}
        <g clipPath="url(#bagConveyClip)">
          {isBagVisible && (
            <g
              id="simulator-bag"
              onPointerDown={handleBagPointerDown}
              onPointerMove={handleBagPointerMove}
              onPointerUp={handleBagPointerUp}
              onPointerCancel={handleBagPointerUp}
              className={`${isPersonArriving ? 'animate-bag-walk' : ''} ${
                isBagDraggable
                  ? isDragging
                    ? 'cursor-grabbing'
                    : 'cursor-grab'
                  : ''
              }`}
              style={
                isPersonArriving
                  ? undefined
                  : {
                      transform: bagStyle.transform,
                      transition: bagStyle.transition,
                    }
              }
            >
              {/* Invisible enlarged hit area for easy mouse grabbing */}
              <rect
                x="-14"
                y="-15"
                width="132"
                height="135"
                fill="transparent"
              />

              {/* Highlight Glow Ring when draggable */}
              {isBagDraggable && (
                <rect
                  x={isBagInsideTray ? '-8' : '3'}
                  y="5"
                  width={isBagInsideTray ? '120' : '98'}
                  height="98"
                  rx="14"
                  fill="none"
                  stroke={
                    bagMisplaced || bagNeedsTray
                      ? '#ef4444'
                      : hoverZone === 'correct'
                      ? '#2dd4bf'
                      : hoverZone === 'misplaced'
                      ? '#f59e0b'
                      : '#38bdf8'
                  }
                  strokeWidth="3.5"
                  strokeDasharray={isDragging ? undefined : '6 4'}
                />
              )}

              {/* Baggage Shadow */}
              <ellipse
                cx="52"
                cy="103"
                rx={isBagInsideTray ? '56' : '48'}
                ry="12"
                fill="#0f172a"
                opacity={isDragging ? '0.18' : '0.3'}
              />

              {/* Plastic Tray Back Interior (when bag is inside tray on belt) */}
              {isBagInsideTray && (
                <ellipse
                  cx="52"
                  cy="74"
                  rx="56"
                  ry="14"
                  fill="#dbeafe"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
              )}

              {/* === SHAPE A: ORANGE HARDSHELL SUITCASE === */}
              {bagShape === 'suitcase' && (
                <g>
                  <rect
                    x="8"
                    y="12"
                    width="88"
                    height="84"
                    rx="10"
                    fill="url(#suitcaseGrad)"
                    stroke="#7c2d12"
                    strokeWidth="2.5"
                  />
                  <line
                    x1="16"
                    y1="32"
                    x2="88"
                    y2="32"
                    stroke="#fdba74"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <line
                    x1="16"
                    y1="52"
                    x2="88"
                    y2="52"
                    stroke="#fdba74"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <line
                    x1="16"
                    y1="72"
                    x2="88"
                    y2="72"
                    stroke="#fdba74"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <path
                    d="M 36,12 L 36,4 Q 52,0 68,4 L 68,12"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  {/* White Baggage Tag */}
                  <rect
                    x="50"
                    y="8"
                    width="14"
                    height="26"
                    rx="1.5"
                    fill="#ffffff"
                    stroke="#475569"
                    strokeWidth="1"
                    transform="rotate(6 50 8)"
                  />

                  <circle cx="22" cy="98" r="6" fill="#0f172a" />
                  <circle cx="82" cy="98" r="6" fill="#0f172a" />
                </g>
              )}

              {/* === SHAPE B: BLUE KNAPSACK / BACKPACK (ナップサック) === */}
              {bagShape === 'knapsack' && (
                <g>
                  {/* Loose Shoulder Straps on sides */}
                  <path
                    d="M 18,30 C -4,42 -4,82 16,90"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 86,30 C 108,42 108,82 88,90"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />

                  {/* Side Mesh Pockets */}
                  <rect
                    x="10"
                    y="56"
                    width="12"
                    height="28"
                    rx="5"
                    fill="#1e40af"
                    stroke="#1e3a8a"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="82"
                    y="56"
                    width="12"
                    height="28"
                    rx="5"
                    fill="#1e40af"
                    stroke="#1e3a8a"
                    strokeWidth="1.5"
                  />

                  {/* Main Knapsack Soft Body */}
                  <path
                    d="M 18,92 L 22,28 C 24,14 36,10 52,10 C 68,10 80,14 82,28 L 86,92 C 86,96 78,98 52,98 C 26,98 18,96 18,92 Z"
                    fill="url(#knapsackGrad)"
                    stroke="#172554"
                    strokeWidth="2.5"
                  />

                  {/* Top Hood / Flap */}
                  <path
                    d="M 21,28 C 22,12 36,9 52,9 C 68,9 82,12 83,28 C 83,38 70,42 52,42 C 34,42 21,38 21,28 Z"
                    fill="#3b82f6"
                    stroke="#1e3a8a"
                    strokeWidth="2"
                  />

                  {/* Front Zipper Pocket */}
                  <rect
                    x="28"
                    y="48"
                    width="48"
                    height="38"
                    rx="8"
                    fill="#1d4ed8"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="33"
                    y1="56"
                    x2="71"
                    y2="56"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                  />

                  {/* Two Buckle Straps */}
                  <rect x="34" y="24" width="6" height="28" rx="2" fill="#0f172a" />
                  <rect x="64" y="24" width="6" height="28" rx="2" fill="#0f172a" />
                  <rect x="33" y="36" width="8" height="7" rx="1.5" fill="#f59e0b" />
                  <rect x="63" y="36" width="8" height="7" rx="1.5" fill="#f59e0b" />

                  {/* Top Carry Loop */}
                  <path
                    d="M 42,10 Q 52,-2 62,10"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />

                  {/* White Baggage Tag attached to top loop */}
                  <rect
                    x="52"
                    y="5"
                    width="14"
                    height="26"
                    rx="1.5"
                    fill="#ffffff"
                    stroke="#475569"
                    strokeWidth="1"
                    transform="rotate(10 52 5)"
                  />
                </g>
              )}

              {/* Plastic Tray Front Wall (通い箱) cradling the bag when isBagInsideTray === true */}
              {isBagInsideTray && (
                <g>
                  <path
                    d="M -6,72 L 4,102 L 100,102 L 110,72 Z"
                    fill="url(#trayGrad)"
                    stroke="#1e3a8a"
                    strokeWidth="2"
                  />
                  {/* Blue Top Rim of Tray */}
                  <rect
                    x="-10"
                    y="68"
                    width="124"
                    height="7"
                    rx="3.5"
                    fill="#2563eb"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                  />
                  {/* Tray Label */}
                  <rect
                    x="28"
                    y="80"
                    width="48"
                    height="15"
                    rx="3"
                    fill="#f8fafc"
                  />
                  <text
                    x="52"
                    y="91"
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="9.5"
                    fontWeight="900"
                  >
                    通い箱
                  </text>
                </g>
              )}

              {/* Attached HEAVY Tag on Handle (when heavyTagAttached is true) */}
              {heavyTagAttached && (
                <g transform="translate(62, 6) rotate(-10)">
                  <rect
                    x="0"
                    y="0"
                    width="22"
                    height="32"
                    rx="2"
                    fill="#facc15"
                    stroke="#854d0e"
                    strokeWidth="1.5"
                  />
                  <text
                    x="11"
                    y="19"
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="6.2"
                    fontWeight="900"
                    transform="rotate(90 11 16)"
                  >
                    HEAVY
                  </text>
                </g>
              )}

              {/* Drag Hint or Warning Tooltip */}
              {isBagDraggable && !isDragging && (
                <g
                  transform="translate(-48, -48)"
                  className="pointer-events-none"
                >
                  <rect
                    x="0"
                    y="0"
                    width="206"
                    height="34"
                    rx="10"
                    fill={
                      bagMisplaced || bagNeedsTray
                        ? '#fef2f2'
                        : '#ffffff'
                    }
                    stroke={
                      bagMisplaced || bagNeedsTray
                        ? '#dc2626'
                        : '#0284c7'
                    }
                    strokeWidth="2"
                  />
                  <polygon
                    points="94,34 102,42 110,34"
                    fill={
                      bagMisplaced || bagNeedsTray
                        ? '#dc2626'
                        : '#0284c7'
                    }
                  />
                  <text
                    x="103"
                    y="21"
                    textAnchor="middle"
                    fill={
                      bagMisplaced || bagNeedsTray
                        ? '#b91c1c'
                        : '#0b253c'
                    }
                    fontSize="11.5"
                    fontWeight="bold"
                  >
                    {bagMisplaced
                      ? '⚠ 位置ずれ！中央へドラッグ'
                      : bagNeedsTray
                      ? '⚠ 右側の「通い箱」をドロップ'
                      : 'ドラッグしてベルトへ置く'}
                  </text>
                </g>
              )}

              {/* Floating Warning Badge when bag is being returned due to missing Heavy Tag */}
              {isReturning && (
                <g
                  transform="translate(-45, -48)"
                  className="pointer-events-none"
                >
                  <rect
                    x="0"
                    y="0"
                    width="206"
                    height="34"
                    rx="10"
                    fill="#fef2f2"
                    stroke="#dc2626"
                    strokeWidth="2.5"
                  />
                  <polygon points="94,34 102,42 110,34" fill="#dc2626" />
                  <text
                    x="103"
                    y="21"
                    textAnchor="middle"
                    fill="#b91c1c"
                    fontSize="11.5"
                    fontWeight="900"
                  >
                    ⚠ ヘビータグ未取付（返却中）
                  </text>
                </g>
              )}

              {/* Floating Status Badges when bag is properly on the belt */}
              {isBagDetectedBadgeVisible && (
                <g
                  transform="translate(-14, -76)"
                  className="pointer-events-none"
                >
                  {/* 1. 荷物を検知 Badge */}
                  <g transform="translate(0, 0)">
                    <rect
                      x="0"
                      y="0"
                      width="132"
                      height="29"
                      rx="14.5"
                      fill="#0d9488"
                      stroke="#99f6e4"
                      strokeWidth="2"
                    />
                    <circle cx="17" cy="14.5" r="7.5" fill="#ffffff" />
                    <path
                      d="M 13.5,14.5 L 16.5,17.5 L 21,11.5"
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <text
                      x="32"
                      y="19"
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="bold"
                    >
                      荷物を検知
                    </text>
                  </g>

                  {/* 2. 重量 XX.X kg Badge */}
                  <g transform="translate(0, 34)">
                    <rect
                      x="0"
                      y="0"
                      width="142"
                      height="29"
                      rx="14.5"
                      fill={weightKg > 20.0 ? '#0f766e' : '#0369a1'}
                      stroke="#bae6fd"
                      strokeWidth="2"
                    />
                    <text
                      x="14"
                      y="19"
                      fill="#ffffff"
                      fontSize="12.5"
                      fontWeight="bold"
                    >
                      ⚖ 重量 {weightKg.toFixed(1)} kg
                    </text>
                  </g>

                  {/* 3. ヘビータグ取付済 Badge */}
                  {heavyTagAttached && (
                    <g transform="translate(0, -34)">
                      <rect
                        x="0"
                        y="0"
                        width="146"
                        height="28"
                        rx="14"
                        fill="#facc15"
                        stroke="#854d0e"
                        strokeWidth="2"
                      />
                      <text
                        x="14"
                        y="18.5"
                        fill="#0f172a"
                        fontSize="12"
                        fontWeight="900"
                      >
                        ✓ HEAVYタグ取付済
                      </text>
                    </g>
                  )}
                </g>
              )}
            </g>
          )}
        </g>

        {/* === 5. FOREGROUND HOOD OF REAR TUNNEL & RIGHT GUARD RAIL === */}
        <g id="simulator-device-foreground" className="pointer-events-none">
          <polygon
            points="565,430 755,295 755,345 565,462"
            fill="url(#steelRail)"
            stroke="#64748b"
            strokeWidth="1.5"
          />
          <polygon
            points="600,140 740,140 740,172 600,172"
            fill="#f1f5f9"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <polygon
            points="715,168 755,185 755,345 715,325"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <circle
            cx="735"
            cy="195"
            r="6"
            fill="#ef4444"
            stroke="#fef08a"
            strokeWidth="2"
          />
        </g>

        {/* === 5.5 RIGHT-SIDE TRAY DISPENSER STAND (装置右側の通い箱置場) === */}
        <g
          id="simulator-tray-dispenser-stand"
          transform={`translate(${TRAY_STACK_POS.x}, ${TRAY_STACK_POS.y})`}
        >
          {/* Stand Floor Shadow */}
          <ellipse cx="64" cy="116" rx="58" ry="12" fill="#0f172a" opacity="0.24" />
          {/* Stand Pedestal */}
          <rect
            x="10"
            y="62"
            width="108"
            height="52"
            rx="6"
            fill="#cbd5e1"
            stroke="#64748b"
            strokeWidth="2"
          />
          <rect
            x="16"
            y="72"
            width="96"
            height="26"
            rx="4"
            fill="#0b253c"
          />
          <text
            x="64"
            y="89"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="11.5"
            fontWeight="bold"
          >
            通い箱（トレイ）置場
          </text>

          {/* Remaining Stacked Trays in Stand */}
          <path
            d="M 8,48 L 16,64 L 112,64 L 120,48 Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <path
            d="M 8,36 L 16,52 L 112,52 L 120,36 Z"
            fill="#334155"
            stroke="#64748b"
            strokeWidth="1.5"
          />

          {/* Badge when tray is already placed on belt */}
          {hasTray && (
            <g transform="translate(4, 2)">
              <rect
                x="0"
                y="0"
                width="120"
                height="26"
                rx="13"
                fill="#dcfce7"
                stroke="#16a34a"
                strokeWidth="1.5"
              />
              <text
                x="60"
                y="17"
                textAnchor="middle"
                fill="#166534"
                fontSize="11"
                fontWeight="bold"
              >
                ✓ 通い箱を使用中
              </text>
            </g>
          )}
        </g>

        {/* === 5.6 DRAGGABLE TOP TRAY ELEMENT (ドラッグ＆ドロップ可能な通い箱) === */}
        {!hasTray && (
          <g
            id="simulator-draggable-tray"
            onPointerDown={handleTrayPointerDown}
            onPointerMove={handleTrayPointerMove}
            onPointerUp={handleTrayPointerUp}
            onPointerCancel={handleTrayPointerUp}
            className={
              canDragTray
                ? isDraggingTray
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'opacity-80'
            }
            style={{
              transform: isDraggingTray
                ? `translate(${trayDragPos.x}px, ${trayDragPos.y}px) scale(1.05)`
                : `translate(${TRAY_TOP_INITIAL_POS.x}px, ${TRAY_TOP_INITIAL_POS.y}px) scale(1)`,
              transition: isDraggingTray
                ? 'none'
                : 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Enlarged invisible hit box for grabbing the tray */}
            <rect x="-15" y="-42" width="146" height="90" fill="transparent" />

            {/* Highlight ring when draggable */}
            {(bagShape === 'knapsack' || bagNeedsTray || isDraggingTray) && (
              <rect
                x="-6"
                y="-4"
                width="128"
                height="42"
                rx="10"
                fill="none"
                stroke={
                  isDraggingTray
                    ? isTrayHoveringBelt
                      ? '#2dd4bf'
                      : '#38bdf8'
                    : bagNeedsTray
                    ? '#ef4444'
                    : '#0284c7'
                }
                strokeWidth="3"
                strokeDasharray={isDraggingTray ? undefined : '5 3'}
              />
            )}

            {/* Top Plastic Tray Shape */}
            <path
              d="M 0,10 L 9,28 L 107,28 L 116,10 Z"
              fill="#1e3a8a"
              stroke="#172554"
              strokeWidth="2"
            />
            <ellipse
              cx="58"
              cy="10"
              rx="58"
              ry="8"
              fill="#eff6ff"
              stroke="#2563eb"
              strokeWidth="2"
            />
            <ellipse cx="58" cy="10" rx="48" ry="5" fill="#bfdbfe" />

            {/* Tooltip above Draggable Tray when not currently dragging */}
            {!isDraggingTray &&
              state !== 'idle' &&
              state !== 'completed' &&
              (bagShape === 'knapsack' || bagNeedsTray) && (
                <g
                  transform="translate(-48, -46)"
                  className="pointer-events-none"
                >
                  <rect
                    x="0"
                    y="0"
                    width="180"
                    height="34"
                    rx="10"
                    fill={bagNeedsTray ? '#fef2f2' : '#ffffff'}
                    stroke={bagNeedsTray ? '#dc2626' : '#0284c7'}
                    strokeWidth="2"
                  />
                  <polygon
                    points="98,34 106,42 114,34"
                    fill={bagNeedsTray ? '#dc2626' : '#0284c7'}
                  />
                  <text
                    x="90"
                    y="21"
                    textAnchor="middle"
                    fill={bagNeedsTray ? '#b91c1c' : '#0b253c'}
                    fontSize="11.5"
                    fontWeight="bold"
                  >
                    {bagNeedsTray
                      ? '📦 通い箱をベルトへドラッグ'
                      : 'ドラッグして通い箱を置く'}
                  </text>
                </g>
              )}
          </g>
        )}

        {/* === 6. INTERACTIVE ISSUED HEAVY TAG (ON SBD-007 WHEN WEIGHT > 20KG) === */}
        {heavyTagIssued && !heavyTagAttached && (
          <g
            id="simulator-heavy-tag-dispenser"
            onClick={handleHeavyTagClick}
            className="cursor-pointer group"
            style={{
              transform: isAttachingTag
                ? 'translate(512px, 298px) scale(0.85)'
                : 'translate(418px, 280px) scale(1)',
              transition: isAttachingTag
                ? 'transform 0.8s cubic-bezier(0.34, 1.3, 0.64, 1)'
                : 'transform 0.2s ease-out',
            }}
          >
            {/* Invisible hit box */}
            <rect
              x="-20"
              y="-55"
              width="210"
              height="110"
              fill="transparent"
            />

            {/* Printed HEAVY Tag Strip sticking out of slot */}
            <g transform="rotate(18)">
              <rect
                x="0"
                y="0"
                width="68"
                height="24"
                rx="3"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="2"
              />
              <rect x="3" y="3" width="44" height="18" rx="1.5" fill="#facc15" />
              <text
                x="25"
                y="16"
                textAnchor="middle"
                fill="#0f172a"
                fontSize="11"
                fontWeight="900"
                letterSpacing="0.5"
              >
                HEAVY
              </text>
              {/* Barcode lines on tag */}
              <line x1="51" y1="4" x2="51" y2="20" stroke="#0f172a" strokeWidth="1.5" />
              <line x1="55" y1="4" x2="55" y2="20" stroke="#0f172a" strokeWidth="1" />
              <line x1="58" y1="4" x2="58" y2="20" stroke="#0f172a" strokeWidth="2" />
              <line x1="62" y1="4" x2="62" y2="20" stroke="#0f172a" strokeWidth="1" />
            </g>

            {/* Callout Bubble: "クリックしてヘビータグを取り付ける" */}
            {!isAttachingTag && (
              <g transform="translate(-52, -52)">
                <rect
                  x="0"
                  y="0"
                  width="218"
                  height="38"
                  rx="11"
                  fill="#fef08a"
                  stroke="#ca8a04"
                  strokeWidth="2.5"
                />
                <polygon points="62,38 70,47 78,38" fill="#ca8a04" />
                <text
                  x="109"
                  y="24"
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="12.5"
                  fontWeight="900"
                >
                  🏷 クリックしてHEAVYタグを付ける
                </text>
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
