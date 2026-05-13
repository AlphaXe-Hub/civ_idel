import type { EraId, RelicQuality, ResourceId } from "../types.js";
import { eraIndex } from "../config/eras.js";
import { EUREKA_IDS, GREAT_PERSON_IDS, RELIC_IDS } from "./defIds.js";
import {
  RAW_EUREKA_ROWS,
  RAW_GREAT_ROWS,
  RAW_RELIC_ROWS,
  docEraToGameEra,
  greatEurekaChanceAdd,
  greatPerLevelProd,
  greatPerLevelStorage,
  relicNumericFromRow,
  resourceBundleForEureka,
  type RawEurekaRow,
} from "./featureData.js";

export type EurekaTrigger =
  | { type: "tick_random"; baseP: number }
  | { type: "on_building_complete" }
  | { type: "on_evolve" }
  | { type: "on_research_complete" }
  | { type: "counter"; key: string; every: number };

export type EurekaEffect =
  | { kind: "temp_prod_mult"; resource: ResourceId; mult: number; durationMs: number }
  | { kind: "temp_all_prod_mult"; mult: number; durationMs: number }
  | { kind: "instant_resource"; resources: Partial<Record<ResourceId, string>> }
  | { kind: "roll_relic"; qualityBias: number }
  | { kind: "static_prod_add"; add: Partial<Record<ResourceId, number>>; once: boolean }
  | { kind: "static_storage_add"; add: Partial<Record<ResourceId, number>>; once: boolean }
  | { kind: "evolution_ritual_advance"; frac: number }
  | { kind: "research_progress_advance"; frac: number }
  | { kind: "eureka_base_rate_add"; add: number; once: boolean }
  | { kind: "bonus_all_resources_mult"; mult: number };

export interface EurekaDef {
  id: string;
  emoji: string;
  title: string;
  i18nKey: string;
  iconKey?: string;
  minEra: EraId;
  trigger: EurekaTrigger;
  weight: number;
  effect: EurekaEffect;
  once?: boolean;
}

export interface GreatPersonDef {
  id: string;
  emoji: string;
  title: string;
  i18nKey: string;
  iconKey?: string;
  minEra: EraId;
  maxLevel: number;
  roleType: string;
  roleTag: string;
  /** feature.md：伟人解锁且处于该时代时，尤里卡概率/奖励乘法叠乘 */
  eurekaLink: { era: EraId; chanceUp: number; rewardBonus: number };
  perLevelCost: Partial<Record<ResourceId, string>>;
  perLevelProdAdd: Partial<Record<ResourceId, number>>;
  perLevelStorageAdd: number;
  eurekaChanceAdd: number;
}

export interface RelicDef {
  id: string;
  emoji: string;
  title: string;
  i18nKey: string;
  iconKey?: string;
  minEra: EraId;
  weight: number;
  baseProdAdd: Partial<Record<ResourceId, number>>;
  baseStorageAdd: number;
  greatCostFactor: number;
}

const TRIGGERS: EurekaTrigger[] = [
  { type: "tick_random", baseP: 0.00011 },
  { type: "on_building_complete" },
  { type: "on_evolve" },
  { type: "on_research_complete" },
  { type: "tick_random", baseP: 0.0001 },
];

function triggerFromSlot(slot: RawEurekaRow["triggerSlot"]): EurekaTrigger {
  return TRIGGERS[slot]!;
}

