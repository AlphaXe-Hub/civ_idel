import type { FastifyInstance } from "fastify";
import { getDb, persist } from "../db.js";
import { getOne, run } from "../sqlHelpers.js";
import { getUserFromRequest } from "./auth.js";
import { validateSaveBody } from "../validateSave.js";
import { createInitialSave } from "../newGameDefaults.js";

export async function saveRoutes(app: FastifyInstance) {
  app.get("/save", async (req, reply) => {
    const user = await getUserFromRequest(req);
    if (!user) return reply.code(401).send({ error: "未登录" });
    const db = await getDb();
    const row = getOne(db, "SELECT save_json, save_version, server_time_ms FROM saves WHERE user_id = ?", [
      user.id,
    ]);
    if (!row) {
      const now = Date.now();
      const initial = createInitialSave(now);
      return { save: initial, serverTimeMs: now };
    }
    const save = JSON.parse(String(row[0])) as unknown;
    return { save, serverTimeMs: Number(row[2]) };
  });

  app.put("/save", async (req, reply) => {
    const user = await getUserFromRequest(req);
    if (!user) return reply.code(401).send({ error: "未登录" });
    const body = req.body as { save?: unknown };
    if (!body || typeof body !== "object" || !("save" in body)) {
      return reply.code(400).send({ error: "缺少 save 字段" });
    }
    const v = validateSaveBody(body.save);
    if (!v.ok) return reply.code(400).send({ error: v.error });
    const incoming = v.data;
    const db = await getDb();
    const prevRow = getOne(db, "SELECT save_json FROM saves WHERE user_id = ?", [user.id]);
    if (prevRow) {
      try {
        const prev = JSON.parse(String(prevRow[0])) as { lastSyncedAt?: number };
        if (
          typeof prev.lastSyncedAt === "number" &&
          incoming.lastSyncedAt + 500 < prev.lastSyncedAt
        ) {
          return reply.code(409).send({ error: "存档时间早于服务器记录，拒绝覆盖" });
        }
      } catch {
        /* 忽略损坏旧档 */
      }
    }
    const now = Date.now();
    if (incoming.lastSyncedAt > now + 120_000) {
      return reply.code(400).send({ error: "lastSyncedAt 不合法" });
    }
    const json = JSON.stringify(incoming);
    run(
      db,
      `INSERT INTO saves (user_id, save_json, save_version, updated_at, server_time_ms)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         save_json = excluded.save_json,
         save_version = excluded.save_version,
         updated_at = excluded.updated_at,
         server_time_ms = excluded.server_time_ms`,
      [user.id, json, incoming.saveVersion, now, now],
    );
    persist(db);
    return { ok: true, serverTimeMs: now };
  });
}
