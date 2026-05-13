/**
 * 调试用全局时间倍率（由 `/game-speed.json` 驱动）：
 * - `timeScale`：被动产出等效时间（越大越快）
 * - `queueTimeScale`（可选）：研究 / 建筑升级 / 进化仪式耗时倍率；缺省则与 `timeScale` 相同
 */
const MIN = 0.01;
const MAX = 100;

let passiveScale = 1;
let queueScale = 1;

function clamp(v: number): number {
  return Math.min(MAX, Math.max(MIN, v));
}

/** 被动产出等效倍率 */
export function getTimeScale(): number {
  return passiveScale;
}

/** 队列动作（研究、升级、进化仪式）耗时倍率 */
export function getQueueTimeScale(): number {
  return queueScale;
}

/** 兼容旧接口：同时设置被动与队列倍率 */
export function setTimeScale(v: number): void {
  if (!Number.isFinite(v) || v <= 0) return;
  const c = clamp(v);
  passiveScale = c;
  queueScale = c;
}

/**
 * 从 `game-speed.json` 应用倍率。
 * - 仅 `timeScale`：被动与队列相同
 * - 同时提供 `queueTimeScale`：可单独加快/减慢队列相对被动
 */
export function configureGameSpeed(opts: { timeScale?: number; queueTimeScale?: number }): void {
  if (opts.timeScale != null && Number.isFinite(opts.timeScale) && opts.timeScale > 0) {
    passiveScale = clamp(Number(opts.timeScale));
    if (opts.queueTimeScale == null) queueScale = passiveScale;
  }
  if (opts.queueTimeScale != null && Number.isFinite(opts.queueTimeScale) && opts.queueTimeScale > 0) {
    queueScale = clamp(Number(opts.queueTimeScale));
  }
}

/** 被动结算：等效经过的毫秒（放大倍率） */
export function scaledPassiveDtMs(dtMs: number): number {
  if (dtMs <= 0) return 0;
  return dtMs * getTimeScale();
}

/** 队列 / 仪式：配置时长按队列倍率缩短 */
export function scaledDurationMs(baseMs: number): number {
  if (baseMs <= 0) return 0;
  return Math.max(1, Math.round(baseMs / getQueueTimeScale()));
}
