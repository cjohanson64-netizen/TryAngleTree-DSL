import type { V3GraphInstance, V3RuntimeContext, V3RuntimeEvent } from "./context.js";

export type { V3MutationChange, V3RuntimeEvent } from "./context.js";

export function recordRuntimeEvent(context: V3RuntimeContext, graph: V3GraphInstance, event: V3RuntimeEvent): void {
  context.events.push(event);
  graph.history.push(event);
}

export function runtimeError(context: V3RuntimeContext, message: string): void {
  context.diagnostics.push({
    severity: "error",
    message,
  });
}
