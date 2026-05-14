<script setup lang="ts">
import {
  EUREKA_DEFS,
  GREAT_PERSON_DEFS,
  RELIC_DEFS,
  RESOURCE_MAP,
  eraIndex,
  qualityMultiplier,
  type EurekaDef,
  type GreatPersonDef,
  type RelicDef,
  type RelicQuality,
  type ResourceId,
} from "@civ-idle/game-core";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useGameStore } from "../stores/game";

const { t, te } = useI18n();
const game = useGameStore();

const sub = ref<"eureka" | "great" | "relic">("eureka");

const s = computed(() => game.state);

function unlockedEureka(id: string) {
  return s.value?.civ6?.codexUnlocked.eureka.includes(id) ?? false;
}
function unlockedRelic(id: string) {
  return s.value?.civ6?.codexUnlocked.relic.includes(id) ?? false;
}

function trTitle(i18nKey: string, fallback: string) {
  if (!i18nKey?.trim() || !te(i18nKey)) return fallback;
  const s = String(t(i18nKey)).trim();
  if (!s || s === i18nKey) return fallback;
  return s;
}

function relicQualityLabel(q: RelicQuality) {
  const key = `civ6.quality.${q}`;
  return te(key) ? String(t(key)) : q;
}

function greatLevel(id: string) {
  return s.value?.civ6?.greatPeople[id]?.level ?? 0;
}

function relicCountForDef(id: string) {
  return s.value?.civ6?.relics.filter((r) => r.defId === id).length ?? 0;
}

function eraOk(minEra: (typeof EUREKA_DEFS)[number]["minEra"]) {
  const st = s.value;
  if (!st) return false;
  return eraIndex(st.currentEra) >= eraIndex(minEra);
}

function resName(rid: ResourceId) {
  const key = `content.resources.${rid}.name`;
  return te(key) ? String(t(key)) : rid;
}

function eraName(era: string) {
  const key = `content.eras.${era}.name`;
  return te(key) ? String(t(key)) : era;
}

function eurekaEffectLines(d: EurekaDef): string[] {
  const e = d.effect;
  const once = d.once ? `（${t("game.civ6CodexOnceTag")}）` : "";
  const lines: string[] = [];
  if (e.kind === "temp_prod_mult") {
    const rid = e.resource;
    const em = RESOURCE_MAP[rid]?.emoji ?? "";
    lines.push(
      t("game.civ6CodexBuffTempRes", {
        emoji: em,
        name: resName(rid),
        mult: e.mult.toFixed(2),
        sec: Math.round(e.durationMs / 1000),
      }),
    );
  } else if (e.kind === "temp_all_prod_mult") {
    lines.push(
      t("game.civ6CodexBuffTempAll", {
        mult: e.mult.toFixed(2),
        sec: Math.round(e.durationMs / 1000),
      }),
    );
  } else if (e.kind === "instant_resource") {
    const parts = (Object.keys(e.resources) as ResourceId[])
      .filter((k) => e.resources[k])
      .map((k) => `${RESOURCE_MAP[k]?.emoji ?? ""}${resName(k)} ${e.resources[k]}`);
    lines.push(t("game.civ6CodexInstantRes"));
    if (parts.length) lines.push(parts.join(" · "));
  } else if (e.kind === "roll_relic") {
    lines.push(t("game.civ6CodexRollRelic", { bias: e.qualityBias.toFixed(2) }));
  } else if (e.kind === "static_prod_add") {
    lines.push(t("game.civ6CodexStaticProd"));
    const parts = (Object.keys(e.add) as ResourceId[])
      .filter((k) => e.add[k])
      .map((k) => `${RESOURCE_MAP[k]?.emoji ?? ""}${resName(k)} +${e.add[k]}`);
    if (parts.length) lines.push(parts.join(" · "));
  } else if (e.kind === "static_storage_add") {
    lines.push(t("game.civ6CodexStaticStorage"));
    const parts = (Object.keys(e.add) as ResourceId[])
      .filter((k) => e.add[k])
      .map((k) => `${RESOURCE_MAP[k]?.emoji ?? ""}${resName(k)} +${e.add[k]}`);
    if (parts.length) lines.push(parts.join(" · "));
  } else if (e.kind === "evolution_ritual_advance") {
    lines.push(t("game.civ6CodexEvolSkip", { pct: Math.round(e.frac * 100) }));
  } else if (e.kind === "research_progress_advance") {
    lines.push(t("game.civ6CodexResearchSkip", { pct: Math.round(e.frac * 100) }));
  } else if (e.kind === "eureka_base_rate_add") {
    lines.push(t("game.civ6CodexEurekaRate", { v: e.add.toFixed(3) }));
  } else if (e.kind === "bonus_all_resources_mult") {
    lines.push(t("game.civ6CodexBonusAll", { mult: e.mult.toFixed(3) }));
  }
  if (once && lines.length) lines[0] = `${lines[0]}${once}`;
  return lines;
}

