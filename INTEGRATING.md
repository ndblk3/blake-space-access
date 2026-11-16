# Integrating blake-witness

## Host contract

1. Give every personal space a **root directory** on disk.
2. Create a log: `createFsAccessLog(spaceRoot)`.
3. Before/after opening that tree, call `recordSpaceAccess` (or `withSpaceAccess`).
4. Always pass host context in `actor` when you know it (`owner`, `agent`, `http`).
5. Process fields (pid/user) are filled automatically.

## Minimal wrapper

```ts
import {
  createFsAccessLog,
  withSpaceAccess,
} from "blake-witness";

export async function readSpaceFile(spaceRoot: string, spaceId: string, rel: string) {
  const log = createFsAccessLog(spaceRoot);
  return withSpaceAccess(
    log,
    {
      spaceId,
      op: "read",
      path: rel,
      actor: { kind: "http", label: "api" },
    },
    async () => fs.readFile(path.join(spaceRoot, rel), "utf8"),
  );
}
```

## Optional gate

```ts
import { captureProcessActor, evaluateSpaceAccess } from "blake-witness";

const decision = evaluateSpaceAccess(captureProcessActor(), {
  users: ["ubuntu", "blake"],
  kinds: ["process", "agent", "owner", "system"],
});
if (decision.effect === "deny") throw new Error(decision.reasons.join(" "));
```

## What this is not

Kernel audit (auditd, FSEvents, Windows ETW) is out of scope. This package is the **application witness** for hosts that already touch space files in-process. Plug an OS adapter later by mapping those events into `SpaceAccessEvent`.
