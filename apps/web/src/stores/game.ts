import {
  createInitialState,
  applyOffline,
  tickOnline,
  refreshQuests,
  startResearch,
  startBuildingUpgrade,
  startEvolution,
  canEvolve,
  canStartAction,
  ERA_MAP,
  BUILDINGS,
  TECHS,
  QUESTS,
  RESOURCE_MAP,
  storageCaps,
  nextEra,
  setTimeScale,
  getTimeScale,
} from "@civ-idle/game-core";
import type { GameState, BuildingId, TechId } from "@civ-idle/game-core";
import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import { apiFetch } from "../api/client";
import { i18n, translateErrorReason } from "../i18n";

export const useGameStore = defineStore("game", () => {
  const state = shallowRef<GameState | null>(null);
  const serverOffsetMs = ref(0);
  const lastTickGameMs = ref(0);
  const loading = ref(false);
  const syncError = ref<string | null>(null);
  const offlineMessage = ref<string | null>(null);
  /** 当前调试时间倍率（来自 /game-speed.json） */
  const timeScale = ref(getTimeScale());
  let saveTimer: ReturnType<typeof setInterval> | null = null;
  let tickTimer: ReturnType<typeof setInterval> | null = null;

  function nowMs() {
    return Date.now() + serverOffsetMs.value;
  }

  function stopLoops() {
    if (tickTimer) clearInterval(tickTimer);
    if (saveTimer) clearInterval(saveTimer);
    tickTimer = null;
    saveTimer = null;
  }

  async function loadGameSpeedFromConfig() {
    try {
      const res = await fetch("/game-speed.json", { cache: "no-store" });
      if (!res.ok) return;
      const j = (await res.json()) as { timeScale?: unknown };
      const n = Number(j.timeScale);
      if (Number.isFinite(n) && n > 0) setTimeScale(n);
    } catch {
      /* 默认 1 */
    }
    timeScale.value = getTimeScale();
  }

  async function bootstrap() {
    loading.value = true;
    syncError.value = null;
    stopLoops();
    try {
      await loadGameSpeedFromConfig();
      const res = (await apiFetch("/save")) as { save: GameState | null; serverTimeMs: number };
      serverOffsetMs.value = res.serverTimeMs - Date.now();
      const t = nowMs();
      if (!res.save) {
        state.value = createInitialState(t);
      } else {
        const { state: s, appliedMs, completedSummary } = applyOffline(
          res.save,
          res.save.lastSyncedAt,
          t,
        );
        state.value = s;
        const minutes = Math.floor(appliedMs / 60000);
        if (appliedMs > 5000 && completedSummary.length) {
          offlineMessage.value = i18n.global.t("offline.withBody", {
            minutes,
            body: completedSummary.join("\n"),
          });
        } else if (appliedMs > 5000) {
          offlineMessage.value = i18n.global.t("offline.noBody", { minutes });
        }
      }
      lastTickGameMs.value = state.value!.lastSyncedAt;
      startLoops();
    } catch (e) {
      syncError.value = e instanceof Error ? e.message : i18n.global.t("errors.load_failed");
    } finally {
      loading.value = false;
    }
  }

  function startLoops() {
    tickTimer = setInterval(() => {
      const s = state.value;
      if (!s) return;
      const gameNow = nowMs();
      const next = tickOnline(s, gameNow, lastTickGameMs.value);
      state.value = next;
      lastTickGameMs.value = gameNow;
    }, 500);
    saveTimer = setInterval(() => void pushSave(), 30_000);
  }

  async function pushSave() {
    const s = state.value;
    if (!s) return;
    try {
      const t = nowMs();
      const payload = { ...s, lastSyncedAt: t };
      await apiFetch("/save", { method: "PUT", body: JSON.stringify({ save: payload }) });
      syncError.value = null;
    } catch (e) {
      syncError.value = e instanceof Error ? e.message : i18n.global.t("errors.sync_failed");
    }
  }

  function patch(next: GameState) {
    refreshQuests(next);
    state.value = next;
  }

  function research(techId: TechId) {
    const s = state.value;
    if (!s) return;
    const r = startResearch(s, techId, nowMs());
    if (r.ok) patch(r.state);
    else alert(translateErrorReason(r.reason));
  }

  function upgradeBuilding(id: BuildingId) {
    const s = state.value;
    if (!s) return;
    const r = startBuildingUpgrade(s, id, nowMs());
    if (r.ok) patch(r.state);
    else alert(translateErrorReason(r.reason));
  }

  function evolve() {
    const s = state.value;
    if (!s) return;
    const r = startEvolution(s, nowMs());
    if (r.ok) patch(r.state);
    else alert(translateErrorReason(r.reason));
  }

  function dismissOffline() {
    offlineMessage.value = null;
  }

  function eraThemeClass() {
    const e = state.value?.currentEra ?? "primitive";
    const map: Record<string, string> = {
      primitive: "from-amber-950 via-stone-900 to-slate-950",
      tribal: "from-emerald-950 via-stone-900 to-slate-950",
      agricultural: "from-lime-950 via-amber-950 to-slate-950",
      classical: "from-yellow-950 via-rose-950 to-slate-950",
      industrial: "from-slate-800 via-zinc-900 to-black",
      modern: "from-indigo-950 via-slate-900 to-black",
    };
    return map[e] ?? map.primitive;
  }

  return {
    state,
    loading,
    syncError,
    offlineMessage,
    bootstrap,
    pushSave,
    research,
    upgradeBuilding,
    evolve,
    dismissOffline,
    eraThemeClass,
    stopLoops,
    nowMs,
    canStartAction,
    canEvolve,
    ERA_MAP,
    BUILDINGS,
    TECHS,
    QUESTS,
    RESOURCE_MAP,
    storageCaps,
    nextEra,
    timeScale,
  };
});
