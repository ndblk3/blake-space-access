import { userInfo } from "node:os";
import type { SpaceAccessActor } from "./types.js";

/** Capture the current Node process + OS user as an access actor. */
export function captureProcessActor(
  patch?: Partial<SpaceAccessActor>,
): SpaceAccessActor {
  let user: string | undefined;
  let uid: number | null | undefined;
  try {
    const info = userInfo();
    user = info.username;
    uid = typeof info.uid === "number" ? info.uid : null;
  } catch {
    user = process.env.USER || process.env.LOGNAME || undefined;
    uid = typeof process.getuid === "function" ? process.getuid() : null;
  }

  const title = process.title?.trim() || "";
  const argv0 = process.argv[1]?.split(/[/\\]/).pop() || process.argv[0] || "node";

  return {
    kind: patch?.kind ?? "process",
    id: patch?.id,
    label: patch?.label,
    pid: patch?.pid ?? process.pid,
    uid: patch?.uid !== undefined ? patch.uid : uid,
    user: patch?.user ?? user,
    process: patch?.process ?? (title && title !== "node" ? title : argv0),
  };
}

export function mergeActor(
  base: SpaceAccessActor,
  patch?: Partial<SpaceAccessActor>,
): SpaceAccessActor {
  if (!patch) return base;
  return {
    kind: patch.kind ?? base.kind,
    id: patch.id ?? base.id,
    label: patch.label ?? base.label,
    pid: patch.pid ?? base.pid,
    uid: patch.uid !== undefined ? patch.uid : base.uid,
    user: patch.user ?? base.user,
    process: patch.process ?? base.process,
  };
}

/** Short line for UI lists. */
export function formatActorLine(actor: SpaceAccessActor): string {
  const bits: string[] = [];
  if (actor.label) bits.push(actor.label);
  else if (actor.id) bits.push(`${actor.kind}:${actor.id}`);
  else bits.push(actor.kind);
  if (actor.user) bits.push(`user=${actor.user}`);
  if (actor.pid != null) bits.push(`pid=${actor.pid}`);
  if (actor.process) bits.push(actor.process);
  return bits.join(" · ");
}
