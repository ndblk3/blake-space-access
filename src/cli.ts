#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { formatActorLine } from "./actor.js";
import { createFsAccessLog } from "./audit.js";
import { captureProcessActor } from "./actor.js";
import { recordSpaceAccess } from "./witness.js";

function usage(): never {
  console.error(`blake-space-access — personal-space FS witness

Usage:
  blake-space-access recent --dir <spaceRoot> [--limit N]
  blake-space-access record --dir <spaceRoot> --space <id> --op <op> [--path rel]
  blake-space-access whoami
`);
  process.exit(2);
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  if (!cmd || cmd === "-h" || cmd === "--help") usage();

  if (cmd === "whoami") {
    console.log(JSON.stringify(captureProcessActor(), null, 2));
    return;
  }

  function flag(name: string): string | undefined {
    const i = args.indexOf(name);
    if (i < 0) return undefined;
    return args[i + 1];
  }

  if (cmd === "recent") {
    const dir = flag("--dir");
    if (!dir) usage();
    const limit = Number(flag("--limit") || "20");
    const log = createFsAccessLog(path.resolve(dir));
    const rows = await log.recent(limit);
    for (const row of rows) {
      console.log(
        `${row.at}  ${row.op.padEnd(10)}  ${row.path}  ${formatActorLine(row.actor)}`,
      );
    }
    if (rows.length === 0) {
      console.error(`(no events in ${log.path})`);
    }
    return;
  }

  if (cmd === "record") {
    const dir = flag("--dir");
    const spaceId = flag("--space");
    const op = flag("--op") as
      | "read"
      | "write"
      | "list"
      | "delete"
      | "exec"
      | "stat"
      | "provision"
      | "sync"
      | undefined;
    if (!dir || !spaceId || !op) usage();
    const log = createFsAccessLog(path.resolve(dir));
    const event = await recordSpaceAccess(log, {
      spaceId,
      op,
      path: flag("--path") || ".",
    });
    console.log(JSON.stringify(event, null, 2));
    return;
  }

  if (cmd === "show-log") {
    const dir = flag("--dir");
    if (!dir) usage();
    const file = path.join(
      path.resolve(dir),
      ".blake-space-access",
      "access.jsonl",
    );
    try {
      process.stdout.write(await readFile(file, "utf8"));
    } catch {
      console.error(`missing ${file}`);
      process.exit(1);
    }
    return;
  }

  usage();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
