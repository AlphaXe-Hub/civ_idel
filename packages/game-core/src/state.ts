import { D, dZero } from "./bn.js";
import { BUILDINGS } from "./config/buildings.js";
import { eraIndex } from "./config/eras.js";
import type { BuildingId, GameState, ResourceId, TechId } from "./types.js";

const SAVE_VERSION = 1;

const ALL_RESOURCE_IDS: ResourceId[] = ["food", "wood", "stone", "knowledge", "clay", "metal", "coal"];

/** 旧存档缺字段时补齐，避免 UI / 校验缺键 */
export function ensureAllResourceKeys(state: GameState): void {
  for (const id of ALL_RESOURCE_IDS) {
    const v = state.resources[id];
    if (v == null || v === "") state.resources[id] = "0";
  }
}

export function ensureGameStateDefaults(state: GameState): void {
  ensureAllResourceKeys(state);
  if (!Array.isArray(state.autoUpgradeBuildingIds)) state.autoUpgradeBuildingIds = [];
  for (const b of BUILDINGS) {
    if (state.buildings[b.id] == null) state.buildings[b.id] = { level: 0 };
  }
}

/** 新用户初始存档（与 `apps/api/src/newGameDefaults.ts` 的 `createInitialSave` 需保持同步） */
export function createInitialState(nowMs: number): GameState {
  const startEra = "primitive" as const;
  const buildings = Object.fromEntries(
    BUILDINGS.map((b) => [
      b.id,
      { level: eraIndex(startEra) >= eraIndex(b.minEra) ? 1 : 0 },
    ]),
  ) as GameState["buildings"];

  const techStatus = {
    fire: "available",
    tools: "locked",
    agriculture: "locked",
  } as Record<TechId, GameState["techStatus"][TechId]>;

  return {
    saveVersion: SAVE_VERSION,
    lastSyncedAt: nowMs,
    currentEra: "primitive",
    resources: {
      food: "30",
      wood: "18",
      stone: "12",
      knowledge: "0",
      clay: "0",
      metal: "0",
      coal: "0",
    },
    buildings,
    techStatus,
    activeActions: [],
    completedQuests: [],
    questCounters: {},
    bonusModifiers: [],
    autoUpgradeBuildingIds: [],
  };
}

export function cloneState(s: GameState): GameState {
  return structuredClone(s) as GameState;
}

export function getResource(state: GameState, id: keyof GameState["resources"]) {
  return D(state.resources[id] ?? "0");
}

export function setResource(
  state: GameState,
  id: keyof GameState["resources"],
  v: import("break_infinity.js").default,
) {
  state.resources[id] = v.toString();
}

export function payCost(
  state: GameState,
  cost: Partial<Record<keyof GameState["resources"], import("break_infinity.js").default>>,
): boolean {
  for (const [k, v] of Object.entries(cost)) {
    if (!v) continue;
    if (getResource(state, k as keyof GameState["resources"]).lt(v)) return false;
  }
  for (const [k, v] of Object.entries(cost)) {
    if (!v) continue;
    const id = k as keyof GameState["resources"];
    setResource(state, id, getResource(state, id).sub(v));
  }
  return true;
}

export function canPay(
  state: GameState,
  cost: Partial<Record<keyof GameState["resources"], import("break_infinity.js").default>>,
): boolean {
  for (const [k, v] of Object.entries(cost)) {
    if (!v) continue;
    if (getResource(state, k as keyof GameState["resources"]).lt(v)) return false;
  }
  return true;
}

export function addResources(
  state: GameState,
  gains: Partial<Record<keyof GameState["resources"], import("break_infinity.js").default>>,
  caps: Partial<Record<keyof GameState["resources"], import("break_infinity.js").default>>,
) {
  for (const [k, v] of Object.entries(gains)) {
    if (!v || v.lte(dZero())) continue;
    const id = k as keyof GameState["resources"];
    const cap = caps[id];
    const cur = getResource(state, id);
    const next = cap ? cur.add(v).min(cap) : cur.add(v);
    setResource(state, id, next.max(dZero()));
  }
}

export function buildingLevel(state: GameState, id: BuildingId): number {
  return state.buildings[id]?.level ?? 0;
}
