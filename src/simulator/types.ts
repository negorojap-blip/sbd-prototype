export type SimulationState =
  | "idle"
  | "person_arriving"
  | "person_ready"
  | "bag_placing"
  | "bag_ready"
  | "barcode_reading"
  | "ready_to_convey"
  | "conveying"
  | "returning"
  | "completed";

export type SimulationEventType =
  | "person.arrived"
  | "bag.placed"
  | "barcode.reading_started"
  | "boarding_pass.read"
  | "conveyor.start_requested"
  | "conveyor.started"
  | "bag.transferred"
  | "simulation.reset";

export interface SimulationEvent {
  eventId: string;
  sessionId: string;
  type: SimulationEventType;
  timestamp: number;
  payload?: Record<string, unknown>;
}

export const EVENT_DESCRIPTIONS_JA: Record<SimulationEventType, string> = {
  "person.arrived": "利用者が到着しました",
  "bag.placed": "荷物が置かれました",
  "barcode.reading_started": "搭乗券の読み取りを開始しました",
  "boarding_pass.read": "搭乗券を読み取りました",
  "conveyor.start_requested": "搬送が指示されました",
  "conveyor.started": "搬送を開始しました",
  "bag.transferred": "搬送が完了しました",
  "simulation.reset": "シミュレーションをリセットしました",
};

export const STATE_LABELS_JA: Record<SimulationState, string> = {
  idle: "待機中（誰もいない状態）",
  person_arriving: "利用者が移動中...",
  person_ready: "利用者が装置前に到着",
  bag_placing: "荷物をベルトへ設置中...",
  bag_ready: "荷物の設置完了（搭乗券の読み取り待ち）",
  barcode_reading: "搭乗券バーコードを読み取り中...",
  ready_to_convey: "搭乗券確認完了（搬送開始待ち）",
  conveying: "手荷物を搬送中...",
  returning: "ヘビータグ未検知（手荷物を返却中...）",
  completed: "手荷物の搬送完了",
};

export const STATUS_GUIDE_MESSAGES: Record<SimulationState, string> = {
  idle: "人を呼ぶボタンを押してください",
  person_arriving: "利用者が装置の前へ移動しています...",
  person_ready: "荷物を置くボタンを押してください",
  bag_placing: "手荷物を計量ベルトの上に置いています...",
  bag_ready: "バーコードをかざすボタンを押してください",
  barcode_reading: "スマートフォンを読み取り部にかざしています...",
  ready_to_convey: "右側のWebアプリで、手荷物を搬送するボタンを押してください",
  conveying: "手荷物を装置の奥へ搬送しています...",
  returning: "ヘビータグが取り付けられていないため、手荷物が戻されています...",
  completed: "搬送が完了しました。リセットすると最初から試せます",
};
