# blake-space-access

Witness **who or what** touched a personal space on disk.

`blake-policy-agent` gates **intents** (merge, send, push).  
`blake-space-access` records **filesystem contact** with a space: process, OS user, agent, or host request — durable JSONL next to the space.

1. **Process identity** — pid, uid, OS user, process title  
2. **Durable FS log** — `{space}/.blake-space-access/access.jsonl`  
3. **Host actors** — owner / agent / http / system labels  
4. **Optional allowlist** — deny unknown OS users before open  
5. **CLI** — `recent` · `record` · `whoami`  
6. **Same contract on Blake or your host** — no Blake UI required  

**Docs (Blake):** [bl4k3.com/space-access](https://bl4k3.com/space-access)  
**Companion:** [blake-policy-agent](https://www.npmjs.com/package/blake-policy-agent)  
**License:** Apache-2.0 · **Node ≥ 20**

## Install

```bash
npm install blake-space-access
```

## Quick start

```ts
import {
  createFsAccessLog,
  recordSpaceAccess,
  formatActorLine,
} from "blake-space-access";

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
npx blake-space-access whoami
npx blake-space-access record --dir ./data/agents/andy --space andy --op write --path README.md
npx blake-space-access recent --dir ./data/agents/andy --limit 20
```

## Blake

On [bl4k3.com](https://bl4k3.com), each space lives under `data/agents/{nickname}/` on the host filesystem. Sync and provision calls append to `.blake-space-access/access.jsonl`. Owners see recent accessors in **Account → Profile** and on [/space-access](https://bl4k3.com/space-access).

## Publish (maintainers)

```bash
npm run build
npm test
npm publish --access public
# GitHub: push this package as ndblk3/blake-space-access (mirror of packages/blake-space-access)
```