function greatEffectLines(d: GreatPersonDef): string[] {
  const lv = greatLevel(d.id);
  if (lv <= 0) return [];
  const lines: string[] = [];
  lines.push(
    t("game.civ6GpTiers", {
      a: d.displayTiers[0]!.toFixed(2),
      b: d.displayTiers[1]!.toFixed(2),
      c: d.displayTiers[2]!.toFixed(2),
    }),
  );
  for (const rid of Object.keys(d.perLevelProdAdd) as ResourceId[]) {
    const v = d.perLevelProdAdd[rid];
    if (v == null || v <= 0) continue;
    lines.push(
      t("game.civ6GpPerLevelFrac", {
        label: `${RESOURCE_MAP[rid]?.emoji ?? ""}${resName(rid)}`,
        pct: (v * 100).toFixed(3),
      }),
    );
  }
  lines.push(
    t("game.civ6GpStorageLv", {
      n: d.perLevelStorageAdd,
      total: d.perLevelStorageAdd * lv,
    }),
  );
  lines.push(
    t("game.civ6GpEurekaTick", {
      coef: d.eurekaChanceAdd.toExponential(2),
    }),
  );
  lines.push(
    t("game.civ6GpLinkLine", {
      era: eraName(d.eurekaLink.era),
      pc: (1 + d.eurekaLink.chanceUp).toFixed(2),
      pr: (1 + d.eurekaLink.rewardBonus).toFixed(2),
    }),
  );
  return lines;
}

function relicDefLines(d: RelicDef): string[] {
  const lines: string[] = [];
  lines.push(t("game.civ6RelicProdBase"));
  const parts = (Object.keys(d.baseProdAdd) as ResourceId[])
    .filter((k) => d.baseProdAdd[k])
    .map((k) => {
      const v = d.baseProdAdd[k] ?? 0;
      return `${RESOURCE_MAP[k]?.emoji ?? ""}${resName(k)} +${(v * 100).toFixed(2)}%/件`;
    });
  if (parts.length) lines.push(parts.join(" · "));
  lines.push(t("game.civ6RelicStorageBase", { n: d.baseStorageAdd }));
  lines.push(t("game.civ6RelicGreatCost", { f: d.greatCostFactor.toFixed(4) }));
  lines.push(t("game.civ6RelicQualityMult"));
  return lines;
}
</script>

