import { D, dZero } from "../bn.js";
import { RESOURCE_MAP } from "../config/resources.js";
import { addResources, getResource } from "../state.js";
import type { GameState, ResourceId, RelicQuality } from "../types.js";
import { eraIndex } from "../config/eras.js";
import { civ6Next01 } from "./rng.js";
import {
  EUREKA_MAP,
  GREAT_PERSON_DEFS,
  GREAT_PERSON_MAP,
  RELIC_MAP,
  qualityMultiplier,
  type EurekaDef,
} from "./defs.js";
import { pushCiv6Toast } from "./toastBuffer.js";

const PER_RESOURCE_ADD_CAP = 0.35;

function ensureCiv6(state: GameState) {
  if (!state.civ6) return null;
  return state.civ6;
}

function addCodex(c: NonNullable<GameState["civ6"]>, cat: "eureka" | "great" | "relic", id: string) {
  const arr = c.codexUnlocked[cat];
  if (!arr.includes(id)) arr.push(id);
}

/** feature.md：伟人解锁 + 当前时代匹配 + 满级全局叠乘（上限 10 位） */
export function civ6EurekaLinkMultipliers(state: GameState): { chanceMult: number; rewardMult: number } {
  const c = state.civ6;
  if (!c) return { chanceMult: 1, rewardMult: 1 };
  const era = state.currentEra;
  let cm = 1;
  let rm = 1;
  for (const def of GREAT_PERSON_DEFS) {
    const lv = c.greatPeople[def.id]?.level ?? 0;
    if (lv <= 0) continue;
    if (def.eurekaLink.era !== era) continue;
    cm *= 1 + def.eurekaLink.chanceUp;
    rm *= 1 + def.eurekaLink.rewardBonus;
  }
  let maxed = 0;
  for (const def of GREAT_PERSON_DEFS) {
    const lv = c.greatPeople[def.id]?.level ?? 0;
    if (lv >= def.maxLevel && def.maxLevel >= 3) maxed++;
  }
  maxed = Math.min(10, maxed);
  cm *= Math.pow(1.02, maxed);
  rm *= Math.pow(1.05, maxed);
  return { chanceMult: cm, rewardMult: rm };
}

function rollQuality(c: NonNullable<GameState["civ6"]>, bias: number): RelicQuality {
  const u = civ6Next01(c) + bias * 0.15;
  if (u > 0.92) return "legendary";
  if (u > 0.78) return "epic";
  if (u > 0.55) return "rare";
  return "common";
}

function pickRelicDefId(c: NonNullable<GameState["civ6"]>, state: GameState): string | null {
  const ei = eraIndex(state.currentEra);
  const pool = Object.values(RELIC_MAP).filter((d) => eraIndex(d.minEra) <= ei);
  if (!pool.length) return null;
  let w = 0;
  for (const d of pool) w += d.weight;
  let r = civ6Next01(c) * w;
  for (const d of pool) {
    r -= d.weight;
    if (r <= 0) return d.id;
  }
  return pool[pool.length - 1]!.id;
}

function pushBonusAllResources(state: GameState, mult: number, idPrefix: string): void {
  if (mult <= 1 || !Number.isFinite(mult)) return;
  for (const rid of Object.keys(RESOURCE_MAP) as ResourceId[]) {
    if (eraIndex(state.currentEra) < eraIndex(RESOURCE_MAP[rid]!.minEra)) continue;
    state.bonusModifiers.push({
      id: `${idPrefix}_${rid}`,
      resource: rid,
      multiplier: mult,
    });
  }
}

