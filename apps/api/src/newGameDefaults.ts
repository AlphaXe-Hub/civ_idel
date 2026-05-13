import type { SaveGame } from "./validateSave.js";

/**
 * 与 `packages/game-core/src/state.ts` 中 `createInitialState` 保持字段一致（新用户首存）。
 * 若开局数值调整，请同步改两处。
 */
export function createInitialSave(nowMs: number): SaveGame {
  return {
    saveVersion: 1,
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
    buildings: {
      hut: { level: 1 },
      lumberCamp: { level: 1 },
      stonePit: { level: 1 },
      library: { level: 0 },
      clayWorks: { level: 0 },
      foundry: { level: 0 },
      coalShaft: { level: 0 },
    },
    techStatus: {
      fire: "available",
      tools: "locked",
      agriculture: "locked",
    },
    activeActions: [],
    completedQuests: [],
    questCounters: {},
    bonusModifiers: [],
    autoUpgradeBuildingIds: [],
    civ6: {
      rngSeed: 0x9e3779b9,
      seenEurekaIds: [],
      activeBuffs: [],
      greatPeople: {},
      relics: [],
      codexUnlocked: { eureka: [], great: [], relic: [] },
      counters: {},
      staticProdAdd: {},
      staticStorageAdd: {},
    },
  };
}
