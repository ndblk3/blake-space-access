# blake-witness

Witness **who or what** touched a personal space on disk.

Part of **blake-guard**:

1. **`blake-gate`** — gate intents (merge, send, push, spawn, replicate)  
2. **`blake-witness`** — witness filesystem contact with a space  
3. **`blake-trail`** — durable decision→outcome trail  

This package records **filesystem contact**: process, OS user, agent, or host request — durable JSONL next to the space.

1. **Process identity** — pid, uid, OS user, process title  
2. **Durable FS log** — `{space}/.blake-space-access/access.jsonl`  
3. **Host actors** — owner / agent / http / system labels  
4. **Optional allowlist** — deny unknown OS users before open  
5. **CLI** — `recent` · `record` · `whoami`  
6. **Same contract on Blake or your host** — no Blake UI required  

**Suite:** [blake-guard](https://bl4k3.com/guard) · **Package docs:** [bl4k3.com/witness](https://bl4k3.com/witness)  
**License:** Apache-2.0 · **Node ≥ 20**

## Install

```bash
npm install blake-witness
```

## Quick start

```ts
import {
  createFsAccessLog,
  recordSpaceAccess,
  formatActorLine,
} from "blake-witness";

const log = createFsAccessLog("/var/spaces/andy");

await recordSpaceAccess(log, {
  spaceId: "andy",
  op: "sync",
  path: "agents/",
  actor: { kind: "agent", id: "agt_123", label: "inbox agent" },
});

for (const row of await log.recent(20)) {
  console.log(row.at, row.op, formatActorLine(row.actor));
}
```

## CLI

```bash
npx blake-witness whoami
npx blake-witness record --dir ./data/agents/andy --space andy --op write --path README.md
npx blake-witness recent --dir ./data/agents/andy --limit 20
```

## Blake

On [bl4k3.com](https://bl4k3.com), each space lives under `data/agents/{nickname}/` on the host filesystem. Sync and provision calls append to `.blake-space-access/access.jsonl`. Owners see recent accessors in **Account → Profile** and on [/space-access](https://bl4k3.com/witness).

## Publish (maintainers)

```bash
npm run build
npm test
npm publish --access public
# GitHub: push this package as ndblk3/blake-witness (mirror of packages/blake-witness)
```