function eurekaEffectFromRaw(raw: RawEurekaRow, minEra: EraId): EurekaEffect {
  const e = raw.effect;
  switch (e.kind) {
    case "resource":
      return { kind: "instant_resource", resources: resourceBundleForEureka(minEra, e.value) };
    case "era":
      return { kind: "evolution_ritual_advance", frac: e.frac };
    case "tech":
      return { kind: "research_progress_advance", frac: e.frac };
    case "buff":
      return { kind: "temp_all_prod_mult", mult: e.mult, durationMs: e.timeSec * 1000 };
    case "relic":
      return { kind: "roll_relic", qualityBias: e.bias };
    case "greatXp":
      return { kind: "instant_resource", resources: { knowledge: String(Math.min(999, e.amount * 3)) } };
    case "storage": {
      const keys: ResourceId[] =
        eraIndex(minEra) >= 4
          ? ["food", "wood", "stone", "knowledge", "clay", "metal", "coal"]
          : eraIndex(minEra) >= 2
            ? ["food", "wood", "stone", "knowledge", "clay"]
            : ["food", "wood", "stone"];
      const add: Partial<Record<ResourceId, number>> = {};
      const flat = 6 + Math.round(e.frac * 40);
      for (const k of keys) add[k] = flat;
      return { kind: "static_storage_add", add, once: true };
    }
    case "eurekaUp":
      return { kind: "eureka_base_rate_add", add: e.add, once: true };
    case "allBuff":
      return { kind: "bonus_all_resources_mult", mult: 1 + e.frac };
  }
}

export const EUREKA_DEFS: EurekaDef[] = RAW_EUREKA_ROWS.map((raw, i) => {
  const id = EUREKA_IDS[i]!;
  const minEra = docEraToGameEra(raw.docEra);
  return {
    id,
    emoji: raw.emoji,
    title: raw.title,
    i18nKey: `civ6.eureka.${id}`,
    minEra,
    trigger: triggerFromSlot(raw.triggerSlot),
    weight: raw.weight,
    effect: eurekaEffectFromRaw(raw, minEra),
    once: raw.once,
  };
});

export const EUREKA_MAP = Object.fromEntries(EUREKA_DEFS.map((d) => [d.id, d])) as Record<string, EurekaDef>;

export const GREAT_PERSON_DEFS: GreatPersonDef[] = RAW_GREAT_ROWS.map((row, i) => {
  const id = GREAT_PERSON_IDS[i]!;
  const minEra = docEraToGameEra(row.docEra);
  const ei = eraIndex(minEra);
  return {
    id,
    emoji: row.emoji,
    title: row.name,
    i18nKey: `civ6.great.${id}`,
    minEra,
    maxLevel: 3,
    roleType: row.roleType,
    roleTag: row.roleTag,
    eurekaLink: {
      era: minEra,
      chanceUp: row.linkChanceUp,
      rewardBonus: row.linkRewardBonus,
    },
    perLevelCost: {
      knowledge: String(4 + ei * 3 + Math.round(row.costScale * 2)),
      wood: String(30 + ei * 18 + i * 4),
      food: String(22 + ei * 14 + i * 3),
    },
    perLevelProdAdd: greatPerLevelProd(row),
    perLevelStorageAdd: greatPerLevelStorage(row),
    eurekaChanceAdd: greatEurekaChanceAdd(row),
  };
});

export const GREAT_PERSON_MAP = Object.fromEntries(GREAT_PERSON_DEFS.map((d) => [d.id, d])) as Record<
  string,
  GreatPersonDef
>;

const Q_MULT: Record<RelicQuality, number> = {
  common: 1,
  rare: 1.12,
  epic: 1.28,
  legendary: 1.45,
};

export const RELIC_DEFS: RelicDef[] = RAW_RELIC_ROWS.map((row, i) => {
  const id = RELIC_IDS[i]!;
  const num = relicNumericFromRow(row);
  return {
    id,
    emoji: row.icon,
    title: row.name,
    i18nKey: `civ6.relic.${id}`,
    minEra: row.minEra,
    weight: row.weight,
    baseProdAdd: num.baseProdAdd,
    baseStorageAdd: num.baseStorageAdd,
    greatCostFactor: num.greatCostFactor,
  };
});

export const RELIC_MAP = Object.fromEntries(RELIC_DEFS.map((d) => [d.id, d])) as Record<string, RelicDef>;

export function qualityMultiplier(q: RelicQuality): number {
  return Q_MULT[q];
}
