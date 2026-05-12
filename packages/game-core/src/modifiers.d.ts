import type { GameState, ResourceId } from "./types.js";
/** 科技 + 任务奖励修饰符对某资源产出的总乘区 */
export declare function productionMultiplier(state: GameState, resource: ResourceId): Decimal;
export declare function baseStorageCap(resource: ResourceId, state: GameState): Decimal;
//# sourceMappingURL=modifiers.d.ts.map