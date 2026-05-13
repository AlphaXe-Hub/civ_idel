<script setup lang="ts">
import {
  buildingLevel,
  canPay,
  D,
  eraIndex,
  getResource,
  maxActionSlots,
  nextEra,
  passiveRatesPerSecond,
  scaledDurationMs,
  type BuildingDef,
  type GameState,
  type TechDef,
} from "@civ-idle/game-core";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { SUPPORTED_LOCALES, setAppLocale, type AppLocale } from "../i18n";
import { useAuthStore } from "../stores/auth";
import { useGameStore } from "../stores/game";
import Civ6CodexPanel from "../components/Civ6CodexPanel.vue";
import EurekaToastHost from "../components/EurekaToastHost.vue";

const { t, te, locale } = useI18n();

const game = useGameStore();
const auth = useAuthStore();
const router = useRouter();
const tab = ref<"buildings" | "tech" | "quests" | "era" | "civ6">("buildings");

const tabs = computed(() => [
  { id: "buildings" as const, label: t("game.tabBuildings") },
  { id: "tech" as const, label: t("game.tabTech") },
  { id: "quests" as const, label: t("game.tabQuests") },
  { id: "era" as const, label: t("game.tabEra") },
  { id: "civ6" as const, label: t("game.tabCiv6") },
]);

const s = computed(() => game.state);

const visibleResourceIds = computed(() => {
  const st = s.value;
  if (!st) return [] as (keyof typeof game.RESOURCE_MAP)[];
  return (Object.keys(game.RESOURCE_MAP) as (keyof typeof game.RESOURCE_MAP)[]).filter(
    (rid) => eraIndex(st.currentEra) >= eraIndex(game.RESOURCE_MAP[rid].minEra),
  );
});

const unlockWatchKey = computed(() => {
  const st = s.value;
  if (!st) return "";
  const techKey = game.TECHS.map((x) => `${x.id}:${st.techStatus[x.id]}`).join("|");
  return `${st.currentEra}|${visibleResourceIds.value.join(",")}|${techKey}`;
});

const unlockOpen = ref(false);
const unlockLines = ref<string[]>([]);

watch(unlockWatchKey, (key, prev) => {
  if (!s.value || !key) return;
  if (prev === undefined) return;
  if (prev === key) return;
  const lines = diffUnlockMessages(prev, key);
  if (lines.length) {
    unlockLines.value = lines;
    unlockOpen.value = true;
  }
});

function diffUnlockMessages(prevKey: string, nextKey: string): string[] {
  const [pe, pr, pt] = prevKey.split("|");
  const [ne, nr, nt] = nextKey.split("|");
  const lines: string[] = [];
  if (pe !== ne) {
    lines.push(t("game.unlockEra", { name: trEraName(ne as keyof typeof game.ERA_MAP) }));
  }
  const prevRes = new Set((pr ?? "").split(",").filter(Boolean));
  for (const id of (nr ?? "").split(",").filter(Boolean)) {
    if (!prevRes.has(id)) {
      lines.push(t("game.unlockResource", { name: trResource(id as keyof typeof game.RESOURCE_MAP) }));
    }
  }
  const prevTech = new Map<string, string>();
  for (const seg of (pt ?? "").split("|").filter(Boolean)) {
    const colon = seg.indexOf(":");
    if (colon > 0) prevTech.set(seg.slice(0, colon), seg.slice(colon + 1));
  }
  for (const seg of (nt ?? "").split("|").filter(Boolean)) {
    const colon = seg.indexOf(":");
    if (colon <= 0) continue;
    const id = seg.slice(0, colon);
    const status = seg.slice(colon + 1);
    const ps = prevTech.get(id);
    if (ps === "locked" && status !== "locked") {
      lines.push(t("game.unlockTech", { name: trTechId(id) }));
    }
  }
  return lines;
}

