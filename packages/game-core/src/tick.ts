import { D, dZero } from "./bn.js";
import { BUILDINGS, BUILDING_MAP } from "./config/buildings.js";
import { ERA_MAP, eraIndex } from "./config/eras.js";
import { QUESTS } from "./config/quests.js";
import { TECH_MAP, TECHS } from "./config/techs.js";
import { RESOURCE_MAP } from "./config/resources.js";
import { scaledPassiveDtMs } from "./config/game-speed.js";
import { baseStorageCap, productionMultiplier } from "./modifiers.js";
import {
  addResources,
  buildingLevel,
  cloneState,
  getResource,
} from "./state.js";
import type { ActiveAction, GameState, ResourceId } from "./types.js";

export const OFFLINE_CAP_MS = 48 * 60 * 60 * 1000;

function passiveRatesPerSecond(state: GameState): Record<ResourceId, import("break_infinity.js").default> {
  const rates: Partial<Record<ResourceId, import("break_infinity.js").default>> = {};
  (Object.keys(RESOURCE_MAP) as ResourceId[]).forEach((id) => {
    rates[id] = dZero();
  });

  for (const b of BUILDINGS) {
    if (eraIndex(state.currentEra) < eraIndex(b.minEra)) continue;
    const lv = buildingLevel(state, b.id);
    if (lv <= 0) continue;
    for (const [res, perLv] of Object.entries(b.production)) {
      const rid = res as ResourceId;
      const base = D(perLv).mul(lv);
      const mul = productionMultiplier(state, rid);
      rates[rid] = rates[rid]!.add(base.mul(mul));
    }
  }

  if (state.currentEra !== "primitive") {
    const k = D(0.02).mul(eraIndex(state.currentEra));
    rates.knowledge = rates.knowledge!.add(k);
  }

  return rates as Record<ResourceId, import("break_infinity.js").default>;
}

function storageCaps(state: GameState): Record<ResourceId, import("break_infinity.js").default> {
  const caps: Partial<Record<ResourceId, import("break_infinity.js").default>> = {};
  for (const r of Object.keys(RESOURCE_MAP) as ResourceId[]) {
    if (eraIndex(state.currentEra) < eraIndex(RESOURCE_MAP[r]!.minEra)) {
      caps[r] = dZero();
      continue;
    }
    caps[r] = baseStorageCap(r, state);
  }
  return caps as Record<ResourceId, import("break_infinity.js").default>;
}

function applyPassiveForMs(state: GameState, dtMs: number) {
  const scaled = scaledPassiveDtMs(dtMs);
  if (scaled <= 0) return;
  const sec = scaled / 1000;
  const rates = passiveRatesPerSecond(state);
  const caps = storageCaps(state);
  const gains: Partial<Record<ResourceId, import("break_infinity.js").default>> = {};
  for (const r of Object.keys(rates) as ResourceId[]) {
    gains[r] = rates[r]!.mul(sec);
  }
  addResources(state, gains, caps);
}

function completeResearch(state: GameState, techId: import("./types.js").TechId) {
  state.techStatus[techId] = "completed";
  unlockTechsForEra(state);
}

function completeUpgrade(state: GameState, buildingId: import("./types.js").BuildingId, toLevel: number) {
  state.buildings[buildingId] = { level: toLevel };
}

export function completeActionAt(state: GameState, action: ActiveAction, summary: string[]) {
  if (action.kind === "research") {
    completeResearch(state, action.techId);
    summary.push(`研究完成：${TECH_MAP[action.techId].emoji} ${TECH_MAP[action.techId].name}`);
  } else {
    completeUpgrade(state, action.buildingId, action.toLevel);
    const b = BUILDING_MAP[action.buildingId];
    summary.push(`建造完成：${b.emoji} ${b.name} Lv.${action.toLevel}`);
  }
}

export function removeAction(state: GameState, id: string) {
  state.activeActions = state.activeActions.filter((a) => a.id !== id);
}

function unlockTechsForEra(state: GameState) {
  for (const tech of TECHS) {
    if (eraIndex(state.currentEra) < eraIndex(tech.minEra)) continue;
    if (state.techStatus[tech.id] === "locked") {
      const ok = tech.requires.every((r) => state.techStatus[r] === "completed");
      if (ok) state.techStatus[tech.id] = "available";
    }
  }
}

/** 推进时间：被动产出 + 定时动作完成 + 进化仪式 */
export function advanceTime(state: GameState, t0: number, t1: number, summary: string[]) {
  let t = t0;
  let guard = 0;
  while (t < t1 && guard++ < 100_000) {
    let next = t1;
    for (const a of state.activeActions) {
      if (a.endsAt > t) next = Math.min(next, a.endsAt);
    }
    const er = state.evolutionRitual;
    if (er && er.endsAt > t) next = Math.min(next, er.endsAt);

    const dt = next - t;
    if (dt > 0) applyPassiveForMs(state, dt);
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

export function applyOffline(
  state: GameState,
  fromMs: number,
  toMs: number,
): { state: GameState; appliedMs: number; completedSummary: string[] } {
  const s = cloneState(state);
  if (toMs < fromMs) {
    return { state: s, appliedMs: 0, completedSummary: ["拒绝时间倒退"] };
  }
  let delta = toMs - fromMs;
  if (delta > OFFLINE_CAP_MS) delta = OFFLINE_CAP_MS;
  const summary: string[] = [];
  advanceTime(s, fromMs, fromMs + delta, summary);
  s.lastSyncedAt = toMs;
  refreshQuests(s);
  return { state: s, appliedMs: delta, completedSummary: summary };
}

export function tickOnline(state: GameState, nowMs: number, lastTickMs: number) {
  const s = cloneState(state);
  if (nowMs <= lastTickMs) return s;
  const summary: string[] = [];
  advanceTime(s, lastTickMs, nowMs, summary);
  refreshQuests(s);
  return s;
}

function objectiveMet(state: GameState, q: (typeof QUESTS)[number]): boolean {
  const o = q.objective;
  if (o.type === "resource_amount") {
    return getResource(state, o.resource).gte(D(o.amount));
  }
  if (o.type === "resources_threshold") {
    for (const [k, v] of Object.entries(o.amounts)) {
      if (!v) continue;
      if (getResource(state, k as ResourceId).lt(D(v))) return false;
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

function prerequisitesMet(state: GameState, q: (typeof QUESTS)[number]): boolean {
  if (!q.requires?.length) return true;
  return q.requires.every((id) => state.completedQuests.includes(id));
}

export function refreshQuests(state: GameState) {
  let progress = true;
  while (progress) {
    progress = false;
    for (const q of QUESTS) {
      if (state.completedQuests.includes(q.id)) continue;
      if (eraIndex(state.currentEra) < eraIndex(q.minEra)) continue;
      if (!prerequisitesMet(state, q)) continue;
      if (!objectiveMet(state, q)) continue;
      state.completedQuests.push(q.id);
      progress = true;
      if (q.rewards.resources) {
        const caps = storageCaps(state);
        const gains: Partial<Record<ResourceId, import("break_infinity.js").default>> = {};
        for (const [k, v] of Object.entries(q.rewards.resources)) {
          gains[k as ResourceId] = D(v);
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
