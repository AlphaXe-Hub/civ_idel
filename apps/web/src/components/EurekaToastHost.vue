<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useGameStore } from "../stores/game";

const { t, te } = useI18n();
const game = useGameStore();

const current = computed(() => game.civ6Toasts[0] ?? null);

function titleOf() {
  const c = current.value;
  if (!c) return "";
  if (!c.i18nKey?.trim() || !te(c.i18nKey)) return c.title;
  const s = String(t(c.i18nKey)).trim();
  if (!s || s === c.i18nKey) return c.title;
  return s;
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="current"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div
        class="max-w-sm rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-950/95 to-slate-900 p-6 text-center shadow-2xl"
      >
        <div class="text-6xl leading-none">{{ current.emoji }}</div>
        <h3 class="mt-4 text-lg font-bold text-amber-100">{{ t("game.civ6EurekaTitle") }}</h3>
        <p class="mt-2 text-sm text-amber-50/90">{{ titleOf() }}</p>
        <button
          type="button"
          class="mt-6 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-400"
          @click="game.dismissCiv6Toast()"
        >
          {{ t("game.civ6EurekaOk") }}
        </button>
      </div>
    </div>
  </Teleport>
</template>
