import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  captureProcessActor,
  createFsAccessLog,
  createMemoryAccessLog,
  evaluateSpaceAccess,
  formatActorLine,
  recordSpaceAccess,
} from "../dist/index.js";

test("memory log keeps newest first", async () => {
  const log = createMemoryAccessLog(10);
  await recordSpaceAccess(log, { spaceId: "andy", op: "read", path: "a" });
  await recordSpaceAccess(log, { spaceId: "andy", op: "write", path: "b" });
  const rows = await log.recent(10);
  assert.equal(rows[0]?.path, "b");
  assert.equal(rows[1]?.path, "a");
  assert.ok(rows[0]?.actor.pid);
});

test("fs log persists under .blake-space-access", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "blake-space-"));
  try {
    const log = createFsAccessLog(root);
    await recordSpaceAccess(log, {
      spaceId: "andy",
      op: "provision",
      actor: { kind: "system", label: "provision" },
    });
    const rows = await log.recent(5);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.op, "provision");
    assert.match(log.path, /\.blake-space-access[/\\]access\.jsonl$/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("gate denies unknown user", () => {
  const actor = captureProcessActor({ user: "intruder", kind: "process" });
  const decision = evaluateSpaceAccess(actor, { users: ["ubuntu"] });
  assert.equal(decision.effect, "deny");
  assert.ok(formatActorLine(actor).includes("intruder"));
});
