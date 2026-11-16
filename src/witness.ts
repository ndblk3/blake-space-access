import { captureProcessActor, mergeActor } from "./actor.js";
import type {
  RecordAccessInput,
  SpaceAccessEvent,
  SpaceAccessLog,
} from "./types.js";

export function buildAccessEvent(input: RecordAccessInput): SpaceAccessEvent {
  const processActor = captureProcessActor();
  return {
    at: input.at ?? new Date().toISOString(),
    spaceId: input.spaceId,
    path: input.path?.trim() || ".",
    op: input.op,
    actor: mergeActor(processActor, input.actor),
    runId: input.runId,
    meta: input.meta,
  };
}

/** Append one access event (always captures process identity). */
export async function recordSpaceAccess(
  log: SpaceAccessLog,
  input: RecordAccessInput,
): Promise<SpaceAccessEvent> {
  const event = buildAccessEvent(input);
  await log.append(event);
  return event;
}

/**
 * Run work while recording start (and optional finish) against the space log.
 * Failures still get a finish event with meta.error when `recordFinish` is true.
 */
export async function withSpaceAccess<T>(
  log: SpaceAccessLog,
  input: RecordAccessInput,
  work: () => Promise<T>,
  options?: { recordFinish?: boolean },
): Promise<T> {
  await recordSpaceAccess(log, input);
  try {
    const result = await work();
    if (options?.recordFinish) {
      await recordSpaceAccess(log, {
        ...input,
        op: input.op,
        path: input.path,
        meta: { ...(input.meta ?? {}), phase: "finish" },
      });
    }
    return result;
  } catch (error) {
    if (options?.recordFinish) {
      await recordSpaceAccess(log, {
        ...input,
        meta: {
          ...(input.meta ?? {}),
          phase: "error",
          error: error instanceof Error ? error.message : "error",
        },
      }).catch(() => undefined);
    }
    throw error;
  }
}
