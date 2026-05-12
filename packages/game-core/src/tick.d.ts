import type { ActiveAction, GameState, ResourceId } from "./types.js";
export declare const OFFLINE_CAP_MS: number;
declare function passiveRatesPerSecond(state: GameState): Record<ResourceId, import("break_infinity.js").default>;
declare function storageCaps(state: GameState): Record<ResourceId, import("break_infinity.js").default>;
export declare function completeActionAt(state: GameState, action: ActiveAction, summary: string[]): void;
export declare function removeAction(state: GameState, id: string): void;
/** 推进时间：被动产出 + 定时动作完成 + 进化仪式 */
export declare function advanceTime(state: GameState, t0: number, t1: number, summary: string[]): void;
export declare function applyOffline(state: GameState, fromMs: number, toMs: number): {
    state: GameState;
    appliedMs: number;
    completedSummary: string[];
};
export declare function tickOnline(state: GameState, nowMs: number, lastTickMs: number): GameState;
export declare function refreshQuests(state: GameState): void;
export { passiveRatesPerSecond, storageCaps };
//# sourceMappingURL=tick.d.ts.map