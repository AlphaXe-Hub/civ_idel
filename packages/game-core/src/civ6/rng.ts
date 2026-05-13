import type { Civ6State } from "../types.js";

/** 32-bit LCG，推进并返回 [0,1) */
export function civ6Next01(c: Civ6State): number {
  c.rngSeed = (Math.imul(1664525, c.rngSeed >>> 0) + 1013904223) >>> 0;
  return c.rngSeed / 4294967296;
}
