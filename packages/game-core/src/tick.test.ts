import { describe, expect, it, beforeEach } from "vitest";
import { createInitialState } from "./state.js";
import { applyOffline, advanceTime, OFFLINE_CAP_MS, refreshQuests } from "./tick.js";
import { startBuildingUpgrade } from "./actions.js";
import { setTimeScale } from "./config/game-speed.js";

beforeEach(() => {
  setTimeScale(1);
});

describe("tick / offline", () => {
  it("applies passive income over time", () => {
    const t0 = 1_000_000;
    let s = createInitialState(t0);
    const summary: string[] = [];
    advanceTime(s, t0, t0 + 10_000, summary);
    expect(Number(s.resources.food)).toBeGreaterThan(30);
  });

  it("applies passive faster when timeScale > 1", () => {
    const t0 = 1_000_000;
    const baseline = createInitialState(t0);
    advanceTime(baseline, t0, t0 + 1_000, []);
    setTimeScale(10);
    const fast = createInitialState(t0);
    advanceTime(fast, t0, t0 + 1_000, []);
    expect(Number(fast.resources.food)).toBeGreaterThan(Number(baseline.resources.food));
  });

  it("caps offline delta", () => {
    const t0 = 0;
    const s0 = createInitialState(t0);
    const far = t0 + OFFLINE_CAP_MS + 60 * 60 * 1000;
    const { appliedMs } = applyOffline(s0, t0, far);
    expect(appliedMs).toBe(OFFLINE_CAP_MS);
  });

  it("rejects negative time travel", () => {
    const s0 = createInitialState(1000);
    const r = applyOffline(s0, 2000, 1000);
    expect(r.appliedMs).toBe(0);
  });

  it("completes building upgrade queued offline", () => {
    const t0 = 0;
    let s = createInitialState(t0);
    const up = startBuildingUpgrade(s, "hut", t0);
    expect(up.ok).toBe(true);
    if (!up.ok) return;
    s = up.state;
    const dur = s.activeActions[0]!.endsAt - t0 + 1000;
    const { state, completedSummary } = applyOffline(s, t0, t0 + dur);
    expect(state.buildings.hut.level).toBeGreaterThanOrEqual(2);
    expect(completedSummary.some((x) => x.includes("升级完成"))).toBe(true);
  });
});

describe("quests", () => {
  it("chains auto completion when prerequisites met", () => {
    const t = 0;
    const s = createInitialState(t);
    s.resources.food = "60";
    refreshQuests(s);
    expect(s.completedQuests).toContain("q_gather_food");
    expect(s.completedQuests).toContain("q_build_hut");
  });
});
