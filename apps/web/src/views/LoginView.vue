<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { SUPPORTED_LOCALES, setAppLocale, type AppLocale } from "../i18n";
import { useAuthStore } from "../stores/auth";

const { t, locale } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const username = ref("");
const password = ref("");
const mode = ref<"login" | "register">("login");
const busy = ref(false);

const title = computed(() => (mode.value === "login" ? t("login.login") : t("login.register")));

const localError = ref<string | null>(null);

function onLocaleChange(ev: Event) {
  setAppLocale((ev.target as HTMLSelectElement).value as AppLocale);
}

async function submit() {
  busy.value = true;
  localError.value = null;
  try {
    if (mode.value === "login") await auth.login(username.value, password.value);
    else await auth.register(username.value, password.value);
    await router.push("/game");
  } catch (e) {
    localError.value = e instanceof Error ? e.message : t("login.fail");
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md"
    >
      <div class="mb-4 flex justify-end">
        <label class="flex items-center gap-2 text-xs text-slate-400">
          <span>{{ t("game.langLabel") }}</span>
          <select
            class="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-slate-200 outline-none"
            :value="locale"
            @change="onLocaleChange"
          >
            <option v-for="opt in SUPPORTED_LOCALES" :key="opt.code" :value="opt.code">{{ opt.native }}</option>
          </select>
        </label>
      </div>
      <div class="mb-6 text-center text-3xl">🏛️</div>
      <h1 class="mb-1 text-center text-2xl font-semibold tracking-tight text-white">{{ t("login.title") }}</h1>
      <p class="mb-8 text-center text-sm text-slate-400">{{ t("login.subtitle") }}</p>

      <div class="mb-6 flex rounded-lg bg-black/30 p-1">
        <button
          type="button"
          class="flex-1 rounded-md py-2 text-sm font-medium transition"
          :class="mode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400'"
          @click="mode = 'login'"
        >
          {{ t("login.login") }}
        </button>
        <button
          type="button"
          class="flex-1 rounded-md py-2 text-sm font-medium transition"
          :class="mode === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400'"
          @click="mode = 'register'"
        >
          {{ t("login.register") }}
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">{{
            t("login.username")
          }}</label>
          <input
            v-model="username"
            autocomplete="username"
            class="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none ring-indigo-500/50 focus:ring-2"
            required
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">{{
            t("login.password")
          }}</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none ring-indigo-500/50 focus:ring-2"
            required
          />
        </div>
        <p v-if="localError" class="text-sm text-rose-400">{{ localError }}</p>
        <button
          type="submit"
          :disabled="busy"
          class="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white shadow-lg transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {{ busy ? t("login.submitBusy") : title }}
        </button>
      </form>
    </div>
  </div>
</template>
