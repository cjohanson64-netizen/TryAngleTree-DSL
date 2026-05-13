import type { FlowStepNode } from "../../ast/nodes.js";
import type { V3GraphInstance, V3RuntimeContext } from "../context.js";
import { evaluateGate } from "../executeGate.js";
import { recordRuntimeEvent } from "../events.js";
import { executeFlowStep } from "./executeFlowStep.js";

export type ProjectionBucket = Record<string, unknown>;

export function executeFlowSteps(
  steps: FlowStepNode[],
  context: V3RuntimeContext,
  graph: V3GraphInstance,
  projections: ProjectionBucket,
): void {
  let activeSegment = true;
  let currentGateChainExecuted = false;

  for (const step of steps) {
    if (step.kind === "Gate") {
      const passed = evaluateGate(step, context, graph, currentGateChainExecuted);
      activeSegment = passed;
      currentGateChainExecuted = step.operator === ":>" ? currentGateChainExecuted || passed : passed;
      recordRuntimeEvent(context, graph, {
        type: "gate",
        graph: graph.id,
        operator: step.operator,
        passed,
      });
      continue;
    }

    if (!activeSegment) continue;

    executeFlowStep(step, context, graph, projections);
  }
}
