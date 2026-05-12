import { D, dZero } from "./bn.js";
import { BUILDINGS } from "./config/buildings.js";
const SAVE_VERSION = 1;
export function createInitialState(nowMs) {
    const buildings = Object.fromEntries(BUILDINGS.map((b) => [b.id, { level: 1 }]));
    const techStatus = {
        fire: "available",
        tools: "locked",
        agriculture: "locked",
    };
    return {
        saveVersion: SAVE_VERSION,
        lastSyncedAt: nowMs,
        currentEra: "primitive",
        resources: {
            food: "30",
            wood: "18",
            stone: "12",
            knowledge: "0",
        },
        buildings,
        techStatus,
        activeActions: [],
        completedQuests: [],
        questCounters: {},
        bonusModifiers: [],
    };
}
export function cloneState(s) {
    return structuredClone(s);
}
export function getResource(state, id) {
    return D(state.resources[id] ?? "0");
}
export function setResource(state, id, v) {
    state.resources[id] = v.toString();
}
export function payCost(state, cost) {
    for (const [k, v] of Object.entries(cost)) {
        if (!v)
            continue;
        if (getResource(state, k).lt(v))
            return false;
    }
    for (const [k, v] of Object.entries(cost)) {
        if (!v)
            continue;
        const id = k;
        setResource(state, id, getResource(state, id).sub(v));
    }
    return true;
}
export function canPay(state, cost) {
    for (const [k, v] of Object.entries(cost)) {
        if (!v)
            continue;
        if (getResource(state, k).lt(v))
            return false;
    }
    return true;
}
export function addResources(state, gains, caps) {
    for (const [k, v] of Object.entries(gains)) {
        if (!v || v.lte(dZero()))
            continue;
        const id = k;
        const cap = caps[id];
        const cur = getResource(state, id);
        const next = cap ? cur.add(v).min(cap) : cur.add(v);
        setResource(state, id, next.max(dZero()));
    }
}
export function buildingLevel(state, id) {
    return state.buildings[id]?.level ?? 0;
}
//# sourceMappingURL=state.js.map