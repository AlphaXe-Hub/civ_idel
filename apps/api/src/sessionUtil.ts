import { randomBytes } from "node:crypto";

const DAY_MS = 24 * 60 * 60 * 1000;

export function newSessionId(): string {
  return randomBytes(32).toString("hex");
}

export function sessionExpiresAt(now: number): number {
  return now + 14 * DAY_MS;
}
