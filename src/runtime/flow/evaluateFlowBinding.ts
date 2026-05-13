import type { BindingNode, FlowNode } from "../../ast/nodes.js";
import type { V3RuntimeContext, V3RuntimeValue } from "../context.js";
import { executeFlowSteps, type ProjectionBucket } from "./executeFlowSteps.js";
import { resolveFlowSource } from "./resolveFlowSource.js";

export function evaluateFlowBinding(binding: BindingNode, flow: FlowNode, context: V3RuntimeContext): V3RuntimeValue {
  const graph = resolveFlowSource(flow.sourceNode, context);
  if (!graph) {
    context.diagnostics.push({
      severity: "error",
      message: "Flow source must resolve to a graph binding.",
    });
    return {
      type: "flowResult",
      value: { graph: "", events: [] },
      node: flow,
    };
  }

  const startEventIndex = context.events.length;
  const projections: ProjectionBucket = {};
  executeFlowSteps(flow.steps, context, graph, projections);

  Object.assign(context.projections, projections);

  return {
    type: "flowResult",
    value: {
      graph: graph.id,
      events: context.events.slice(startEventIndex),
      projections,
    },
    node: flow,
  };
}
