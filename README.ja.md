# 文明放置（Civ Idle）

Melvor Idle 系の放置文明ゲーム。Vue 3 フロント、Fastify API、sql.js（SQLite ファイル）セーブ、Docker 対応。

**言語**：ログイン画面またはゲーム画面上部のセレクターで **简体中文 / English / 日本語** を選べます（`localStorage` のキー `civ-idle-locale` に保存）。

## デバッグ：ゲーム速度（`timeScale`）

リポジトリ直下の [`config/game-speed.json`](config/game-speed.json) と [`apps/web/public/game-speed.json`](apps/web/public/game-speed.json) を揃えてください。ローカル Vite は `public` 側を読みます。Docker では `config/game-speed.json` がサイトルートにコピーされ、Compose で `web` コンテナに **マウント** されます。ホスト側を編集したら **ブラウザを再読み込み**（フロント再ビルド不要）。

```json
{ "timeScale": 10 }
```

- `1`：通常速度
- `>1`：生産が倍率で加速、研究・建物アップグレード・進化の儀式の所要時間は `1/timeScale` で短縮
- 許容範囲 `0.01`～`100`（範囲外はクリップ）

`timeScale !== 1` のときヘッダーに **⏱×N** を表示します。

## ローカル開発

```bash
npm install
npm run build -w @civ-idle/game-core
```

ターミナル 1（API、既定ポート 3001。先に `game-core` をビルド）:

```bash
npm run dev:api
```

ターミナル 2（Web。Vite が `/api` を API にプロキシ）:

```bash
npm run dev -w @civ-idle/web
```

Vite が表示する URL（多くの場合 `http://127.0.0.1:5173`）を開き、アカウント登録後にプレイします。

ポート **3001** が使用中の場合:

```bash
VITE_API_PROXY_TARGET=http://127.0.0.1:3088 npm run dev -w @civ-idle/web
```

（API は `PORT=3088 npm run dev -w @civ-idle/api` で起動。）

## ユニットテスト

```bash
npm run test -w @civ-idle/game-core
```

## Docker

```bash
docker compose build
docker compose up
```

ソケット権限がない場合は `sudo docker compose build` / `sudo docker compose up`。

- フロントとリバースプロキシ: `http://localhost:8080`（静的ファイル + `/api/*` をバックエンドへ）
- SQLite ボリューム: `civ_sqlite` → コンテナ内 `/data/game.db`
- デバッグ倍速: リポジトリ直下の `config/game-speed.json` を編集して再読込（`web` にマウント済み）

## 構成

- `packages/game-core`: 資源・建物・技術・クエスト・時代、tick とオフライン処理
- `apps/web`: Vue + Pinia + Tailwind + vue-i18n
- `apps/api`: 認証、セッション Cookie、`GET/PUT /save`、新規は `newGameDefaults.ts`（`game-core` の `createInitialState` と整合）

## 他言語 README

- [English](README.en.md)
- [简体中文](README.zh-CN.md)
