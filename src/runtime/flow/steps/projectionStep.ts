import type { DirectiveNode, InvocationNode, ObjectNode } from "../../../ast/nodes.js";
import { buildExplanationOutput } from "../../projections/explanation.js";
import type { V3GraphInstance, V3RuntimeContext } from "../../context.js";
import { evaluateV3Value } from "../../evaluation/evaluateValue.js";
import { recordRuntimeEvent, runtimeError } from "../../events.js";
import type { ProjectionBucket } from "../executeFlowSteps.js";
import {
  arrayItems,
  createScopedContext,
  displayPath,
  emptyObject,
  findEntryValue,
  invocationArgValue,
  referenceValue,
  stringFromValue,
} from "./stepHelpers.js";

export function executeProjectionStep(
  value: DirectiveNode | InvocationNode,
  context: V3RuntimeContext,
  graph: V3GraphInstance,
  projections: ProjectionBucket,
): void {
  if (value.kind === "Invocation") {
    executeProjectionInvocation(value, context, graph, projections);
    return;
  }

  if (value.name === "project") {
    const projection = executeInlineProject(value, context, graph);
    projections.project = projection;
    recordProjectionEvent(context, graph, "project", "project");
    return;
  }

  if (isExplanationProjectionName(value.name)) {
    recordProjectionEvent(context, graph, `@${value.name}`, value.name);
    const output = executeExplanationProjection(value.name, context, graph);
    projections[value.name] = output;
  }
}

export function executeProjectionInvocation(
  invocation: InvocationNode,
  context: V3RuntimeContext,
  graph: V3GraphInstance,
  projections: ProjectionBucket,
): void {
  const projectionName = referenceValue(invocation.callee);
  const constructor = projectionName ? context.bindings[projectionName] : undefined;
  if (!projectionName || constructor?.type !== "constructor" || constructor.constructorKind !== "projection") {
    runtimeError(context, `Unknown projection "${projectionName ?? ""}".`);
    return;
  }

  const args = invocation.args.map((arg) => invocationArgValue(arg, context, graph));
  const scopedContext = createScopedContext(context, constructor.params, args, invocation.args);
  const body = constructor.body?.kind === "Object" ? constructor.body : undefined;
  const projection = buildProjectionOutput(body, scopedContext, graph, String(args[0] ?? ""));
  projections.project = projection;
  recordProjectionEvent(context, graph, projectionName, "project");
}

export function executeInlineProject(
  directive: DirectiveNode,
  context: V3RuntimeContext,
  graph: V3GraphInstance,
): Record<string, unknown> {
  const body = directive.body?.kind === "Object" ? directive.body : undefined;
  const target = invocationArgValue(directive.args[0], context, graph);
  return buildProjectionOutput(body, context, graph, target === undefined ? undefined : String(target));
}

function buildProjectionOutput(
  body: ObjectNode | undefined,
  context: V3RuntimeContext,
  graph: V3GraphInstance,
  target: string | undefined,
): Record<string, unknown> {
  const format = stringFromValue(findEntryValue(body ?? emptyObject(), "format"), context, graph) ?? "custom";
  const include = findEntryValue(body ?? emptyObject(), "include");
  const data: Record<string, unknown> = {};

  for (const item of arrayItems(include)) {
    const key = displayPath(item);
    if (!key) continue;
    data[key] = evaluateV3Value(item, { runtime: context, graph });
  }

  return {
    kind: "project",
    format,
    target,
    data,
  };
}

function executeExplanationProjection(name: "who" | "what" | "why" | "how", context: V3RuntimeContext, graph: V3GraphInstance): Record<string, unknown> {
  return buildExplanationOutput(name, context.events);
}

function isExplanationProjectionName(name: string): name is "who" | "what" | "why" | "how" {
  return name === "who" || name === "what" || name === "why" || name === "how";
}

function recordProjectionEvent(
  context: V3RuntimeContext,
  graph: V3GraphInstance,
  projection: string,
  kind: string,
): void {
  recordRuntimeEvent(context, graph, {
    type: "projection",
    graph: graph.id,
    projection,
    detail: { kind },
  });
}
