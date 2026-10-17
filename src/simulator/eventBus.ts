import type { SimulationEvent, SimulationEventType } from './types';

type EventListener = (event: SimulationEvent) => void;

/**
 * シミュレーターと利用者向けWebアプリ間の疎結合イベントバス
 * お互いの内部変数を直接書き換えず、イベント・指示の送受信のみで連動します。
 */
class SimulationEventBus {
  private listeners = new Set<EventListener>();
  private eventCounter = 0;

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(
    sessionId: string,
    type: SimulationEventType,
    payload?: Record<string, unknown>
  ): SimulationEvent {
    this.eventCounter += 1;
    const eventId = `evt-${String(this.eventCounter).padStart(3, '0')}`;
    const event: SimulationEvent = {
      eventId,
      sessionId,
      type,
      timestamp: Date.now(),
      ...(payload ? { payload } : {}),
    };

    for (const listener of this.listeners) {
      listener(event);
    }
    return event;
  }

  resetCounter(): void {
    this.eventCounter = 0;
  }
}

export const simulationEventBus = new SimulationEventBus();