<template>
  <div v-if="s" class="space-y-4">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="x in [
          { id: 'eureka' as const, lab: 'game.tabCiv6Eureka' },
          { id: 'great' as const, lab: 'game.tabCiv6Great' },
          { id: 'relic' as const, lab: 'game.tabCiv6Relic' },
        ]"
        :key="x.id"
        type="button"
        class="rounded-lg px-3 py-1.5 text-sm font-medium transition"
        :class="sub === x.id ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/15'"
        @click="sub = x.id"
      >
        {{ t(x.lab) }}
      </button>
    </div>

    <div v-show="sub === 'eureka'" class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <article
        v-for="d in EUREKA_DEFS"
        :key="d.id"
        class="rounded-xl border border-white/10 bg-black/30 p-3 text-left text-sm backdrop-blur"
      >
        <div class="text-center text-3xl">{{ unlockedEureka(d.id) && eraOk(d.minEra) ? d.emoji : "❓" }}</div>
        <div class="mt-1 text-center font-medium text-slate-200">
          {{ unlockedEureka(d.id) ? trTitle(d.i18nKey, d.title) : "？" }}
        </div>
        <template v-if="unlockedEureka(d.id)">
          <div class="mt-2 border-t border-white/10 pt-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {{ t("game.civ6CodexEffectTitle") }}
          </div>
          <ul class="mt-1 space-y-0.5 text-[11px] leading-snug text-slate-400">
            <li v-for="(line, i) in eurekaEffectLines(d)" :key="i">{{ line }}</li>
          </ul>
        </template>
      </article>
    </div>

    <div v-show="sub === 'great'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="d in GREAT_PERSON_DEFS"
        :key="d.id"
        class="rounded-xl border border-white/10 bg-black/30 p-3 text-left backdrop-blur"
      >
        <div class="flex items-start justify-between gap-2">
          <span class="text-3xl">{{ eraOk(d.minEra) && greatLevel(d.id) > 0 ? d.emoji : "❓" }}</span>
          <span class="text-xs text-slate-500">Lv.{{ greatLevel(d.id) }}</span>
        </div>
        <div class="mt-1 font-medium text-slate-200">
          {{ greatLevel(d.id) > 0 ? trTitle(d.i18nKey, d.title) : "？" }}
        </div>
        <p v-if="greatLevel(d.id) > 0 && d.roleTag" class="mt-0.5 text-[11px] leading-snug text-slate-500">
          {{ d.roleType }} · {{ d.roleTag }}
        </p>
        <template v-if="greatLevel(d.id) > 0">
          <div class="mt-2 border-t border-white/10 pt-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {{ t("game.civ6CodexEffectTitle") }}
          </div>
          <ul class="mt-1 space-y-0.5 text-[11px] leading-snug text-slate-400">
            <li v-for="(line, i) in greatEffectLines(d)" :key="i">{{ line }}</li>
          </ul>
        </template>
        <button
          v-if="eraOk(d.minEra) && greatLevel(d.id) < d.maxLevel"
          type="button"
          class="mt-2 w-full rounded-lg bg-violet-600/90 py-1.5 text-xs font-medium hover:bg-violet-500"
          @click="game.upgradeGreatPerson(d.id)"
        >
          ⬆️ {{ t("game.civ6GreatUpgrade") }}
        </button>
      </article>
    </div>

    <div v-show="sub === 'relic'" class="space-y-3">
      <p class="text-xs text-slate-500">{{ t("game.civ6RelicOwnedHint") }}</p>
      <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="d in RELIC_DEFS"
          :key="d.id"
          class="rounded-xl border border-white/10 bg-black/30 p-3 text-left text-sm backdrop-blur"
        >
          <div class="text-center text-3xl">{{ unlockedRelic(d.id) && eraOk(d.minEra) ? d.emoji : "❓" }}</div>
          <div class="mt-1 text-center font-medium text-slate-200">
            {{ unlockedRelic(d.id) ? trTitle(d.i18nKey, d.title) : "？" }}
          </div>
          <div v-if="unlockedRelic(d.id)" class="mt-1 text-center text-[10px] text-slate-500">
            {{ t("game.civ6RelicOwnedCount", { n: relicCountForDef(d.id) }) }}
          </div>
          <template v-if="unlockedRelic(d.id)">
            <div class="mt-2 border-t border-white/10 pt-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              {{ t("game.civ6CodexEffectTitle") }}
            </div>
            <ul class="mt-1 space-y-0.5 text-[11px] leading-snug text-slate-400">
              <li v-for="(line, i) in relicDefLines(d)" :key="i">{{ line }}</li>
            </ul>
          </template>
        </article>
      </div>
      <div v-if="s.civ6?.relics.length" class="rounded-xl border border-white/10 bg-black/25 p-3 text-xs">
        <div class="mb-2 font-medium text-slate-400">{{ t("game.civ6RelicInventory") }}</div>
        <ul class="max-h-40 space-y-1 overflow-y-auto text-slate-300">
          <li v-for="(r, i) in s.civ6.relics" :key="i">
            {{ RELIC_DEFS.find((x) => x.id === r.defId)?.emoji ?? "🏺" }}
            {{ trTitle(RELIC_DEFS.find((x) => x.id === r.defId)?.i18nKey ?? "", RELIC_DEFS.find((x) => x.id === r.defId)?.title ?? r.defId) }}
            · {{ relicQualityLabel(r.quality) }} ×{{ qualityMultiplier(r.quality).toFixed(2) }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
