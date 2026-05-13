import { D, dZero } from "./bn.js";
import { BUILDINGS, BUILDING_MAP } from "./config/buildings.js";
import { ERA_MAP, eraIndex } from "./config/eras.js";
import { QUESTS } from "./config/quests.js";
import { TECH_MAP, TECHS } from "./config/techs.js";
import { RESOURCE_MAP } from "./config/resources.js";
import { scaledPassiveDtMs } from "./config/game-speed.js";
import { baseStorageCap, productionMultiplier } from "./modifiers.js";
import { addResources, buildingLevel, cloneState, getResource, } from "./state.js";
export const OFFLINE_CAP_MS = 48 * 60 * 60 * 1000;
function passiveRatesPerSecond(state) {
    const rates = {};
    Object.keys(RESOURCE_MAP).forEach((id) => {
        rates[id] = dZero();
    });
    for (const b of BUILDINGS) {
        if (eraIndex(state.currentEra) < eraIndex(b.minEra))
            continue;
        const lv = buildingLevel(state, b.id);
        if (lv <= 0)
            continue;
        for (const [res, perLv] of Object.entries(b.production)) {
            const rid = res;
            const base = D(perLv).mul(lv);
            const mul = productionMultiplier(state, rid);
            rates[rid] = rates[rid].add(base.mul(mul));
        }
    }
    if (state.currentEra !== "primitive") {
        const k = D(0.02).mul(eraIndex(state.currentEra));
        rates.knowledge = rates.knowledge.add(k);
    }
    if (eraIndex(state.currentEra) >= eraIndex("agricultural")) {
        rates.clay = rates.clay.add(D(0.02));
    }
    if (eraIndex(state.currentEra) >= eraIndex("classical")) {
        rates.metal = rates.metal.add(D(0.012));
    }
    if (eraIndex(state.currentEra) >= eraIndex("industrial")) {
        rates.coal = rates.coal.add(D(0.01));
    }
    return rates;
}
function storageCaps(state) {
    const caps = {};
    for (const r of Object.keys(RESOURCE_MAP)) {
        if (eraIndex(state.currentEra) < eraIndex(RESOURCE_MAP[r].minEra)) {
            caps[r] = dZero();
            continue;
        }
        caps[r] = baseStorageCap(r, state);
    }
    return caps;
}
function applyPassiveForMs(state, dtMs) {
    const scaled = scaledPassiveDtMs(dtMs);
    if (scaled <= 0)
        return;
    const sec = scaled / 1000;
    const rates = passiveRatesPerSecond(state);
    const caps = storageCaps(state);
    const gains = {};
    for (const r of Object.keys(rates)) {
        gains[r] = rates[r].mul(sec);
    }
    addResources(state, gains, caps);
}
function completeResearch(state, techId) {
    state.techStatus[techId] = "completed";
    unlockTechsForEra(state);
}
function completeUpgrade(state, buildingId, toLevel) {
    state.buildings[buildingId] = { level: toLevel };
}
export function completeActionAt(state, action, summary) {
    if (action.kind === "research") {
        completeResearch(state, action.techId);
        summary.push(`研究完成：${TECH_MAP[action.techId].emoji} ${TECH_MAP[action.techId].name}`);
    }
    else {
        completeUpgrade(state, action.buildingId, action.toLevel);
        const b = BUILDING_MAP[action.buildingId];
        summary.push(`建造完成：${b.emoji} ${b.name} Lv.${action.toLevel}`);
    }
}
export function removeAction(state, id) {
    state.activeActions = state.activeActions.filter((a) => a.id !== id);
}
function unlockTechsForEra(state) {
    for (const tech of TECHS) {
        if (eraIndex(state.currentEra) < eraIndex(tech.minEra))
            continue;
        if (state.techStatus[tech.id] === "locked") {
            const ok = tech.requires.every((r) => state.techStatus[r] === "completed");
            if (ok)
                state.techStatus[tech.id] = "available";
        }
    }
}
/** 推进时间：被动产出 + 定时动作完成 + 进化仪式 */
export function advanceTime(state, t0, t1, summary) {
    let t = t0;
    let guard = 0;
    while (t < t1 && guard++ < 100_000) {
        let next = t1;
        for (const a of state.activeActions) {
            if (a.endsAt > t)
                next = Math.min(next, a.endsAt);
        }
        const er = state.evolutionRitual;
        if (er && er.endsAt > t)
            next = Math.min(next, er.endsAt);
        const dt = next - t;
        if (dt > 0)
            applyPassiveForMs(state, dt);
        t = next;
        const finishedActions = state.activeActions.filter((a) => a.endsAt <= t);
        for (const a of finishedActions) {
            completeActionAt(state, a, summary);
            removeAction(state, a.id);
        }
        const r2 = state.evolutionRitual;
        if (r2 && r2.endsAt <= t) {
            state.currentEra = r2.targetEra;
            state.evolutionRitual = undefined;
            summary.push(`时代跃进：${ERA_MAP[r2.targetEra].emoji} ${ERA_MAP[r2.targetEra].name}`);
            unlockTechsForEra(state);
        }
    }
}
export function applyOffline(state, fromMs, toMs) {
    const s = cloneState(state);
    if (toMs < fromMs) {
        return { state: s, appliedMs: 0, completedSummary: ["拒绝时间倒退"] };
    }
    let delta = toMs - fromMs;
    if (delta > OFFLINE_CAP_MS)
        delta = OFFLINE_CAP_MS;
    const summary = [];
    advanceTime(s, fromMs, fromMs + delta, summary);
    s.lastSyncedAt = toMs;
    refreshQuests(s);
    return { state: s, appliedMs: delta, completedSummary: summary };
}
export function tickOnline(state, nowMs, lastTickMs) {
    const s = cloneState(state);
    if (nowMs <= lastTickMs)
        return s;
    const summary = [];
    advanceTime(s, lastTickMs, nowMs, summary);
    refreshQuests(s);
    return s;
}
function objectiveMet(state, q) {
    const o = q.objective;
    if (o.type === "resource_amount") {
        return getResource(state, o.resource).gte(D(o.amount));
    }
    if (o.type === "resources_threshold") {
        for (const [k, v] of Object.entries(o.amounts)) {
            if (!v)
                continue;
            if (getResource(state, k).lt(D(v)))
                return false;
        }
        return true;
    }
    if (o.type === "building_level") {
        return buildingLevel(state, o.building) >= o.level;
    }
    if (o.type === "tech_completed") {
        return state.techStatus[o.tech] === "completed";
    }
    if (o.type === "era_reached") {
        return eraIndex(state.currentEra) >= eraIndex(o.era);
    }
    return false;
}
function prerequisitesMet(state, q) {
    if (!q.requires?.length)
        return true;
    return q.requires.every((id) => state.completedQuests.includes(id));
}
export function refreshQuests(state) {
    let progress = true;
    while (progress) {
        progress = false;
        for (const q of QUESTS) {
            if (state.completedQuests.includes(q.id))
                continue;
            if (eraIndex(state.currentEra) < eraIndex(q.minEra))
                continue;
            if (!prerequisitesMet(state, q))
                continue;
            if (!objectiveMet(state, q))
                continue;
            state.completedQuests.push(q.id);
            progress = true;
            if (q.rewards.resources) {
                const caps = storageCaps(state);
                const gains = {};
                for (const [k, v] of Object.entries(q.rewards.resources)) {
                    gains[k] = D(v);
                }
                addResources(state, gains, caps);
            }
            if (q.rewards.modifiers?.length) {
                state.bonusModifiers.push(...q.rewards.modifiers);
            }
        }
    }
}
export { passiveRatesPerSecond, storageCaps };
//# sourceMappingURL=tick.js.map