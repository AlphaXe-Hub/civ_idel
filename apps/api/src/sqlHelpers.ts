import type { Database } from "sql.js";

export function run(db: Database, sql: string, params: (string | number | null)[] = []): void {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
}

export function getOne(
  db: Database,
  sql: string,
  params: (string | number | null)[] = [],
): (string | number | null)[] | null {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.get();
  stmt.free();
  return row as (string | number | null)[];
}

export function getAll(
  db: Database,
  sql: string,
  params: (string | number | null)[] = [],
): (string | number | null)[][] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: (string | number | null)[][] = [];
  while (stmt.step()) {
    rows.push(stmt.get() as (string | number | null)[]);
  }
  stmt.free();
  return rows;
}

export function lastInsertRowid(db: Database): number {
  const r = getOne(db, "SELECT last_insert_rowid()");
  return Number(r?.[0] ?? 0);
}
