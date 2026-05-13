import type { FlowStepNode, GateNode } from "../../ast/nodes.js";
import type { V3GraphInstance, V3RuntimeContext } from "../context.js";
import { executeActionInvocation } from "./steps/actionStep.js";
import { executeInjectionStep } from "./steps/injectionStep.js";
import { executeProjectionStep } from "./steps/projectionStep.js";
import { executeRepeat } from "./steps/repeatStep.js";
import { executeGraft } from "../directives/graft.js";
import { executePrune } from "../directives/prune.js";
import { executeUpdate } from "../directives/update.js";
import type { ProjectionBucket } from "./executeFlowSteps.js";

export function executeFlowStep(
  step: Exclude<FlowStepNode, GateNode>,
  context: V3RuntimeContext,
  graph: V3GraphInstance,
  projections: ProjectionBucket,
): void {
  if (step.operator === "<>") {
    executeProjectionStep(step.value, context, graph, projections);
    return;
  }

  if (step.operator === "<-") {
    executeInjectionStep(step.value, context, graph, projections);
    return;
  }

  const value = step.value;
  if (value.kind === "Invocation") {
    executeActionInvocation(value, context, graph, projections);
    return;
  }

  if (value.kind === "Relationship") {
    context.diagnostics.push({
      severity: "error",
      message: "Relationship mutation flow is not implemented yet.",
    });
    return;
  }

  if (value.name === "graft") {
    executeGraft(value, context, graph);
    return;
  }

  if (value.name === "prune") {
    executePrune(value, context, graph);
    return;
  }

  if (value.name === "update") {
    executeUpdate(value, context, graph);
    return;
  }

  if (value.name === "repeat") {
    executeRepeat(value, context, graph, projections);
  }
}
