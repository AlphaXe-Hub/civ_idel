import { describe, expect, it, beforeEach } from "vitest";
import { createInitialState } from "./state.js";
import { applyEurekaDef, civ6EurekaLinkMultipliers, civ6ProductionAddFraction } from "./civ6/apply.js";
import { EUREKA_DEFS, GREAT_PERSON_DEFS } from "./civ6/defs.js";
import { advanceTime } from "./tick.js";
import { setTimeScale } from "./config/game-speed.js";

beforeEach(() => {
  setTimeScale(1);
});

describe("civ6", () => {
  it("caps civ6 production add fraction per resource", () => {
    const t0 = 1_000_000;
    const s = createInitialState(t0);
    s.civ6!.staticProdAdd.food = 10;
    const add = civ6ProductionAddFraction(s, "food");
    expect(add).toBeLessThanOrEqual(0.35);
  });

  it("advanceTime with civ6 runs on long dt", () => {
    const t0 = 0;
    const s = createInitialState(t0);
    const summary: string[] = [];
    advanceTime(s, t0, t0 + 120_000, summary);
    expect(s.resources.food).toBeDefined();
  });

  it("civ6EurekaLinkMultipliers > 1 when primitive-era great person unlocked", () => {
    const t0 = 1_000_000;
    const s = createInitialState(t0);
    s.currentEra = "primitive";
    const gp0 = GREAT_PERSON_DEFS[0]!;
    s.civ6!.greatPeople[gp0.id] = { level: 1 };
    const m = civ6EurekaLinkMultipliers(s);
    expect(m.chanceMult).toBeGreaterThan(1);
    expect(m.rewardMult).toBeGreaterThan(1);
  });

  it("applyEureka roll_relic adds codex relic entry", () => {
    const t0 = 5_000_000;
    const s = createInitialState(t0);
    s.currentEra = "classical";
    const def = EUREKA_DEFS.find((d) => d.effect.kind === "roll_relic");
    expect(def).toBeTruthy();
    if (!def) return;
    applyEurekaDef(s, def, t0);
    expect(s.civ6!.relics.length).toBeGreaterThanOrEqual(1);
    expect(s.civ6!.codexUnlocked.relic.length).toBeGreaterThanOrEqual(1);
  });
});
