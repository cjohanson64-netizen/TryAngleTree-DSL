import type { DirectiveNode } from "../../../ast/nodes.js";
import type { V3GraphInstance, V3RuntimeContext, V3RuntimeEvent } from "../../context.js";
import { evaluateV3Value } from "../../evaluation/evaluateValue.js";
import { truthy } from "../../executeGate.js";
import { recordRuntimeEvent } from "../../events.js";
import { executeFlowSteps, type ProjectionBucket } from "../executeFlowSteps.js";
import { findEntryValue } from "./stepHelpers.js";

export function executeRepeat(
  directive: DirectiveNode,
  context: V3RuntimeContext,
  graph: V3GraphInstance,
  projections: ProjectionBucket,
): void {
  const body = directive.body?.kind === "Object" ? directive.body : undefined;
  const doValue = body ? findEntryValue(body, "do") : undefined;
  if (!body || doValue?.kind !== "FlowBody") return;

  const limitValue = directive.args[0] ? evaluateV3Value(directive.args[0], { runtime: context, graph }) : undefined;
  const limit = typeof limitValue === "number" && Number.isFinite(limitValue) ? Math.max(0, Math.floor(limitValue)) : undefined;
  const whileCondition = findEntryValue(body, "while");
  const repeatEvent: V3RuntimeEvent = {
    type: "repeat",
    graph: graph.id,
    iterations: 0,
    limit,
    stoppedBy: "none",
    executedSteps: [],
  };
  recordRuntimeEvent(context, graph, repeatEvent);

  let iterations = 0;
  let stoppedBy: V3RuntimeEvent["stoppedBy"] = "none";
  const startEventIndex = context.events.length;

  while (limit === undefined || iterations < limit) {
    if (whileCondition && !truthy(evaluateV3Value(whileCondition, { runtime: context, graph }))) {
      stoppedBy = "while";
      break;
    }

    executeFlowSteps(doValue.steps, context, graph, projections);
    iterations += 1;
  }

  if (stoppedBy === "none" && limit !== undefined && iterations >= limit) {
    stoppedBy = "times";
  }

  repeatEvent.iterations = iterations;
  repeatEvent.stoppedBy = stoppedBy;
  repeatEvent.executedSteps = context.events.slice(startEventIndex);
}
