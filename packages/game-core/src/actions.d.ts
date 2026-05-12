import { nextEra } from "./config/eras.js";
import type { BuildingId, GameState, TechId } from "./types.js";
export declare function canStartAction(state: GameState): boolean;
export declare function startResearch(state: GameState, techId: TechId, nowMs: number): {
    ok: true;
    state: GameState;
} | {
    ok: false;
    reason: string;
};
export declare function startBuildingUpgrade(state: GameState, buildingId: BuildingId, nowMs: number): {
    ok: true;
    state: GameState;
} | {
    ok: false;
    reason: string;
};
export declare function canEvolve(state: GameState): {
    ok: boolean;
    reason?: string;
    target?: NonNullable<ReturnType<typeof nextEra>>;
};
export declare function startEvolution(state: GameState, nowMs: number): {
    ok: true;
    state: GameState;
} | {
    ok: false;
    reason: string;
};
//# sourceMappingURL=actions.d.ts.map