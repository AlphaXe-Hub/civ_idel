import { BUILDING_MAP } from "./config/buildings.js";
import { scaledDurationMs } from "./config/game-speed.js";
import { ERA_MAP, nextEra, eraIndex } from "./config/eras.js";
import { TECH_MAP } from "./config/techs.js";
import {
  buildingLevel,
  canPay,
  cloneState,
  getResource,
  payCost,
} from "./state.js";
import type { ActiveAction, BuildingId, GameState, TechId } from "./types.js";

const MAX_ACTION_SLOTS = 2;

function newActionId(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `a-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function canStartAction(state: GameState): boolean {
  return state.activeActions.length < MAX_ACTION_SLOTS;
}

export function startResearch(
  state: GameState,
  techId: TechId,
  nowMs: number,
): { ok: true; state: GameState } | { ok: false; reason: string } {
  const s = cloneState(state);
  if (!canStartAction(s)) return { ok: false, reason: "队列已满" };
  if (s.techStatus[techId] !== "available") return { ok: false, reason: "科技不可用" };
  const tech = TECH_MAP[techId];
  if (eraIndex(s.currentEra) < eraIndex(tech.minEra)) return { ok: false, reason: "时代不足" };
  if (!canPay(s, tech.cost)) return { ok: false, reason: "资源不足" };
  payCost(s, tech.cost);
  s.techStatus[techId] = "researching";
  const action: ActiveAction = {
    id: newActionId(),
    kind: "research",
    techId,
    startedAt: nowMs,
    endsAt: nowMs + scaledDurationMs(tech.researchTimeMs),
  };
  s.activeActions.push(action);
  return { ok: true, state: s };
}

export function startBuildingUpgrade(
  state: GameState,
  buildingId: BuildingId,
  nowMs: number,
): { ok: true; state: GameState } | { ok: false; reason: string } {
  const s = cloneState(state);
  if (!canStartAction(s)) return { ok: false, reason: "队列已满" };
  const b = BUILDING_MAP[buildingId];
  if (eraIndex(s.currentEra) < eraIndex(b.minEra)) return { ok: false, reason: "时代不足" };
  const from = buildingLevel(s, buildingId);
  if (from <= 0) return { ok: false, reason: "建筑未解锁" };
  const cost = b.upgradeCost(from);
  if (!canPay(s, cost)) return { ok: false, reason: "资源不足" };
  payCost(s, cost);
  const action: ActiveAction = {
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

function meetsEvolveRequirements(state: GameState, targetEra: NonNullable<ReturnType<typeof nextEra>>): boolean {
  const req = ERA_MAP[targetEra].evolveRequirements;
  if (req.minBuildingLevel) {
    for (const [bid, lv] of Object.entries(req.minBuildingLevel)) {
      if (buildingLevel(state, bid as BuildingId) < (lv ?? 0)) return false;
    }
  }
  if (req.completedTechs) {
    for (const tid of req.completedTechs) {
      if (state.techStatus[tid] !== "completed") return false;
    }
  }
  if (req.completedQuests) {
    for (const qid of req.completedQuests) {
      if (!state.completedQuests.includes(qid)) return false;
    }
  }
  return true;
}

export function canEvolve(state: GameState): {
  ok: boolean;
  reason?: string;
  target?: NonNullable<ReturnType<typeof nextEra>>;
} {
  const target = nextEra(state.currentEra);
  if (!target) return { ok: false, reason: "已达最高时代" };
  if (state.evolutionRitual) return { ok: false, reason: "进化仪式进行中" };
  if (!meetsEvolveRequirements(state, target)) return { ok: false, reason: "未满足进化条件" };
  const cur = ERA_MAP[state.currentEra];
  for (const [k, v] of Object.entries(cur.evolveCost)) {
    if (!v) continue;
    const rid = k as keyof GameState["resources"];
    if (getResource(state, rid).lt(v)) return { ok: false, reason: "仪式资源不足" };
  }
  return { ok: true, target };
}

export function startEvolution(
  state: GameState,
  nowMs: number,
): { ok: true; state: GameState } | { ok: false; reason: string } {
  const check = canEvolve(state);
  if (!check.ok || !check.target) return { ok: false, reason: check.reason ?? "无法进化" };
  const s = cloneState(state);
  const cur = ERA_MAP[s.currentEra];
  if (!payCost(s, cur.evolveCost)) return { ok: false, reason: "扣除资源失败" };
  s.evolutionRitual = {
    startedAt: nowMs,
    endsAt: nowMs + scaledDurationMs(cur.evolveTimeMs),
    targetEra: check.target,
  };
  return { ok: true, state: s };
}
