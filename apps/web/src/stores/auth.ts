import { defineStore } from "pinia";
import { ref } from "vue";
import { apiFetch } from "../api/client";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<{ id: number; username: string } | null>(null);
  const initialized = ref(false);
  const error = ref<string | null>(null);

  async function fetchSession() {
    error.value = null;
    try {
      const data = (await apiFetch("/auth/me")) as { user: { id: number; username: string } };
      user.value = data.user;
    } catch {
      user.value = null;
    } finally {
      initialized.value = true;
    }
  }

  async function login(username: string, password: string) {
    error.value = null;
    const data = (await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })) as { user: { id: number; username: string } };
    user.value = data.user;
  }

  async function register(username: string, password: string) {
    error.value = null;
    const data = (await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })) as { user: { id: number; username: string } };
    user.value = data.user;
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      /* 仍清除本地态，避免卡在游戏页 */
    }
    user.value = null;
  }

  return { user, initialized, error, fetchSession, login, register, logout };
});