function passiveRateFor(rid: keyof typeof game.RESOURCE_MAP) {
  const st = s.value;
  if (!st) return "0";
  const r = passiveRatesPerSecond(st)[rid];
  const scaled = r.mul(D(game.timeScale));
  return fmt(scaled.toString());
}

const evolveCheck = computed(() => (s.value ? game.canEvolve(s.value) : { ok: false as const, reason: undefined as string | undefined }));

function onLocaleChange(ev: Event) {
  const v = (ev.target as HTMLSelectElement).value as AppLocale;
  setAppLocale(v);
}

function trResource(rid: keyof typeof game.RESOURCE_MAP) {
  const key = `content.resources.${rid}.name`;
  return te(key) ? t(key) : game.RESOURCE_MAP[rid].name;
}

function trBuildingName(b: BuildingDef) {
  const key = `content.buildings.${b.id}.name`;
  return te(key) ? t(key) : b.name;
}

function trBuildingId(id: string) {
  const b = game.BUILDINGS.find((x) => x.id === id);
  if (!b) return id;
  return trBuildingName(b);
}

function trTechId(id: string) {
  const key = `content.techs.${id}.name`;
  const tech = game.TECHS.find((x) => x.id === id);
  return te(key) ? t(key) : tech?.name ?? id;
}

function trQuestTitle(id: string) {
  const key = `content.quests.${id}.title`;
  const q = game.QUESTS.find((x) => x.id === id);
  return te(key) ? t(key) : q?.title ?? id;
}

function trQuestDescription(q: (typeof game.QUESTS)[number]) {
  const key = `content.quests.${q.id}.description`;
  return te(key) ? t(key) : q.description;
}

function trEraName(eraId: keyof typeof game.ERA_MAP) {
  const key = `content.eras.${eraId}.name`;
  return te(key) ? t(key) : game.ERA_MAP[eraId].name;
}

const libraryDef = game.BUILDINGS.find((b) => b.id === "library");

