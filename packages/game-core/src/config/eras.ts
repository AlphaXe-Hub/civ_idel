import { D } from "../bn.js";
import type { EraDef } from "../types.js";

export const ERAS: EraDef[] = [
  {
    id: "primitive",
    name: "原始时代",
    emoji: "🪶",
    order: 0,
    evolveCost: { food: D(180), wood: D(120), stone: D(60) },
    evolveTimeMs: 60_000,
    evolveRequirements: {},
  },
  {
    id: "tribal",
    name: "部落时代",
    emoji: "🏹",
    order: 1,
    evolveCost: { food: D(800), wood: D(500), stone: D(300), knowledge: D(20) },
    evolveTimeMs: 180_000,
    evolveRequirements: {
      minBuildingLevel: { hut: 2 },
      completedTechs: ["fire"],
      completedQuests: ["q_evolve_tribal"],
    },
  },
  {
    id: "agricultural",
    name: "农耕时代",
    emoji: "🚜",
    order: 2,
    evolveCost: { food: D(5000), wood: D(3000), stone: D(2000), knowledge: D(80) },
    evolveTimeMs: 300_000,
    evolveRequirements: {
      completedTechs: ["agriculture"],
    },
  },
  {
    id: "classical",
    name: "古典时代",
    emoji: "🏛️",
    order: 3,
    evolveCost: { food: D(20000), wood: D(12000), stone: D(15000), knowledge: D(200) },
    evolveTimeMs: 600_000,
    evolveRequirements: {},
  },
  {
    id: "industrial",
    name: "工业时代",
    emoji: "🏭",
    order: 4,
    evolveCost: { food: D(100000), wood: D(80000), stone: D(120000), knowledge: D(800) },
    evolveTimeMs: 900_000,
    evolveRequirements: {},
  },
  {
    id: "modern",
    name: "现代",
    emoji: "🌐",
    order: 5,
    evolveCost: {},
    evolveTimeMs: 0,
    evolveRequirements: {},
  },
];

export const ERA_ORDER: EraDef["id"][] = ERAS.map((e) => e.id);

export const ERA_MAP = Object.fromEntries(ERAS.map((e) => [e.id, e])) as Record<
  (typeof ERAS)[number]["id"],
  EraDef
>;

export function nextEra(current: EraDef["id"]): EraDef["id"] | null {
  const idx = ERAS.findIndex((e) => e.id === current);
  if (idx < 0 || idx + 1 >= ERAS.length) return null;
  return ERAS[idx + 1]!.id;
}

export function eraIndex(id: EraDef["id"]): number {
  return ERAS.find((e) => e.id === id)?.order ?? 0;
}

/** 时代越高，可同时进行的建造/研究队列越多（上限 8） */
export function maxActionSlotsForEra(era: EraDef["id"]): number {
  return Math.min(8, 2 + eraIndex(era));
}
