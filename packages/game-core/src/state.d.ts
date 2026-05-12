import type { BuildingId, GameState } from "./types.js";
export declare function createInitialState(nowMs: number): GameState;
export declare function cloneState(s: GameState): GameState;
export declare function getResource(state: GameState, id: keyof GameState["resources"]): Decimal;
export declare function setResource(state: GameState, id: keyof GameState["resources"], v: import("break_infinity.js").default): void;
export declare function payCost(state: GameState, cost: Partial<Record<keyof GameState["resources"], import("break_infinity.js").default>>): boolean;
export declare function canPay(state: GameState, cost: Partial<Record<keyof GameState["resources"], import("break_infinity.js").default>>): boolean;
export declare function addResources(state: GameState, gains: Partial<Record<keyof GameState["resources"], import("break_infinity.js").default>>, caps: Partial<Record<keyof GameState["resources"], import("break_infinity.js").default>>): void;
export declare function buildingLevel(state: GameState, id: BuildingId): number;
//# sourceMappingURL=state.d.ts.map