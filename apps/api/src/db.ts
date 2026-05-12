import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import initSqlJs, { type Database } from "sql.js";

const require = createRequire(import.meta.url);

let dbInstance: Database | null = null;

export function sqlJsDistDir(): string {
  const wasm = require.resolve("sql.js/dist/sql-wasm.wasm");
  return path.dirname(wasm);
}

export function getSqlitePath(): string {
  return process.env.SQLITE_PATH || path.join(process.cwd(), "data", "game.db");
}

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;
  const SQL = await initSqlJs({
    locateFile: (file: string) => path.join(sqlJsDistDir(), file),
  });
  const sqlitePath = getSqlitePath();
  if (fs.existsSync(sqlitePath)) {
    const buf = fs.readFileSync(sqlitePath);
    dbInstance = new SQL.Database(buf);
  } else {
    dbInstance = new SQL.Database();
  }
  migrate(dbInstance);
  persist(dbInstance);
  return dbInstance;
}

export function persist(db: Database = dbInstance!): void {
  if (!db) return;
  const sqlitePath = getSqlitePath();
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  const data = db.export();
  fs.writeFileSync(sqlitePath, Buffer.from(data));
}

function migrate(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS saves (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      save_json TEXT NOT NULL,
      save_version INTEGER NOT NULL DEFAULT 1,
      updated_at INTEGER NOT NULL,
      server_time_ms INTEGER NOT NULL
    );
  `);
}