function scrollToBuilding(id: string) {
  document.getElementById(`building-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function buildingEraUnlocked(st: GameState, b: BuildingDef) {
  return eraIndex(st.currentEra) >= eraIndex(b.minEra);
}

const nextEraId = computed(() => (s.value ? nextEra(s.value.currentEra) : null));
const nextEraDef = computed(() => (nextEraId.value ? game.ERA_MAP[nextEraId.value] : null));

function upgradeCostRows(b: BuildingDef) {
  const st = s.value;
  if (!st) return [];
  const lv = buildingLevel(st, b.id);
  const cost = b.upgradeCost(lv);
  const rows: { emoji: string; label: string; need: string; have: string; met: boolean }[] = [];
  for (const [rid, amount] of Object.entries(cost)) {
    if (!amount) continue;
    const rId = rid as keyof typeof game.RESOURCE_MAP;
    const meta = game.RESOURCE_MAP[rId];
    const have = getResource(st, rId).toString();
    rows.push({
      emoji: meta.emoji,
      label: trResource(rId),
      need: amount.toString(),
      have,
      met: !getResource(st, rId).lt(amount),
    });
  }
  return rows;
}

function canAffordUpgrade(b: BuildingDef) {
  const st = s.value;
  if (!st) return false;
  return canPay(st, b.upgradeCost(buildingLevel(st, b.id)));
}

function nextUpgradeDurationSec(b: BuildingDef) {
  const st = s.value;
  if (!st) return 0;
  return Math.ceil(scaledDurationMs(b.upgradeTimeMs(buildingLevel(st, b.id))) / 1000);
}

function researchCostRows(t: TechDef) {
  const st = s.value;
  if (!st) return [];
  const rows: { emoji: string; label: string; need: string; have: string; met: boolean }[] = [];
  for (const [rid, amount] of Object.entries(t.cost)) {
    if (!amount) continue;
    const rId = rid as keyof typeof game.RESOURCE_MAP;
    const meta = game.RESOURCE_MAP[rId];
    const have = getResource(st, rId).toString();
    rows.push({
      emoji: meta.emoji,
      label: trResource(rId),
      need: amount.toString(),
      have,
      met: !getResource(st, rId).lt(amount),
    });
  }
  return rows;
}

function canAffordResearch(t: TechDef) {
  const st = s.value;
  if (!st) return false;
  return canPay(st, t.cost);
}

function researchDurationSec(t: TechDef) {
  return Math.ceil(scaledDurationMs(t.researchTimeMs) / 1000);
}

function evolveCostRows() {
  const st = s.value;
  if (!st) return [];
  const cur = game.ERA_MAP[st.currentEra];
  const rows: { emoji: string; label: string; need: string; have: string; met: boolean }[] = [];
  for (const [rid, amount] of Object.entries(cur.evolveCost)) {
    if (!amount) continue;
    const rId = rid as keyof typeof game.RESOURCE_MAP;
    const meta = game.RESOURCE_MAP[rId];
    const have = getResource(st, rId).toString();
    rows.push({
      emoji: meta.emoji,
      label: trResource(rId),
      need: amount.toString(),
      have,
      met: !getResource(st, rId).lt(amount),
    });
  }
  return rows;
}

function evolveRitualDurationSec() {
  const st = s.value;
  if (!st) return 0;
  const cur = game.ERA_MAP[st.currentEra];
  return Math.ceil(scaledDurationMs(cur.evolveTimeMs) / 1000);
}

function fmt(n: string) {
  const x = Number(n);
  if (!Number.isFinite(x)) return n;
  if (x >= 1e6) return x.toExponential(2);
  if (x >= 1000) return x.toFixed(0);
  if (x >= 10) return x.toFixed(1);
  return x.toFixed(2);
}

function actionProgress(a: { startedAt: number; endsAt: number }) {
  const now = game.nowMs();
  const d = a.endsAt - a.startedAt;
  if (d <= 0) return 100;
  const frac = Math.min(1, Math.max(0, (now - a.startedAt) / d));
  return Math.round(frac * 100);
}

function ritualProgress() {
  const r = s.value?.evolutionRitual;
  if (!r) return 0;
  return actionProgress(r);
}

onMounted(async () => {
  await game.bootstrap();
});

onUnmounted(() => {
  game.stopLoops();
});

async function logout() {
  game.stopLoops();
  try {
    await auth.logout();
  } finally {
    await router.push("/login");
  }
}

function resAmount(id: string) {
  return s.value?.resources[id as keyof NonNullable<typeof s.value>["resources"]] ?? "0";
}
</script>

<template>
  <div
    v-if="game.loading"
    class="flex min-h-full items-center justify-center bg-slate-950 text-slate-300"
  >
    <span class="text-2xl">⏳</span>
    <span class="ml-2">{{ t("game.loading") }}</span>
  </div>
  <div
    v-else-if="!s"
    class="flex min-h-full flex-col items-center justify-center gap-4 bg-slate-950 text-slate-300"
  >
    <p>{{ game.syncError ?? t("game.loadError") }}</p>
    <button class="rounded-lg bg-indigo-600 px-4 py-2 text-white" type="button" @click="game.bootstrap()">
      {{ t("common.retry") }}
    </button>
  </div>
  <div
    v-else
    class="flex min-h-full flex-col bg-gradient-to-br text-slate-100"
    :class="game.eraThemeClass()"
  >
    <header
      class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl" aria-hidden="true">{{ game.ERA_MAP[s.currentEra].emoji }}</span>
        <div>
          <div class="text-sm font-semibold">{{ trEraName(s.currentEra) }}</div>
          <div class="text-xs text-slate-400">
            {{ t("game.queueLine", { n: s.activeActions.length, max: maxActionSlots(s) }) }}
          </div>
          <div
            v-if="game.timeScale !== 1 || game.queueTimeScale !== 1"
            class="mt-0.5 flex flex-wrap gap-1"
          >
            <span
              v-if="game.timeScale !== 1"
              class="inline-block rounded bg-amber-500/25 px-1.5 py-0.5 text-[10px] font-medium text-amber-200"
              :title="t('game.timeScaleTitle')"
            >
              {{ t("game.timeScaleBadge", { n: game.timeScale }) }}
            </span>
            <span
              v-if="game.queueTimeScale !== 1 && game.queueTimeScale !== game.timeScale"
              class="inline-block rounded bg-sky-500/25 px-1.5 py-0.5 text-[10px] font-medium text-sky-200"
              :title="t('game.queueTimeScaleTitle')"
            >
              {{ t("game.queueTimeScaleBadge", { n: game.queueTimeScale }) }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-3 text-sm">
        <div
          v-for="rid in visibleResourceIds"
          :key="rid"
          class="flex items-center gap-1 rounded-full bg-black/30 px-3 py-1"
        >
          <span>{{ game.RESOURCE_MAP[rid].emoji }}</span>
          <span class="font-mono">{{ fmt(resAmount(rid)) }}</span>
          <span class="text-slate-500">/</span>
          <span class="font-mono text-slate-400">{{ fmt(game.storageCaps(s)[rid].toString()) }}</span>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <label class="flex items-center gap-1 text-xs text-slate-400">
          <span class="sr-only">{{ t("game.langLabel") }}</span>
          <select
            class="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-slate-200 outline-none"
            :value="locale"
            @change="onLocaleChange"
          >
            <option v-for="opt in SUPPORTED_LOCALES" :key="opt.code" :value="opt.code">{{ opt.native }}</option>
          </select>
        </label>
        <span
          v-if="game.syncError"
          class="max-w-xs truncate text-xs text-amber-300"
          :title="game.syncError"
          >{{ game.syncError }}</span
        >
        <button
          class="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
          type="button"
          @click="game.pushSave()"
        >
          💾 {{ t("game.save") }}
        </button>
        <button
          class="rounded-lg bg-rose-600/80 px-3 py-1.5 text-xs font-medium hover:bg-rose-600"
          type="button"
          @click="logout"
        >
          {{ t("game.logout") }}
        </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <nav class="flex w-44 shrink-0 flex-col gap-1 border-r border-white/10 bg-black/25 p-3 backdrop-blur">
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          class="rounded-lg px-3 py-2 text-left text-sm transition"
          :class="tab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10'"
          @click="tab = item.id"
        >
          {{ item.label }}
        </button>
      </nav>

      <main class="flex-1 overflow-y-auto p-4">
        <section v-show="tab === 'buildings'" class="space-y-6">
          <div>
            <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {{ t("game.resourceWarehouseTitle") }}
            </h3>
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article
                v-for="rid in visibleResourceIds"
                :key="rid"
                class="rounded-xl border border-white/10 bg-black/30 p-3 shadow-md backdrop-blur"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="text-2xl" aria-hidden="true">{{ game.RESOURCE_MAP[rid].emoji }}</span>
                  <span class="text-xs text-slate-500">{{ trResource(rid) }}</span>
                </div>
                <div class="mt-2 font-mono text-lg text-slate-100">{{ fmt(resAmount(rid)) }}</div>
                <div class="text-xs text-slate-500">
                  {{ t("game.storageCapShort") }} {{ fmt(game.storageCaps(s)[rid].toString()) }}
                </div>
                <div
                  v-if="rid === 'knowledge' && libraryDef && s"
                  class="mt-1.5"
                >
                  <button
                    type="button"
                    class="w-full rounded-lg border border-amber-500/35 bg-amber-950/30 px-2 py-1.5 text-left text-xs font-medium text-amber-100/95 hover:bg-amber-900/40"
                    :title="t('game.raiseKnowledgeCapHint')"
                    @click="scrollToBuilding('library')"
                  >
                    📚 {{ t("game.raiseKnowledgeCap") }}
                  </button>
                </div>
                <div class="mt-1 text-xs text-emerald-300/90">
                  {{ t("game.passiveRateLabel") }} {{ passiveRateFor(rid) }}{{ t("game.perSecUnit") }}
                </div>
              </article>
            </div>
          </div>
          <div>
            <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {{ t("game.buildingsTitle") }}
            </h3>
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="b in game.BUILDINGS"
                :id="'building-' + b.id"
                :key="b.id"
                class="rounded-2xl border p-4 shadow-lg backdrop-blur"
                :class="
                  buildingEraUnlocked(s, b)
                    ? 'border-white/10 bg-black/30'
                    : 'border-amber-900/40 bg-black/20 opacity-80'
                "
              >
                <div class="mb-2 flex items-center justify-between gap-2">
                  <div class="text-3xl" aria-hidden="true">{{ b.emoji }}</div>
                  <div class="flex flex-col items-end gap-0.5 text-right">
                    <div class="text-sm text-slate-400">Lv. {{ s.buildings[b.id]?.level ?? 0 }}</div>
                    <div
                      v-if="!buildingEraUnlocked(s, b)"
                      class="max-w-[10rem] rounded-md bg-amber-950/50 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-amber-200/95"
                    >
                      {{ t("game.buildingUnlockAtEra", { era: trEraName(b.minEra) }) }}
                    </div>
                  </div>
                </div>
                <h3 class="text-lg font-semibold">{{ trBuildingName(b) }}</h3>
                <p class="mt-2 text-xs text-slate-400">
                  <span v-for="(rate, res) in b.production" :key="String(res)" class="mr-2">
                    {{ game.RESOURCE_MAP[res as keyof typeof game.RESOURCE_MAP].emoji }}
                    <template v-if="buildingEraUnlocked(s, b)">
                      {{ (rate * (s.buildings[b.id]?.level ?? 0)).toFixed(2) }}{{ t("common.perSecBase") }}
                    </template>
                    <template v-else> {{ rate.toFixed(3) }}{{ t("game.perLevelAtLv1Short") }} </template>
                  </span>
                </p>
                <div
                  v-if="buildingEraUnlocked(s, b)"
                  class="mt-3 rounded-lg border border-white/5 bg-black/35 px-2.5 py-2 text-xs"
                >
                  <div class="mb-1.5 font-medium text-slate-300">
                    {{
                      buildingLevel(s, b.id) === 0
                        ? t("game.nextBuildCost", { sec: nextUpgradeDurationSec(b) })
                        : t("game.nextUpgradeCost", { sec: nextUpgradeDurationSec(b) })
                    }}
                  </div>
                  <div
                    v-for="row in upgradeCostRows(b)"
                    :key="row.label"
                    class="flex items-center justify-between gap-2 border-t border-white/5 py-1 first:border-t-0 first:pt-0"
                    :class="row.met ? 'text-slate-300' : 'text-rose-300'"
                  >
                    <span>{{ row.emoji }} {{ row.label }}</span>
                    <span class="shrink-0 font-mono tabular-nums">
                      <span :class="row.met ? 'text-emerald-400/90' : ''">{{ fmt(row.have) }}</span>
                      <span class="text-slate-500"> / </span>
                      <span>{{ fmt(row.need) }}</span>
                    </span>
                  </div>
                </div>
                <div
                  v-else
                  class="mt-3 rounded-lg border border-amber-900/25 bg-amber-950/20 px-2.5 py-2 text-xs text-amber-100/85"
                >
                  {{ t("game.buildingLockedHint", { era: trEraName(b.minEra) }) }}
                </div>
                <div class="mt-3 flex gap-2">
                  <button
                    type="button"
                    :disabled="
                      !buildingEraUnlocked(s, b) || !game.canStartAction(s) || !canAffordUpgrade(b)
                    "
                    class="min-w-0 flex-1 rounded-xl bg-amber-600/90 py-2 text-sm font-medium hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
                    :title="
                      !buildingEraUnlocked(s, b)
                        ? t('game.buildingLockedTitle', { era: trEraName(b.minEra) })
                        : !canAffordUpgrade(b)
                          ? t('game.resInsufficient')
                          : !game.canStartAction(s)
                            ? t('game.queueFullTitle', { max: maxActionSlots(s) })
                            : buildingLevel(s, b.id) === 0
                              ? t('game.buildTimeTitle', { sec: nextUpgradeDurationSec(b) })
                              : t('game.upgradeTimeTitle', { sec: nextUpgradeDurationSec(b) })
                    "
                    @click="game.upgradeBuilding(b.id)"
                  >
                    <template v-if="buildingLevel(s, b.id) === 0">🔨 {{ t("game.build") }}</template>
                    <template v-else>⬆️ {{ t("game.upgrade") }}</template>
                  </button>
                  <button
                    type="button"
                    :disabled="!buildingEraUnlocked(s, b)"
                    class="shrink-0 rounded-xl px-3 py-2 text-base transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
                    :class="
                      game.isAutoUpgradeBuilding(b.id)
                        ? 'bg-emerald-900/40 ring-2 ring-emerald-400/50'
                        : 'bg-white/10'
                    "
                    :title="
                      !buildingEraUnlocked(s, b)
                        ? t('game.buildingLockedTitle', { era: trEraName(b.minEra) })
                        : game.isAutoUpgradeBuilding(b.id)
                          ? t('game.autoUpgradeTitleOff')
                          : t('game.autoUpgradeTitleOn')
                    "
                    @click="game.toggleAutoUpgradeBuilding(b.id)"
                  >
                    🔄
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section v-show="tab === 'tech'" class="max-w-2xl space-y-3">
          <article
            v-for="tech in game.TECHS"
            :key="tech.id"
            v-show="eraIndex(s.currentEra) >= eraIndex(tech.minEra)"
            class="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
          >
            <div class="flex items-start gap-3">
              <span class="text-2xl shrink-0">{{ tech.emoji }}</span>
              <div class="min-w-0 flex-1">
                <div class="font-medium">{{ trTechId(tech.id) }}</div>
                <div class="text-xs text-slate-400">
                  {{ t("game.researchTime", { sec: researchDurationSec(tech) }) }}
                </div>
                <template v-if="s.techStatus[tech.id] === 'available'">
                  <div class="mt-2 rounded-lg border border-white/5 bg-black/35 px-2.5 py-2 text-xs">
                    <div class="mb-1 font-medium text-slate-300">{{ t("game.researchCost") }}</div>
                    <div
                      v-for="row in researchCostRows(tech)"
                      :key="row.label"
                      class="flex items-center justify-between gap-2 border-t border-white/5 py-1 first:border-t-0 first:pt-0"
                      :class="row.met ? 'text-slate-300' : 'text-rose-300'"
                    >
                      <span>{{ row.emoji }} {{ row.label }}</span>
                      <span class="shrink-0 font-mono tabular-nums">
                        <span :class="row.met ? 'text-emerald-400/90' : ''">{{ fmt(row.have) }}</span>
                        <span class="text-slate-500"> / </span>
                        <span>{{ fmt(row.need) }}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    :disabled="!game.canStartAction(s) || !canAffordResearch(tech)"
                    class="mt-1 w-full rounded-lg bg-violet-600 py-2 text-sm font-medium hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-4"
                    :title="
                      !canAffordResearch(tech)
                        ? t('game.resInsufficient')
                        : !game.canStartAction(s)
                          ? t('game.queueFullTitle', { max: maxActionSlots(s) })
                          : t('game.researchTimeTitle', { sec: researchDurationSec(tech) })
                    "
                    @click="game.research(tech.id)"
                  >
                    {{ t("game.research") }}
                  </button>
                </template>
                <div v-else-if="s.techStatus[tech.id] === 'researching'" class="mt-2 text-xs text-amber-300">
                  {{ t("game.researching") }}
                </div>
                <div v-else-if="s.techStatus[tech.id] === 'completed'" class="mt-2 text-xs text-emerald-400">
                  {{ t("game.completed") }}
                </div>
                <div v-else class="mt-2 text-xs text-slate-500">{{ t("game.locked") }}</div>
              </div>
            </div>
          </article>
        </section>

        <section v-show="tab === 'quests'" class="max-w-2xl space-y-2">
          <article
            v-for="q in game.QUESTS"
            :key="q.id"
            v-show="eraIndex(s.currentEra) >= eraIndex(q.minEra)"
            class="rounded-xl border border-white/10 bg-black/25 px-4 py-3"
            :class="s.completedQuests.includes(q.id) ? 'opacity-60' : 'ring-1 ring-amber-500/30'"
          >
            <div class="flex gap-2">
              <span class="text-xl">{{ q.emoji }}</span>
              <div>
                <div class="font-medium">{{ trQuestTitle(q.id) }}</div>
                <div class="text-xs text-slate-400">{{ trQuestDescription(q) }}</div>
                <div v-if="s.completedQuests.includes(q.id)" class="mt-1 text-xs text-emerald-400">
                  {{ t("game.completed") }}
                </div>
              </div>
            </div>
          </article>
        </section>

        <section v-show="tab === 'era'" class="max-w-xl space-y-4">
          <div class="rounded-2xl border border-white/10 bg-black/30 p-5">
            <h3 class="mb-2 text-lg font-semibold">{{ t("game.evolveNextEra") }}</h3>
            <p v-if="!nextEraId" class="text-slate-400">{{ t("game.evolveModern") }}</p>
            <template v-else-if="nextEraDef && nextEraId">
              <p class="text-2xl">
                {{ nextEraDef.emoji }}
                {{ trEraName(nextEraId) }}
              </p>
              <div v-if="evolveCostRows().length" class="mt-3 rounded-lg border border-white/5 bg-black/35 px-2.5 py-2 text-xs">
                <div class="mb-1 font-medium text-slate-300">
                  {{ t("game.evolveCostTitle") }} · {{ t("game.evolveDuration", { sec: evolveRitualDurationSec() }) }}
                </div>
                <div
                  v-for="row in evolveCostRows()"
                  :key="row.label"
                  class="flex items-center justify-between gap-2 border-t border-white/5 py-1 first:border-t-0 first:pt-0"
                  :class="row.met ? 'text-slate-300' : 'text-rose-300'"
                >
                  <span>{{ row.emoji }} {{ row.label }}</span>
                  <span class="shrink-0 font-mono tabular-nums">
                    <span :class="row.met ? 'text-emerald-400/90' : ''">{{ fmt(row.have) }}</span>
                    <span class="text-slate-500"> / </span>
                    <span>{{ fmt(row.need) }}</span>
                  </span>
                </div>
              </div>
              <div v-else-if="evolveRitualDurationSec() > 0" class="mt-3 text-xs text-slate-400">
                {{ t("game.evolveDuration", { sec: evolveRitualDurationSec() }) }}
              </div>
              <ul class="mt-3 list-inside list-disc text-sm text-slate-300">
                <li
                  v-for="(lv, bid) in nextEraDef.evolveRequirements.minBuildingLevel ?? {}"
                  :key="String(bid)"
                >
                  {{ t("game.evolveReqBuilding", { name: trBuildingId(String(bid)), level: lv }) }}
                </li>
                <li
                  v-for="tid in nextEraDef.evolveRequirements.completedTechs ?? []"
                  :key="tid"
                >
                  {{ t("game.evolveReqTech", { name: trTechId(tid) }) }}
                </li>
                <li
                  v-for="qid in nextEraDef.evolveRequirements.completedQuests ?? []"
                  :key="qid"
                >
                  {{ t("game.evolveReqQuest", { title: trQuestTitle(qid) }) }}
                </li>
              </ul>
              <div v-if="s.evolutionRitual" class="mt-4">
                <div class="text-sm text-amber-200">{{ t("game.evolveRitualRunning") }}</div>
                <div class="mt-1 h-2 overflow-hidden rounded-full bg-black/40">
                  <div class="h-full bg-amber-400 transition-all" :style="{ width: ritualProgress() + '%' }" />
                </div>
              </div>
              <button
                v-else
                type="button"
                class="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 font-medium hover:bg-emerald-500"
                @click="game.evolve()"
              >
                🌅 {{ t("game.evolveStart") }}
              </button>
              <p v-if="!evolveCheck.ok && evolveCheck.reason" class="mt-2 text-xs text-rose-300">
                {{ t("game.evolveReasonPrefix") }}{{ t("errors." + evolveCheck.reason) }}
              </p>
            </template>
          </div>
        </section>

        <section v-show="tab === 'civ6'" class="max-w-5xl space-y-3">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-400">{{ t("game.tabCiv6") }}</h3>
          <Civ6CodexPanel />
        </section>
      </main>

      <aside class="hidden w-56 shrink-0 border-l border-white/10 bg-black/30 p-3 backdrop-blur lg:block">
        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t("game.actionsTitle") }}</h4>
        <div v-if="!s.activeActions.length && !s.evolutionRitual" class="text-sm text-slate-500">{{ t("game.idle") }}</div>
        <div v-for="a in s.activeActions" :key="a.id" class="mb-3 rounded-lg bg-black/40 p-2 text-xs">
          <div class="font-medium">
            {{
              a.kind === "research"
                ? t("game.actionResearch")
                : a.kind === "building_upgrade" && a.fromLevel <= 0
                  ? t("game.actionBuild")
                  : t("game.actionUpgrade")
            }}
            {{
              a.kind === "research"
                ? game.TECHS.find((tech) => tech.id === a.techId)?.emoji
                : game.BUILDINGS.find((b) => b.id === a.buildingId)?.emoji
            }}
          </div>
          <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-black/50">
            <div class="h-full bg-sky-400 transition-all" :style="{ width: actionProgress(a) + '%' }" />
          </div>
        </div>
        <div v-if="s.evolutionRitual" class="rounded-lg bg-amber-900/40 p-2 text-xs">
          <div class="font-medium text-amber-100">{{ t("game.ritualTitle") }}</div>
          <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-black/50">
            <div class="h-full bg-amber-300" :style="{ width: ritualProgress() + '%' }" />
          </div>
        </div>
      </aside>
    </div>

    <div
      v-if="unlockOpen"
      class="fixed inset-0 z-[51] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div class="max-w-md rounded-2xl border border-emerald-500/30 bg-slate-900 p-6 shadow-2xl">
        <h3 class="mb-3 text-lg font-semibold text-emerald-200">{{ t("game.unlockTitle") }}</h3>
        <ul class="list-inside list-disc space-y-1 text-sm text-slate-200">
          <li v-for="(line, i) in unlockLines" :key="i">{{ line }}</li>
        </ul>
        <button
          type="button"
          class="mt-5 w-full rounded-lg bg-emerald-600 py-2 font-medium text-white hover:bg-emerald-500"
          @click="unlockOpen = false"
        >
          {{ t("game.unlockDismiss") }}
        </button>
      </div>
    </div>

    <div
      v-if="game.offlineMessage"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div class="max-w-md rounded-2xl border border-white/20 bg-slate-900 p-6 shadow-2xl">
        <h3 class="mb-2 text-lg font-semibold text-white">{{ t("game.welcomeBack") }}</h3>
        <pre class="whitespace-pre-wrap text-sm text-slate-300">{{ game.offlineMessage }}</pre>
        <button
          type="button"
          class="mt-4 w-full rounded-lg bg-indigo-600 py-2 font-medium text-white"
          @click="game.dismissOffline()"
        >
          {{ t("common.continue") }}
        </button>
      </div>
    </div>

    <EurekaToastHost />
  </div>
</template>
