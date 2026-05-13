import { D, dOne } from "./bn.js";
import { BUILDINGS } from "./config/buildings.js";
import { eraIndex } from "./config/eras.js";
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

/**
 * 仓库基础容量：时代略抬底数；各建筑对该资源的「每级加成」叠乘温和复利（1.014^lv，lv 封顶防溢出）。
 */
export function baseStorageCap(resource: ResourceId, state: GameState) {
  const ei = eraIndex(state.currentEra);
  let cap = D(120).mul(dOne().add(D(0.04 * ei)));

  for (const b of BUILDINGS) {
    const lv = state.buildings[b.id]?.level ?? 0;
    const bonus = b.storageBonusPerLevel[resource];
    if (!bonus || lv <= 0) continue;
    const t = Math.min(lv, 400);
    const mult = D(1.014).pow(t);
    cap = cap.add(D(bonus * lv).mul(mult));
  }

  if (resource === "knowledge" && state.currentEra !== "primitive") {
    cap = cap.add(D(50));
  }
  return cap;
}
