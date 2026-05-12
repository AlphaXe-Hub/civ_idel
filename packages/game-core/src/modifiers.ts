import { D, dOne } from "./bn.js";
import { BUILDINGS } from "./config/buildings.js";
import { TECHS } from "./config/techs.js";
import type { GameState, ResourceId } from "./types.js";

/** 科技 + 任务奖励修饰符对某资源产出的总乘区 */
export function productionMultiplier(state: GameState, resource: ResourceId) {
  let m = dOne();
  for (const t of TECHS) {
    if (state.techStatus[t.id] !== "completed") continue;
    const f = t.effects[resource];
    if (f) m = m.mul(f);
  }
  for (const b of state.bonusModifiers) {
    if (b.resource === resource) m = m.mul(b.multiplier);
  }
  return m;
}

export function baseStorageCap(resource: ResourceId, state: GameState) {
  let cap = D(120);
  for (const b of BUILDINGS) {
    const lv = state.buildings[b.id]?.level ?? 0;
    const bonus = b.storageBonusPerLevel[resource];
    if (bonus) cap = cap.add(D(bonus * lv));
  }
  if (resource === "knowledge" && state.currentEra !== "primitive") {
    cap = cap.add(D(50));
  }
  return cap;
}
