import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "./stores/auth";
import GameView from "./views/GameView.vue";
import LoginView from "./views/LoginView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/game" },
    { path: "/login", component: LoginView, meta: { guest: true } },
    { path: "/game", component: GameView, meta: { requiresAuth: true } },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.initialized) await auth.fetchSession();
  if (to.meta.requiresAuth && !auth.user) return { path: "/login" };
  if (to.meta.guest && auth.user) return { path: "/game" };
});
