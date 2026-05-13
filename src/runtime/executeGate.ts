import type { GateNode } from "../ast/nodes.js";
import { evaluateV3Value } from "./evaluation/evaluateValue.js";
import type { V3GraphInstance, V3RuntimeContext } from "./context.js";

export function evaluateGate(
  gate: GateNode,
  context: V3RuntimeContext,
  graph: V3GraphInstance,
  currentGateChainExecuted: boolean,
): boolean {
  if (gate.operator === ":>") {
    const condition = gate.condition ? truthy(evaluateV3Value(gate.condition, { runtime: context, graph })) : true;
    return !currentGateChainExecuted && condition;
  }

  const condition = gate.condition ? truthy(evaluateV3Value(gate.condition, { runtime: context, graph })) : false;
  return gate.operator === "!>" ? !condition : condition;
}

export function truthy(value: unknown): boolean {
  if (typeof value === "object" && value !== null) {
    if ("result" in value && typeof (value as { result: unknown }).result === "boolean") {
      return (value as { result: boolean }).result;
    }
    if ("has" in value && typeof (value as { has: unknown }).has === "boolean") {
      return (value as { has: boolean }).has;
    }
    if ("count" in value && typeof (value as { count: unknown }).count === "number") {
      return (value as { count: number }).count > 0;
    }
  }

  return Boolean(value);
}
