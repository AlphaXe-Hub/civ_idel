/**
 * 始终走同源 `/api/*`：开发时由 Vite `server.proxy` / `preview.proxy` 转发；
 * Docker 生产环境由 Nginx 将 `/api/` 反代到后端（见 apps/web/nginx.conf）。
 * 若生产用 `vite preview` 本地预览，也需启动 API 并配置 preview 代理，否则会 404。
 */
const base = "/api";

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const errObj = data as { error?: string };
    const err =
      errObj?.error ??
      (typeof data === "object" && data !== null && "raw" in data
        ? String((data as { raw: string }).raw).slice(0, 80)
        : res.statusText);
    throw new Error(err || `HTTP ${res.status}`);
  }
  return data;
}
