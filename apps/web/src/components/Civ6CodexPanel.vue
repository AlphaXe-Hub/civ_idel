<script setup lang="ts">
import {
  EUREKA_DEFS,
  GREAT_PERSON_DEFS,
  RELIC_DEFS,
  eraIndex,
  qualityMultiplier,
  type RelicQuality,
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
        class="rounded-xl border border-white/10 bg-black/30 p-3 text-center text-sm backdrop-blur"
      >
        <div class="text-3xl">{{ unlockedEureka(d.id) && eraOk(d.minEra) ? d.emoji : "❓" }}</div>
        <div class="mt-1 font-medium text-slate-200">
          {{ unlockedEureka(d.id) ? trTitle(d.i18nKey, d.title) : "？" }}
        </div>
      </article>
    </div>

    <div v-show="sub === 'great'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="d in GREAT_PERSON_DEFS"
        :key="d.id"
        class="rounded-xl border border-white/10 bg-black/30 p-3 backdrop-blur"
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
          class="rounded-xl border border-white/10 bg-black/30 p-3 text-center text-sm backdrop-blur"
        >
          <div class="text-3xl">{{ unlockedRelic(d.id) && eraOk(d.minEra) ? d.emoji : "❓" }}</div>
          <div class="mt-1 font-medium text-slate-200">
            {{ unlockedRelic(d.id) ? trTitle(d.i18nKey, d.title) : "？" }}
          </div>
          <div v-if="unlockedRelic(d.id)" class="mt-1 text-[10px] text-slate-500">
            {{ t("game.civ6RelicOwnedCount", { n: relicCountForDef(d.id) }) }}
          </div>
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