export function applyEurekaDef(state: GameState, def: EurekaDef, atTimeMs: number): void {
  const c = ensureCiv6(state);
  if (!c) return;
  const ei = eraIndex(state.currentEra);
  if (eraIndex(def.minEra) > ei) return;
  if (def.once && c.seenEurekaIds.includes(def.id)) return;

  const { rewardMult } = civ6EurekaLinkMultipliers(state);

  const eurekaFirstDiscover = !c.codexUnlocked.eureka.includes(def.id);
  addCodex(c, "eureka", def.id);
  if (eurekaFirstDiscover) {
    pushCiv6Toast({ kind: "eureka", id: def.id, emoji: def.emoji, title: def.title, i18nKey: def.i18nKey });
  }

  const markOnce = () => {
    if (def.once && !c.seenEurekaIds.includes(def.id)) c.seenEurekaIds.push(def.id);
  };

  const e = def.effect;
  if (e.kind === "temp_prod_mult") {
    c.activeBuffs.push({
      id: def.id,
      untilMs: atTimeMs + e.durationMs,
      kind: "temp_prod_mult",
      resource: e.resource,
      mult: e.mult,
    });
  } else if (e.kind === "temp_all_prod_mult") {
    c.activeBuffs.push({
      id: def.id,
      untilMs: atTimeMs + e.durationMs,
      kind: "temp_all_prod_mult",
      mult: e.mult,
    });
  } else if (e.kind === "instant_resource") {
    const gains: Partial<Record<ResourceId, import("break_infinity.js").default>> = {};
    for (const [k, v] of Object.entries(e.resources)) {
      if (!v) continue;
      gains[k as ResourceId] = D(v).mul(rewardMult);
    }
    addResources(state, gains, {});
  } else if (e.kind === "roll_relic") {
    if (c.relics.length >= 64) return;
    const rid = pickRelicDefId(c, state);
    if (!rid) return;
    const q = rollQuality(c, e.qualityBias);
    c.relics.push({ defId: rid, quality: q });
    addCodex(c, "relic", rid);
    if (def.once) markOnce();
  } else if (e.kind === "static_prod_add") {
    for (const [k, v] of Object.entries(e.add)) {
      if (v == null) continue;
      const id = k as ResourceId;
      c.staticProdAdd[id] = (c.staticProdAdd[id] ?? 0) + v;
    }
    if (e.once) markOnce();
  } else if (e.kind === "static_storage_add") {
    for (const [k, v] of Object.entries(e.add)) {
      if (v == null) continue;
      const id = k as ResourceId;
      c.staticStorageAdd[id] = (c.staticStorageAdd[id] ?? 0) + v;
    }
    if (e.once) markOnce();
  } else if (e.kind === "evolution_ritual_advance") {
    const er = state.evolutionRitual;
    if (er && er.endsAt > atTimeMs) {
      const remain = er.endsAt - atTimeMs;
      const skip = remain * Math.min(0.95, e.frac);
      er.endsAt = Math.max(atTimeMs + 800, er.endsAt - skip);
    }
  } else if (e.kind === "research_progress_advance") {
    for (const a of state.activeActions) {
      if (a.kind !== "research") continue;
      if (a.endsAt <= atTimeMs) continue;
      const remain = a.endsAt - atTimeMs;
      a.endsAt = Math.max(atTimeMs + 400, a.endsAt - remain * Math.min(0.95, e.frac));
    }
  } else if (e.kind === "eureka_base_rate_add") {
    c.eurekaRateAdd = (c.eurekaRateAdd ?? 0) + e.add;
    if (e.once) markOnce();
  } else if (e.kind === "bonus_all_resources_mult") {
    pushBonusAllResources(state, e.mult, `civ6_eur_${def.id}`);
    markOnce();
  }
}

export function civ6GreatPersonEurekaBonus(state: GameState): number {
  const c = state.civ6;
  if (!c) return 0;
  let s = 0;
  for (const [id, row] of Object.entries(c.greatPeople)) {
    const def = GREAT_PERSON_MAP[id];
    if (!def || !row) continue;
    s += row.level * def.eurekaChanceAdd;
  }
  return s;
}

export function civ6GreatUpgradeCostFactor(state: GameState): number {
  const c = state.civ6;
  if (!c) return 1;
  let f = 1;
  for (const inst of c.relics) {
    const d = RELIC_MAP[inst.defId];
    if (!d) continue;
    f *= Math.pow(d.greatCostFactor, qualityMultiplier(inst.quality));
  }
  return Math.max(0.85, f);
}

