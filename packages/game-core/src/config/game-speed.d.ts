export declare function getTimeScale(): number;
/** @param v 例如 10 表示约为正常速度的 10 倍（被动与计时均参与） */
export declare function setTimeScale(v: number): void;
/** 被动结算：等效经过的毫秒（放大倍率） */
export declare function scaledPassiveDtMs(dtMs: number): number;
/** 队列 / 仪式：配置时长按倍率缩短 */
export declare function scaledDurationMs(baseMs: number): number;
//# sourceMappingURL=game-speed.d.ts.map