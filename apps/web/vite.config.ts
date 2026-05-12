import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL(".", import.meta.url)), "");
  /** 本机若 3001 被占用（如 Uptime Kuma），可设 `VITE_API_PROXY_TARGET=http://127.0.0.1:3088` */
  const apiProxyTarget =
    process.env.VITE_API_PROXY_TARGET || env.VITE_API_PROXY_TARGET || "http://127.0.0.1:3001";
  const apiProxy = {
    "/api": {
      target: apiProxyTarget,
      changeOrigin: true,
      rewrite: (p: string) => p.replace(/^\/api/, ""),
    },
  };

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@civ-idle/game-core": fileURLToPath(
          new URL("../../packages/game-core/src/index.ts", import.meta.url),
        ),
      },
    },
    server: {
      port: 5173,
      proxy: apiProxy,
    },
    preview: {
      proxy: apiProxy,
    },
  };
});
