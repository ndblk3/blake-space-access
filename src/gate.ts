import type { SpaceAccessActor, SpaceAccessActorKind } from "./types.js";

export type SpaceAccessRule = {
  /** Allow these actor kinds. Empty = any kind. */
  kinds?: SpaceAccessActorKind[];
  /** Allow these OS users. Empty = any user. */
  users?: string[];
  /** Allow these actor ids (owner/agent). Empty = any id. */
  ids?: string[];
};

export type SpaceAccessDecision = {
  effect: "allow" | "deny";
  reasons: string[];
};

/**
 * Optional allowlist check — hosts can deny unknown OS users or kinds
 * before opening a space path. Audit is separate (always record).
 */
export function evaluateSpaceAccess(
  actor: SpaceAccessActor,
  rules: SpaceAccessRule,
): SpaceAccessDecision {
  const reasons: string[] = [];

  if (rules.kinds && rules.kinds.length > 0 && !rules.kinds.includes(actor.kind)) {
    reasons.push(`actor kind ${actor.kind} is not allowed`);
  }
  if (rules.users && rules.users.length > 0) {
    const user = (actor.user || "").toLowerCase();
    const allowed = rules.users.map((u) => u.toLowerCase());
    if (!user || !allowed.includes(user)) {
      reasons.push(`OS user ${actor.user || "(none)"} is not allowed`);
    }
  }
  if (rules.ids && rules.ids.length > 0) {
    if (!actor.id || !rules.ids.includes(actor.id)) {
      reasons.push(`actor id ${actor.id || "(none)"} is not allowed`);
    }
  }

  if (reasons.length > 0) {
    return { effect: "deny", reasons };
  }
  return { effect: "allow", reasons: ["matched allowlist"] };
}
