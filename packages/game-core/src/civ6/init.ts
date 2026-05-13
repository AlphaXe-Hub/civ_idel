import type { Civ6State } from "../types.js";

export function createEmptyCiv6State(seed = 0x9e3779b9): Civ6State {
  return {
    rngSeed: seed >>> 0,
    seenEurekaIds: [],
    activeBuffs: [],
    greatPeople: {},
    relics: [],
    codexUnlocked: { eureka: [], great: [], relic: [] },
    counters: {},
    staticProdAdd: {},
    staticStorageAdd: {},
  };
}
