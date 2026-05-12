# 文明放置（Civ Idle）

Melvor Idle 风格的放置文明进化游戏：Vue 3 前端 + Fastify API + sql.js（SQLite 文件）存档，Docker 一键部署。

## 调试：游戏速度（`timeScale`）

根目录 [`config/game-speed.json`](config/game-speed.json) 与 [`apps/web/public/game-speed.json`](apps/web/public/game-speed.json) 内容保持一致即可；**本地 Vite** 读取 `public` 下文件，**Docker** 镜像内会再复制 `config/game-speed.json` 覆盖到站点根目录，且 Compose 已把该文件 **挂载** 到容器，改宿主文件后 **刷新浏览器** 即可（无需重建前端镜像）。

```json
{ "timeScale": 10 }
```

- `1`：正常速度。
- `>1`：被动产出按倍率加快；研究、建筑升级、进化仪式耗时按 `1/timeScale` 缩短（便于调试）。
- 合法范围 `0.01`～`100`（超出会被夹紧）。

顶栏在 `timeScale !== 1` 时会显示 **⏱×N** 提示。

## 本地开发

```bash
npm install
npm run build -w @civ-idle/game-core
```

终端 1（API，默认端口 3001，会先构建 `game-core`）：

```bash
npm run dev:api
```

终端 2（Web，Vite 会把 `/api` 代理到 API）：

```bash
npm run dev -w @civ-idle/web
```

浏览器打开 Vite 提示的地址（一般为 `http://127.0.0.1:5173`）。先注册账号再进入游戏。

若本机 **3001 已被其他服务占用**（例如 Uptime Kuma），可让 Vite 把 `/api` 转到其他端口上的本游戏 API，例如：

```bash
VITE_API_PROXY_TARGET=http://127.0.0.1:3088 npm run dev -w @civ-idle/web
```

（同时用 `PORT=3088 npm run dev -w @civ-idle/api` 启动 API。）

## 单元测试

```bash
npm run test -w @civ-idle/game-core
```

## Docker

```bash
docker compose build
docker compose up
```

若无权限访问 Docker 套接字，可使用：`sudo docker compose build` / `sudo docker compose up`。

- 前端与反向代理：`http://localhost:8080`（静态资源 + `/api/*` 转发到后端）
- SQLite 数据卷：`civ_sqlite` 挂载到容器内 `/data/game.db`
- 调试倍速：编辑仓库根目录 `config/game-speed.json` 后刷新页面（已 `volume` 挂载到 `web` 容器）

## 项目结构

- `packages/game-core`：资源 / 建筑 / 科技 / 任务 / 时代配置，tick 与离线结算
- `apps/web`：Vue + Pinia + Tailwind UI
- `apps/api`：注册登录、会话 Cookie、`GET/PUT /save`；新号默认档见 `newGameDefaults.ts`（与 `game-core` 的 `createInitialState` 字段对齐）
