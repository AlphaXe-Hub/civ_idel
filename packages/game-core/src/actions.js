import { BUILDING_MAP } from "./config/buildings.js";
import { scaledDurationMs } from "./config/game-speed.js";
import { ERA_MAP, nextEra, eraIndex } from "./config/eras.js";
import { TECH_MAP } from "./config/techs.js";
import { buildingLevel, canPay, cloneState, getResource, payCost, } from "./state.js";
const MAX_ACTION_SLOTS = 2;
function newActionId() {
    const c = globalThis.crypto;
    if (c?.randomUUID)
        return c.randomUUID();
    return `a-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
export function canStartAction(state) {
    return state.activeActions.length < MAX_ACTION_SLOTS;
}
export function startResearch(state, techId, nowMs) {
    const s = cloneState(state);
    if (!canStartAction(s))
        return { ok: false, reason: "queue_full" };
    if (s.techStatus[techId] !== "available")
        return { ok: false, reason: "tech_unavailable" };
    const tech = TECH_MAP[techId];
    if (eraIndex(s.currentEra) < eraIndex(tech.minEra))
        return { ok: false, reason: "era_locked" };
    if (!canPay(s, tech.cost))
        return { ok: false, reason: "insufficient_resources" };
    payCost(s, tech.cost);
    s.techStatus[techId] = "researching";
    const action = {
        id: newActionId(),
        kind: "research",
        techId,
        startedAt: nowMs,
        endsAt: nowMs + scaledDurationMs(tech.researchTimeMs),
    };
    s.activeActions.push(action);
    return { ok: true, state: s };
}
export function startBuildingUpgrade(state, buildingId, nowMs) {
    const s = cloneState(state);
    if (!canStartAction(s))
        return { ok: false, reason: "queue_full" };
    const b = BUILDING_MAP[buildingId];
    if (eraIndex(s.currentEra) < eraIndex(b.minEra))
        return { ok: false, reason: "era_locked" };
    const from = buildingLevel(s, buildingId);
    if (from <= 0)
        return { ok: false, reason: "building_locked" };
    const cost = b.upgradeCost(from);
    if (!canPay(s, cost))
        return { ok: false, reason: "insufficient_resources" };
    payCost(s, cost);
    const action = {
        id: newActionId(),
        kind: "building_upgrade",
        buildingId,
        fromLevel: from,
        toLevel: from + 1,
        startedAt: nowMs,
        endsAt: nowMs + scaledDurationMs(b.upgradeTimeMs(from)),
    };
    s.activeActions.push(action);
    return { ok: true, state: s };
}
function meetsEvolveRequirements(state, targetEra) {
    const req = ERA_MAP[targetEra].evolveRequirements;
    if (req.minBuildingLevel) {
        for (const [bid, lv] of Object.entries(req.minBuildingLevel)) {
            if (buildingLevel(state, bid) < (lv ?? 0))
                return false;
        }
    }
    if (req.completedTechs) {
        for (const tid of req.completedTechs) {
            if (state.techStatus[tid] !== "completed")
                return false;
        }
    }
    if (req.completedQuests) {
        for (const qid of req.completedQuests) {
            if (!state.completedQuests.includes(qid))
                return false;
        }
    }
    return true;
}
export function canEvolve(state) {
    const target = nextEra(state.currentEra);
    if (!target)
        return { ok: false, reason: "evolve_max_era" };
    if (state.evolutionRitual)
        return { ok: false, reason: "evolve_ritual_active" };
    if (!meetsEvolveRequirements(state, target))
        return { ok: false, reason: "evolve_requirements" };
    const cur = ERA_MAP[state.currentEra];
    for (const [k, v] of Object.entries(cur.evolveCost)) {
        if (!v)
            continue;
        const rid = k;
        if (getResource(state, rid).lt(v))
            return { ok: false, reason: "evolve_insufficient_resources" };
    }
    return { ok: true, target };
}
export function startEvolution(state, nowMs) {
    const check = canEvolve(state);
    if (!check.ok || !check.target)
        return { ok: false, reason: check.reason ?? "evolve_unknown" };
    const s = cloneState(state);
    const cur = ERA_MAP[s.currentEra];
    if (!payCost(s, cur.evolveCost))
        return { ok: false, reason: "evolve_pay_failed" };
    s.evolutionRitual = {
        startedAt: nowMs,
        endsAt: nowMs + scaledDurationMs(cur.evolveTimeMs),
        targetEra: check.target,
    };
    return { ok: true, state: s };
}
//# sourceMappingURL=actions.js.map