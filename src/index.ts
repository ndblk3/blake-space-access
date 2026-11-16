export type {
  RecordAccessInput,
  SpaceAccessActor,
  SpaceAccessActorKind,
  SpaceAccessEvent,
  SpaceAccessLog,
  SpaceAccessOp,
} from "./types.js";

export {
  ACCESS_DIR_NAME,
  ACCESS_LOG_NAME,
  accessLogPath,
  createFsAccessLog,
  createMemoryAccessLog,
} from "./audit.js";

export {
  captureProcessActor,
  formatActorLine,
  mergeActor,
} from "./actor.js";

export { buildAccessEvent, recordSpaceAccess, withSpaceAccess } from "./witness.js";

export {
  evaluateSpaceAccess,
  type SpaceAccessDecision,
  type SpaceAccessRule,
} from "./gate.js";
