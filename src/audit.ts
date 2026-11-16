import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { SpaceAccessEvent, SpaceAccessLog } from "./types.js";

export const ACCESS_DIR_NAME = ".blake-space-access";
export const ACCESS_LOG_NAME = "access.jsonl";

export function accessLogPath(spaceRoot: string): string {
  return path.join(spaceRoot, ACCESS_DIR_NAME, ACCESS_LOG_NAME);
}

function parseLine(line: string): SpaceAccessEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    const row = JSON.parse(trimmed) as SpaceAccessEvent;
    if (!row?.at || !row.spaceId || !row.op || !row.actor) return null;
    return row;
  } catch {
    return null;
  }
}

/** Durable JSONL audit under `{spaceRoot}/.blake-space-access/access.jsonl`. */
export function createFsAccessLog(spaceRoot: string): SpaceAccessLog {
  const file = accessLogPath(spaceRoot);
  return {
    path: file,
    async append(event) {
      await mkdir(path.dirname(file), { recursive: true });
      await appendFile(file, `${JSON.stringify(event)}\n`, "utf8");
    },
    async recent(limit = 50) {
      const capped = Math.max(1, Math.min(500, limit));
      let raw = "";
      try {
        raw = await readFile(file, "utf8");
      } catch {
        return [];
      }
      const lines = raw.split("\n");
      const out: SpaceAccessEvent[] = [];
      for (let i = lines.length - 1; i >= 0 && out.length < capped; i -= 1) {
        const row = parseLine(lines[i] ?? "");
        if (row) out.push(row);
      }
      return out;
    },
  };
}

/** In-memory ring buffer — tests and short-lived hosts. */
export function createMemoryAccessLog(capacity = 500): SpaceAccessLog {
  const events: SpaceAccessEvent[] = [];
  return {
    path: ":memory:",
    async append(event) {
      events.push(event);
      if (events.length > capacity) {
        events.splice(0, events.length - capacity);
      }
    },
    async recent(limit = 50) {
      const capped = Math.max(1, Math.min(capacity, limit));
      return events.slice(-capped).reverse();
    },
  };
}
