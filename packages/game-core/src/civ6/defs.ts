import type { EraId, RelicQuality, ResourceId } from "../types.js";
import { EUREKA_IDS, GREAT_PERSON_IDS, RELIC_IDS } from "./defIds.js";

const ERAS: EraId[] = ["primitive", "tribal", "agricultural", "classical", "industrial", "modern"];
const RES: ResourceId[] = ["food", "wood", "stone", "knowledge", "clay", "metal", "coal"];

const EMO_EUR = [
  "💡", "🔭", "⚗️", "📐", "🧭", "🗺️", "⏳", "🔥", "🌊", "🌾", "🪨", "🪵", "⚒️", "🏺", "📜", "✨",
  "🎓", "🖋️", "🧪", "🔬", "🛠️", "⚙️", "🧱", "🏛️", "🎭", "🎼", "🖼️", "📡", "🛰️", "🌐", "🤖", "🧬",
];
const EMO_GP = [
  "🧙", "👩‍🔬", "👨‍🎨", "👩‍🏫", "🧑‍🚀", "👨‍⚕️", "👩‍🌾", "🧑‍🏭", "👨‍✈️", "👩‍✈️", "🦸", "🦹", "🧝", "🧚", "🧞", "🧌",
  "👸", "🤴", "🥷", "🧑‍🎤", "👨‍🍳", "👩‍🍳", "🧑‍🎨", "👨‍💻", "👩‍💻", "🧑‍🔧", "👨‍🔬", "👩‍🔬", "🧑‍🚒", "👮", "🕵️", "🤵",
];
const EMO_REL = [
  "🏺", "🗿", "⚱️", "🪙", "💎", "🔮", "📿", "🧿", "🗝️", "⚔️", "🛡️", "🏹", "🗡️", "👑", "💍", "📿",
  "🦴", "🪶", "🐚", "🪨", "🧱", "📜", "📖", "🗞️", "🖼️", "🎎", "🎏", "🎐", "🏮", "🧧", "🪔", "🕯️",
];

export type EurekaTrigger =
  | { type: "tick_random"; baseP: number }
  | { type: "on_building_complete" }
  | { type: "on_evolve" }
  | { type: "on_research_complete" }
  | { type: "counter"; key: string; every: number };

export type EurekaEffect =
  | { kind: "temp_prod_mult"; resource: ResourceId; mult: number; durationMs: number }
  | { kind: "instant_resource"; resources: Partial<Record<ResourceId, string>> }
  | { kind: "roll_relic"; qualityBias: number }
  | { kind: "static_prod_add"; add: Partial<Record<ResourceId, number>>; once: boolean }
  | { kind: "static_storage_add"; add: Partial<Record<ResourceId, number>>; once: boolean };

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

const TRIG_ROT: EurekaTrigger[] = [
  { type: "tick_random", baseP: 0.00012 },
  { type: "on_building_complete" },
  { type: "on_evolve" },
  { type: "on_research_complete" },
  { type: "tick_random", baseP: 0.0001 },
];

function eraAt(i: number): EraId {
  return ERAS[Math.min(5, Math.floor(i / 7))]!;
}

function pickRes(i: number): ResourceId {
  return RES[i % RES.length]!;
}

export const EUREKA_DEFS: EurekaDef[] = EUREKA_IDS.map((id, i) => {
  const trig = TRIG_ROT[i % TRIG_ROT.length]!;
  const r = pickRes(i);
  const effRot = i % 5;
  let effect: EurekaEffect;
  if (effRot === 0) {
    effect = { kind: "temp_prod_mult", resource: r, mult: 1.03 + (i % 5) * 0.01, durationMs: 45_000 + i * 1000 };
  } else if (effRot === 1) {
    effect = { kind: "instant_resource", resources: { [r]: String(3 + (i % 8)) } };
  } else if (effRot === 2) {
    effect = { kind: "roll_relic", qualityBias: 0.02 + (i % 8) * 0.005 };
  } else if (effRot === 3) {
    effect = { kind: "static_prod_add", add: { [r]: 0.002 + (i % 4) * 0.001 }, once: true };
  } else {
    effect = { kind: "static_storage_add", add: { [r]: 4 + (i % 6) }, once: true };
  }
  return {
    id,
    emoji: EMO_EUR[i % EMO_EUR.length]!,
    title: `尤里卡 ${i + 1}`,
    i18nKey: `civ6.eureka.${id}`,
    minEra: eraAt(i),
    trigger: trig,
    weight: 0.6 + (i % 10) * 0.08,
    effect,
    once: effRot >= 3,
  };
});

export const EUREKA_MAP = Object.fromEntries(EUREKA_DEFS.map((d) => [d.id, d])) as Record<string, EurekaDef>;

export const GREAT_PERSON_DEFS: GreatPersonDef[] = GREAT_PERSON_IDS.map((id, i) => ({
  id,
  emoji: EMO_GP[i % EMO_GP.length]!,
  title: `伟人 ${i + 1}`,
  i18nKey: `civ6.great.${id}`,
  minEra: eraAt(i),
  maxLevel: 5,
  perLevelCost: {
    knowledge: String(2 + (i % 4)),
    wood: String(20 + i * 3),
    food: String(15 + i * 2),
  },
  perLevelProdAdd: { [pickRes(i)]: 0.0015 + (i % 5) * 0.0004 },
  perLevelStorageAdd: 2 + (i % 5),
  eurekaChanceAdd: 0.000008 * (1 + (i % 4)),
}));

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

export const RELIC_DEFS: RelicDef[] = RELIC_IDS.map((id, i) => ({
  id,
  emoji: EMO_REL[i % EMO_REL.length]!,
  title: `遗物 ${i + 1}`,
  i18nKey: `civ6.relic.${id}`,
  minEra: eraAt(i),
  weight: 1 + (i % 10) * 0.05,
  baseProdAdd: { [pickRes((i + 3) % 32)]: 0.001 + (i % 4) * 0.0005 },
  baseStorageAdd: 3 + (i % 7),
  greatCostFactor: 0.998 - (i % 5) * 0.0003,
}));

export const RELIC_MAP = Object.fromEntries(RELIC_DEFS.map((d) => [d.id, d])) as Record<string, RelicDef>;

export function qualityMultiplier(q: RelicQuality): number {
  return Q_MULT[q];
}
