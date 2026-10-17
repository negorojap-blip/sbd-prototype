import React from 'react';
import { History, ArrowRightLeft } from 'lucide-react';
import { EVENT_DESCRIPTIONS_JA, type SimulationEvent } from '../types';

interface EventLogPanelProps {
  events: SimulationEvent[];
  sessionId: string;
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({
  events,
  sessionId,
}) => {
  // Filter to the 6 core specification events for display clarity
  const visibleEvents = events.filter(
    (e) =>
      e.type === 'person.arrived' ||
      e.type === 'bag.placed' ||
      e.type === 'boarding_pass.read' ||
      e.type === 'conveyor.start_requested' ||
      e.type === 'conveyor.started' ||
      e.type === 'bag.transferred'
  );

  return (
    <section
      aria-label="イベント履歴"
      className="bg-white rounded-2xl border border-slate-300 shadow-xs p-4 flex flex-col flex-1 min-h-[210px]"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#0b253c]" aria-hidden="true" />
          <h2 className="text-[16px] font-extrabold text-[#0b253c]">
            イベント履歴（シミュレーター ⇄ Webアプリ連携ログ）
          </h2>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
          セッションID: {sessionId}
        </span>
      </div>

      {visibleEvents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm py-8">
          <ArrowRightLeft className="w-6 h-6 mb-1.5 opacity-60" />
          <p>まだイベントはありません。「人を呼ぶ」を押すと記録が開始されます。</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[220px] space-y-1.5 pr-1">
          {visibleEvents.map((evt) => {
            const isFromWebApp = evt.type === 'conveyor.start_requested';
            const timeStr = new Date(evt.timestamp).toLocaleTimeString('ja-JP', {
              hour12: false,
            });

            return (
              <div
                key={evt.eventId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-slate-500 font-semibold">
                    {evt.eventId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold ${
                      isFromWebApp
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-sky-100 text-sky-900 border border-sky-300'
                    }`}
                  >
                    {evt.type}
                  </span>
                  <span className="font-bold text-[#0b253c] text-[13px]">
                    {EVENT_DESCRIPTIONS_JA[evt.type]}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 font-mono shrink-0">
                  {evt.payload && (
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] text-slate-600">
                      {JSON.stringify(evt.payload)}
                    </span>
                  )}
                  <span title={`Timestamp: ${evt.timestamp}`}>{timeStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
