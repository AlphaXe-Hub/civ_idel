import type { GameState } from "../types.js";
import { eraIndex } from "../config/eras.js";
import { civ6Next01 } from "./rng.js";
import { EUREKA_DEFS, type EurekaDef, type EurekaTrigger } from "./defs.js";
import { applyEurekaDef, civ6GreatPersonEurekaBonus } from "./apply.js";

function matchesTrigger(tr: EurekaTrigger, want: EurekaTrigger["type"]): boolean {
  return tr.type === want;
}

function eligibleTickDefs(state: GameState): EurekaDef[] {
  const ei = eraIndex(state.currentEra);
  return EUREKA_DEFS.filter(
    (d) => matchesTrigger(d.trigger, "tick_random") && eraIndex(d.minEra) <= ei,
  );
}

function pickWeighted(state: GameState, defs: EurekaDef[]): EurekaDef | null {
  const c = state.civ6;
  if (!c || defs.length === 0) return null;
  let w = 0;
  for (const d of defs) w += d.weight;
  if (w <= 0) return null;
  let r = civ6Next01(c) * w;
  for (const d of defs) {
    r -= d.weight;
    if (r <= 0) return d;
  }
  return defs[defs.length - 1] ?? null;
}

/** 每个 advanceTime 子段调用：推进 RNG、清理过期 buff、随机尤里卡、计数类尤里卡 */
export function civ6ProcessTime(state: GameState, tNow: number, dtMs: number): void {
  const c = state.civ6;
  if (!c) return;
  c.activeBuffs = c.activeBuffs.filter((b) => b.untilMs > tNow);

  const tickDefs = eligibleTickDefs(state);
  if (!tickDefs.length) return;
  const base = tickDefs.reduce((s, d) => {
    const tr = d.trigger;
    return s + (tr.type === "tick_random" ? tr.baseP : 0);
  }, 0);
  const era = eraIndex(state.currentEra);
  const gp = civ6GreatPersonEurekaBonus(state);
  const avgBase = base / Math.max(1, tickDefs.length);
  const p0 = Math.min(0.00055, avgBase * (1 + era * 0.07) + gp);
  const p = 1 - Math.pow(1 - p0, Math.min(dtMs, 3_600_000) / 1000);
  const pCap = Math.min(0.12, p);
  if (civ6Next01(c) >= pCap) return;
  const pick = pickWeighted(state, tickDefs);
  if (pick) applyEurekaDef(state, pick, tNow);
}

export function civ6DispatchTrigger(
  state: GameState,
  kind: "on_building_complete" | "on_evolve" | "on_research_complete",
  atTimeMs: number,
): void {
  const c = state.civ6;
  if (!c) return;
  const ei = eraIndex(state.currentEra);
  const defs = EUREKA_DEFS.filter((d) => d.trigger.type === kind && eraIndex(d.minEra) <= ei);
  if (!defs.length) return;
  const pick = pickWeighted(state, defs);
  if (pick) applyEurekaDef(state, pick, atTimeMs);
}
