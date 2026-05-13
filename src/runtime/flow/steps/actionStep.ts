import type { InvocationNode } from "../../../ast/nodes.js";
import type { V3GraphInstance, V3RuntimeContext } from "../../context.js";
import { recordRuntimeEvent, runtimeError } from "../../events.js";
import { executeFlowSteps, type ProjectionBucket } from "../executeFlowSteps.js";
import { createScopedContext, invocationArgValue, referenceValue } from "./stepHelpers.js";

export function executeActionInvocation(
  invocation: InvocationNode,
  context: V3RuntimeContext,
  graph: V3GraphInstance,
  projections: ProjectionBucket,
): void {
  const actionName = referenceValue(invocation.callee);
  const constructor = actionName ? context.bindings[actionName] : undefined;
  if (!actionName || constructor?.type !== "constructor" || constructor.constructorKind !== "action") {
    runtimeError(context, "Action invocation runtime is not implemented yet.");
    return;
  }

  const args = invocation.args.map((arg) => invocationArgValue(arg, context, graph));
  const scopedContext = createScopedContext(context, constructor.params, args, invocation.args);
  recordRuntimeEvent(context, graph, {
    type: "action",
    graph: graph.id,
    name: actionName,
    args,
  });

  if (constructor.body?.kind === "FlowBody") {
    executeFlowSteps(constructor.body.steps, scopedContext, graph, projections);
  }
}
