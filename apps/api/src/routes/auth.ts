import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcryptjs";
import { getDb, persist } from "../db.js";
import { getOne, lastInsertRowid, run } from "../sqlHelpers.js";
import { newSessionId, sessionExpiresAt } from "../sessionUtil.js";

const USERNAME_RE = /^[a-zA-Z0-9_\-\u4e00-\u9fff]{2,32}$/;

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (req, reply) => {
    const body = req.body as { username?: string; password?: string };
    const username = (body.username ?? "").trim();
    const password = body.password ?? "";
    if (!USERNAME_RE.test(username)) {
      return reply.code(400).send({ error: "用户名 2–32 位，仅字母数字下划线或中文" });
    }
    if (password.length < 4) return reply.code(400).send({ error: "密码至少 4 字符" });
    const db = await getDb();
    const exists = getOne(db, "SELECT id FROM users WHERE username = ?", [username]);
    if (exists) return reply.code(409).send({ error: "用户名已存在" });
    const hash = await bcrypt.hash(password, 10);
    const now = Date.now();
    run(db, "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)", [
      username,
      hash,
      now,
    ]);
    const userId = lastInsertRowid(db);
    await attachSession(reply, db, userId);
    persist(db);
    return { user: { id: userId, username } };
  });

  app.post("/auth/login", async (req, reply) => {
    const body = req.body as { username?: string; password?: string };
    const username = (body.username ?? "").trim();
    const password = body.password ?? "";
    const db = await getDb();
    const row = getOne(db, "SELECT id, password_hash FROM users WHERE username = ?", [username]);
    if (!row) return reply.code(401).send({ error: "用户名或密码错误" });
    const userId = Number(row[0]);
    const hash = String(row[1]);
    const ok = await bcrypt.compare(password, hash);
    if (!ok) return reply.code(401).send({ error: "用户名或密码错误" });
    await attachSession(reply, db, userId);
    persist(db);
    const nameRow = getOne(db, "SELECT username FROM users WHERE id = ?", [userId]);
    return { user: { id: userId, username: String(nameRow?.[0] ?? username) } };
  });

  app.post("/auth/logout", async (req, reply) => {
    const sid = req.cookies.sid;
    if (sid) {
      const db = await getDb();
      run(db, "DELETE FROM sessions WHERE id = ?", [sid]);
      persist(db);
    }
    reply.clearCookie("sid", { path: "/" });
    return { ok: true };
  });

  app.get("/auth/me", async (req, reply) => {
    const user = await getUserFromRequest(req);
    if (!user) return reply.code(401).send({ error: "未登录" });
    return { user };
  });
}

async function attachSession(reply: FastifyReply, db: import("sql.js").Database, userId: number) {
  const id = newSessionId();
  const exp = sessionExpiresAt(Date.now());
  run(db, "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [id, userId, exp]);
  reply.setCookie("sid", id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 14 * 24 * 60 * 60,
  });
}

export async function getUserFromRequest(
  req: FastifyRequest,
): Promise<{ id: number; username: string } | null> {
  const sid = req.cookies.sid;
  if (!sid) return null;
  const db = await getDb();
  const now = Date.now();
  const row = getOne(
    db,
    `SELECT u.id, u.username FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > ?`,
    [sid, now],
  );
  if (!row) return null;
  return { id: Number(row[0]), username: String(row[1]) };
}
