# Civ Idle

A Melvor Idle–style incremental civilization game: Vue 3 frontend, Fastify API, sql.js (SQLite file) saves, Docker-ready.

**Languages:** Use the selector on the login screen or in the game header to choose **简体中文**, **English**, or **日本語**. The choice is stored under the `localStorage` key `civ-idle-locale`.

## Debug: game speed (`timeScale`)

Keep [`config/game-speed.json`](config/game-speed.json) in sync with [`apps/web/public/game-speed.json`](apps/web/public/game-speed.json). Local Vite serves the `public` copy; the Docker image also copies `config/game-speed.json` to the site root, and Compose **mounts** that file into the `web` container—edit the file on the host and **refresh the browser** (no frontend rebuild required).

```json
{ "timeScale": 10 }
```

- `1`: normal speed.
- `>1`: passive production scales up; research, building upgrades, and evolution ritual durations scale by `1/timeScale` (handy for debugging).
- Allowed range `0.01`–`100` (values are clamped).

When `timeScale !== 1`, the header shows **⏱×N**.

## Local development

```bash
npm install
npm run build -w @civ-idle/game-core
```

Terminal 1 (API, default port 3001; builds `game-core` first):

```bash
npm run dev:api
```

Terminal 2 (Web; Vite proxies `/api` to the API):

```bash
npm run dev -w @civ-idle/web
```

Open the URL Vite prints (usually `http://127.0.0.1:5173`). Register an account, then play.

If port **3001** is already taken (e.g. by Uptime Kuma), point Vite at another API port:

```bash
VITE_API_PROXY_TARGET=http://127.0.0.1:3088 npm run dev -w @civ-idle/web
```

(Start the API with `PORT=3088 npm run dev -w @civ-idle/api`.)

## Unit tests

```bash
npm run test -w @civ-idle/game-core
```

## Docker

```bash
docker compose build
docker compose up
```

If you lack permission to access the Docker socket, use `sudo docker compose build` / `sudo docker compose up`.

- Web + reverse proxy: `http://localhost:8080` (static files + `/api/*` to the backend)
- SQLite volume: `civ_sqlite` mounted at `/data/game.db` in the container
- Debug speed: edit `config/game-speed.json` at the repo root and refresh (volume-mounted into `web`)

## Project layout

- `packages/game-core`: resources, buildings, tech, quests, eras; tick and offline settlement
- `apps/web`: Vue + Pinia + Tailwind + vue-i18n UI
- `apps/api`: auth, session cookies, `GET/PUT /save`; new saves in `newGameDefaults.ts` (aligned with `createInitialState` in `game-core`)

## Other README languages

- [简体中文](README.zh-CN.md)
- [日本語](README.ja.md)
