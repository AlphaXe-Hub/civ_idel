<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();
const username = ref("");
const password = ref("");
const mode = ref<"login" | "register">("login");
const busy = ref(false);

const title = computed(() => (mode.value === "login" ? "登录" : "注册"));

const localError = ref<string | null>(null);

async function submit() {
  busy.value = true;
  localError.value = null;
  try {
    if (mode.value === "login") await auth.login(username.value, password.value);
    else await auth.register(username.value, password.value);
    await router.push("/game");
  } catch (e) {
    localError.value = e instanceof Error ? e.message : "失败";
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
      <div class="mb-6 text-center text-3xl">🏛️</div>
      <h1 class="mb-1 text-center text-2xl font-semibold tracking-tight text-white">文明放置</h1>
      <p class="mb-8 text-center text-sm text-slate-400">Civ Idle · Melvor 式节奏</p>

      <div class="mb-6 flex rounded-lg bg-black/30 p-1">
        <button
          type="button"
          class="flex-1 rounded-md py-2 text-sm font-medium transition"
          :class="mode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400'"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button
          type="button"
          class="flex-1 rounded-md py-2 text-sm font-medium transition"
          :class="mode === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400'"
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">用户名</label>
          <input
            v-model="username"
            autocomplete="username"
            class="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none ring-indigo-500/50 focus:ring-2"
            required
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">密码</label>
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
          {{ busy ? "请稍候…" : title }}
        </button>
      </form>
    </div>
  </div>
</template>
