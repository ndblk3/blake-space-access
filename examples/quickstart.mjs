import {
  createFsAccessLog,
  formatActorLine,
  recordSpaceAccess,
} from "../dist/index.js";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const root = await mkdtemp(path.join(tmpdir(), "space-"));
const log = createFsAccessLog(root);

await recordSpaceAccess(log, {
  spaceId: "demo",
  op: "sync",
  path: "README.md",
  actor: { kind: "agent", id: "agt_demo", label: "demo agent" },
});

for (const row of await log.recent(5)) {
  console.log(row.at, row.op, formatActorLine(row.actor));
}
console.log("log →", log.path);
