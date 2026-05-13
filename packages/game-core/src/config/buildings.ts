import { D } from "../bn.js";
import type { BuildingDef } from "../types.js";

export const BUILDINGS: BuildingDef[] = [
  {
    id: "hut",
    name: "茅屋",
    emoji: "🛖",
    minEra: "primitive",
    production: { food: 0.12 },
    upgradeTimeMs: (level) => {
      const base = 20_000 + level * 15_000;
      const slow = Math.pow(1.042, Math.max(0, level - 1));
      return Math.min(3_200_000, Math.round(base * slow));
    },
    upgradeCost: (level) => ({
      wood: D(15).mul(DecimalPow(level, 1.25)),
      stone: D(5).mul(DecimalPow(level, 1.15)),
    }),
    storageBonusPerLevel: { food: 80 },
  },
  {
    id: "lumberCamp",
    name: "伐木营地",
    emoji: "🪓",
    minEra: "primitive",
    production: { wood: 0.08 },
    upgradeTimeMs: (level) => {
      const base = 25_000 + level * 18_000;
      const slow = Math.pow(1.042, Math.max(0, level - 1));
      return Math.min(3_200_000, Math.round(base * slow));
    },
    upgradeCost: (level) => ({
      food: D(20).mul(DecimalPow(level, 1.2)),
      stone: D(8).mul(DecimalPow(level, 1.12)),
    }),
    storageBonusPerLevel: { wood: 70 },
  },
  {
    id: "stonePit",
    name: "采石坑",
    emoji: "⛏️",
    minEra: "primitive",
    production: { stone: 0.07 },
    upgradeTimeMs: (level) => {
      const base = 28_000 + level * 20_000;
      const slow = Math.pow(1.042, Math.max(0, level - 1));
      return Math.min(3_200_000, Math.round(base * slow));
    },
    upgradeCost: (level) => ({
      food: D(25).mul(DecimalPow(level, 1.18)),
      wood: D(18).mul(DecimalPow(level, 1.2)),
    }),
    storageBonusPerLevel: { stone: 75 },
  },
  {
    id: "library",
    name: "档案馆",
    emoji: "📚",
    minEra: "tribal",
    production: { knowledge: 0.018 },
    upgradeTimeMs: (level) => {
      const base = 30_000 + level * 20_000;
      const slow = Math.pow(1.042, Math.max(0, level - 1));
      return Math.min(3_200_000, Math.round(base * slow));
    },
    upgradeCost: (level) => {
      if (level <= 0) return { wood: D(140), stone: D(110), food: D(60) };
      return {
        wood: D(38).mul(DecimalPow(level, 1.16)),
        stone: D(32).mul(DecimalPow(level, 1.14)),
        food: D(22).mul(DecimalPow(level, 1.1)),
        knowledge: D(3).mul(DecimalPow(level, 1.06)),
      };
    },
    storageBonusPerLevel: { knowledge: 40 },
  },
  {
    id: "clayWorks",
    name: "砖瓦窑",
    emoji: "🧱",
    minEra: "agricultural",
    production: { clay: 0.055 },
    upgradeTimeMs: (level) => {
      const base = 32_000 + level * 22_000;
      const slow = Math.pow(1.042, Math.max(0, level - 1));
      return Math.min(3_200_000, Math.round(base * slow));
    },
    upgradeCost: (level) => {
      if (level <= 0) return { food: D(180), wood: D(220), stone: D(140) };
      return {
        food: D(45).mul(DecimalPow(level, 1.18)),
        wood: D(55).mul(DecimalPow(level, 1.16)),
        stone: D(40).mul(DecimalPow(level, 1.12)),
        knowledge: D(3).mul(DecimalPow(level, 1.08)),
      };
    },
    storageBonusPerLevel: { clay: 95 },
  },
  {
    id: "foundry",
    name: "冶炼坊",
    emoji: "🔩",
    minEra: "classical",
    production: { metal: 0.038 },
    upgradeTimeMs: (level) => {
      const base = 38_000 + level * 26_000;
      const slow = Math.pow(1.042, Math.max(0, level - 1));
      return Math.min(3_200_000, Math.round(base * slow));
    },
    upgradeCost: (level) => {
      if (level <= 0) return { wood: D(320), stone: D(280), clay: D(80), knowledge: D(8) };
      return {
        wood: D(70).mul(DecimalPow(level, 1.2)),
        stone: D(65).mul(DecimalPow(level, 1.15)),
        clay: D(25).mul(DecimalPow(level, 1.1)),
        knowledge: D(6).mul(DecimalPow(level, 1.12)),
      };
    },
    storageBonusPerLevel: { metal: 90 },
  },
  {
    id: "coalShaft",
    name: "竖井煤矿",
    emoji: "🏭",
    minEra: "industrial",
    production: { coal: 0.032 },
    upgradeTimeMs: (level) => {
      const base = 45_000 + level * 30_000;
      const slow = Math.pow(1.042, Math.max(0, level - 1));
      return Math.min(3_200_000, Math.round(base * slow));
    },
    upgradeCost: (level) => {
      if (level <= 0) return { wood: D(500), stone: D(420), metal: D(90), knowledge: D(25) };
      return {
        wood: D(95).mul(DecimalPow(level, 1.18)),
        stone: D(85).mul(DecimalPow(level, 1.16)),
        metal: D(35).mul(DecimalPow(level, 1.12)),
        knowledge: D(15).mul(DecimalPow(level, 1.1)),
      };
    },
    storageBonusPerLevel: { coal: 100 },
  },
];

function DecimalPow(level: number, exp: number) {
  return Math.pow(Math.max(1, level), exp);
}

export const BUILDING_MAP = Object.fromEntries(
  BUILDINGS.map((b) => [b.id, b]),
) as Record<(typeof BUILDINGS)[number]["id"], BuildingDef>;
