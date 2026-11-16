/** Who or what touched the space. */
export type SpaceAccessActorKind =
  | "owner"
  | "agent"
  | "process"
  | "http"
  | "system"
  | "unknown";

export type SpaceAccessActor = {
  kind: SpaceAccessActorKind;
  /** Owner id, agent id, numeric uid, or request id. */
  id?: string;
  /** Human label: email, nickname, cmdline snippet. */
  label?: string;
  pid?: number;
  uid?: number | null;
  /** OS username when available. */
  user?: string;
  /** process.title / argv0. */
  process?: string;
};

export type SpaceAccessOp =
  | "read"
  | "write"
  | "list"
  | "delete"
  | "exec"
  | "stat"
  | "provision"
  | "sync";

export type SpaceAccessEvent = {
  at: string;
  /** Space nickname or stable space id. */
  spaceId: string;
  /** Path relative to the space root when known. */
  path: string;
  op: SpaceAccessOp;
  actor: SpaceAccessActor;
  runId?: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type RecordAccessInput = {
  spaceId: string;
  path?: string;
  op: SpaceAccessOp;
  actor?: Partial<SpaceAccessActor>;
  runId?: string;
  meta?: Record<string, string | number | boolean | null>;
  at?: string;
};

export type SpaceAccessLog = {
  append(event: SpaceAccessEvent): Promise<void>;
  recent(limit?: number): Promise<SpaceAccessEvent[]>;
  path: string;
};
