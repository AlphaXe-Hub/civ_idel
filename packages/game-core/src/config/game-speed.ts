/**
 * 调试用全局时间倍率：>1 时被动产出更快，研究/升级/进化仪式耗时更短。
 * 由前端在启动时从 `/game-speed.json` 读取后调用 `setTimeScale`。
 */
const MIN = 0.01;
const MAX = 100;

let timeScale = 1;

export function getTimeScale(): number {
  return timeScale;
}

/** @param v 例如 10 表示约为正常速度的 10 倍（被动与计时均参与） */
export function setTimeScale(v: number): void {
  if (!Number.isFinite(v) || v <= 0) return;
  timeScale = Math.min(MAX, Math.max(MIN, v));
}

/** 被动结算：等效经过的毫秒（放大倍率） */
export function scaledPassiveDtMs(dtMs: number): number {
  if (dtMs <= 0) return 0;
  return dtMs * getTimeScale();
}

/** 队列 / 仪式：配置时长按倍率缩短 */
export function scaledDurationMs(baseMs: number): number {
  if (baseMs <= 0) return 0;
  return Math.max(1, Math.round(baseMs / getTimeScale()));
}
