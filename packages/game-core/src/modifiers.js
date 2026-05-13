import { D, dOne } from "./bn.js";
import { BUILDINGS } from "./config/buildings.js";
import { eraIndex } from "./config/eras.js";
import { TECHS } from "./config/techs.js";
/** 科技 + 任务奖励修饰符对某资源产出的总乘区 */
export function productionMultiplier(state, resource) {
    let m = dOne();
    for (const t of TECHS) {
        if (state.techStatus[t.id] !== "completed")
            continue;
        const f = t.effects[resource];
        if (f)
            m = m.mul(f);
    }
    for (const b of state.bonusModifiers) {
        if (b.resource === resource)
            m = m.mul(b.multiplier);
    }
    return m;
}
export function baseStorageCap(resource, state) {
    let cap = D(120);
    for (const b of BUILDINGS) {
        const lv = state.buildings[b.id]?.level ?? 0;
        const bonus = b.storageBonusPerLevel[resource];
        if (bonus)
            cap = cap.add(D(bonus * lv));
    }
    if (resource === "knowledge" && state.currentEra !== "primitive") {
        cap = cap.add(D(50));
    }
    if (resource === "clay" && eraIndex(state.currentEra) >= eraIndex("agricultural")) {
        cap = cap.add(D(100));
    }
    if (resource === "metal" && eraIndex(state.currentEra) >= eraIndex("classical")) {
        cap = cap.add(D(120));
    }
    if (resource === "coal" && eraIndex(state.currentEra) >= eraIndex("industrial")) {
        cap = cap.add(D(150));
    }
    return cap;
}
//# sourceMappingURL=modifiers.js.map