export function civ6ProductionAddFraction(state: GameState, resource: ResourceId): number {
  const c = state.civ6;
  if (!c) return 0;
  let add = 0;
  for (const b of c.activeBuffs) {
    if (b.kind === "temp_prod_mult") {
      if (b.resource !== resource) continue;
      add += Math.max(0, b.mult - 1);
    } else if (b.kind === "temp_all_prod_mult") {
      add += Math.max(0, b.mult - 1);
    }
  }
  add += c.staticProdAdd[resource] ?? 0;
  for (const [id, row] of Object.entries(c.greatPeople)) {
    const d = GREAT_PERSON_MAP[id];
    if (!d || !row) continue;
    const lv = row.level;
    if (lv <= 0) continue;
    add += (d.perLevelProdAdd[resource] ?? 0) * lv;
  }
  for (const inst of c.relics) {
    const d = RELIC_MAP[inst.defId];
    if (!d) continue;
    const base = d.baseProdAdd[resource] ?? 0;
    add += base * qualityMultiplier(inst.quality);
  }
  add = Math.min(PER_RESOURCE_ADD_CAP, Math.max(0, add));
  return add;
}

export function civ6StorageFlatAdd(state: GameState, resource: ResourceId): import("break_infinity.js").default {
  const c = state.civ6;
  if (!c) return dZero();
  let n = c.staticStorageAdd[resource] ?? 0;
  for (const [id, row] of Object.entries(c.greatPeople)) {
    const d = GREAT_PERSON_MAP[id];
    if (!d || !row) continue;
    n += d.perLevelStorageAdd * row.level;
  }
  for (const inst of c.relics) {
    const d = RELIC_MAP[inst.defId];
    if (!d) continue;
    n += d.baseStorageAdd * qualityMultiplier(inst.quality);
  }
  return D(Math.min(400, n));
}

/** 伟人下一级升级花费预览（不修改 state；与 tryUpgradeGreatPerson 内计算一致） */
export function previewGreatPersonUpgradeCost(
  state: GameState,
  id: string,
): { cost: Partial<Record<ResourceId, string>>; factor: number } | null {
  const c = state.civ6;
  if (!c) return null;
  const def = GREAT_PERSON_MAP[id];
  if (!def) return null;
  if (eraIndex(state.currentEra) < eraIndex(def.minEra)) return null;
  const cur = c.greatPeople[id]?.level ?? 0;
  if (cur >= def.maxLevel) return null;
  const f = civ6GreatUpgradeCostFactor(state);
  const cost: Partial<Record<ResourceId, string>> = {};
  for (const [k, v] of Object.entries(def.perLevelCost)) {
    if (!v) continue;
    const rid = k as ResourceId;
    cost[rid] = D(v).mul(f).toString();
  }
  return { cost, factor: f };
}

export function tryUpgradeGreatPerson(
  state: GameState,
  id: string,
): { ok: true } | { ok: false; reason: string } {
  const c = state.civ6;
  if (!c) return { ok: false, reason: "civ6_locked" };
  const def = GREAT_PERSON_MAP[id];
  if (!def) return { ok: false, reason: "civ6_invalid" };
  if (eraIndex(state.currentEra) < eraIndex(def.minEra)) return { ok: false, reason: "era_locked" };
  const cur = c.greatPeople[id]?.level ?? 0;
  if (cur >= def.maxLevel) return { ok: false, reason: "civ6_max_level" };
  const cost: Partial<Record<ResourceId, import("break_infinity.js").default>> = {};
  const f = civ6GreatUpgradeCostFactor(state);
  for (const [k, v] of Object.entries(def.perLevelCost)) {
    if (!v) continue;
    const rid = k as ResourceId;
    cost[rid] = D(v).mul(f);
  }
  for (const [k, v] of Object.entries(cost)) {
    if (!v) continue;
    if (getResource(state, k as ResourceId).lt(v)) return { ok: false, reason: "insufficient_resources" };
  }
  for (const [k, v] of Object.entries(cost)) {
    if (!v) continue;
    const rid = k as ResourceId;
    const next = getResource(state, rid).sub(v);
    state.resources[rid] = next.toString();
  }
  c.greatPeople[id] = { level: cur + 1 };
  addCodex(c, "great", id);
  return { ok: true };
}
