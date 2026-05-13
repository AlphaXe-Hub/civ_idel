# Civ Idle

Melvor Idle–style incremental civilization: **Vue 3** + **Pinia** + **Tailwind** + **vue-i18n**, **Fastify** API, **sql.js** saves, **Docker** compose.

**Documentation languages**

- **[English](README.en.md)** — full setup, Docker, `timeScale`, dev commands  
- **[简体中文](README.zh-CN.md)** — 中文完整说明  
- **[日本語](README.ja.md)** — 日本語ドキュメント  

**In-game / login UI languages:** 简体中文, English, 日本語 (stored as `civ-idle-locale` in `localStorage`).

## Quick start

```bash
npm install
npm run build -w @civ-idle/game-core
npm run dev:api    # terminal 1
npm run dev -w @civ-idle/web   # terminal 2
```

Then open the Vite URL (e.g. `http://127.0.0.1:5173`), register, and play.

```bash
docker compose up --build   # production-like stack on :8080
```

For details, use the language links above.
