import type { DirectiveNode, ObjectNode } from "../../ast/nodes.js";
import type { V3EdgeInstance, V3GraphInstance } from "../context.js";
import { evaluateV3Value, type V3EvaluationContext, type V3QueryResult } from "../evaluation/evaluateValue.js";
import {
  argName,
  edgeProperty,
  firstGraph,
  keyName,
  matchesExpected,
  readProperty,
  recordEvent,
  runtimeBindingValue,
} from "../evaluation/readHelpers.js";

export function evaluateQuery(node: DirectiveNode, context: V3EvaluationContext): V3QueryResult {
  const domain = argName(node.args[0]) ?? "unknown";
  const condition = node.body?.kind === "Object" ? evaluateQueryCondition(node.body, context) : {};
  const graph = context.graph ?? firstGraph(context.runtime);
  const matches = graph ? queryMatches(domain, condition, graph) : [];
  const result: V3QueryResult = {
    result: matches.length > 0,
    domain,
    condition,
    matches,
  };

  recordEvent(context, {
    type: "query",
    graph: graph?.id,
    detail: {
      domain,
      result: result.result,
      condition,
    },
  });

  return result;
}

function evaluateQueryCondition(node: ObjectNode, context: V3EvaluationContext): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const semanticReferenceKeys = new Set(["id", "node", "from", "to", "relation", "key"]);

  for (const entry of node.entries) {
    if (entry.kind !== "ObjectEntry") continue;

    const key = keyName(entry.key);
    if (!key) continue;

    result[key] = semanticReferenceKeys.has(key)
      ? semanticStringValue(entry.value, context)
      : evaluateV3Value(entry.value, context);
  }

  return result;
}

function queryMatches(domain: string, condition: Record<string, unknown>, graph: V3GraphInstance): unknown[] {
  if (domain === "node") {
    return Object.values(graph.nodes).filter((node) =>
      Object.entries(condition).every(([key, value]) => node.data[key] === value),
    );
  }

  if (domain === "edge") {
    return Object.values(graph.edges).filter((edge) =>
      Object.entries(condition).every(([key, value]) => edgeProperty(edge, key) === value),
    );
  }

  if (domain === "state" || domain === "meta") {
    const store = domain === "state" ? graph.state : graph.meta;
    const node = condition.node;
    const key = condition.key;
    const expected = condition.value;

    if (typeof node === "string" && key === undefined) {
      return store[node] && Object.keys(store[node]).length > 0 ? [{ node, values: store[node] }] : [];
    }

    if (typeof node !== "string" || typeof key !== "string") {
      return Object.entries(store).flatMap(([nodeId, values]) =>
        Object.entries(values).map(([valueKey, value]) => ({ node: nodeId, key: valueKey, value })),
      );
    }

    const actual = store[node]?.[key];
    if (expected === undefined || matchesExpected(actual, expected)) {
      return actual === undefined ? [] : [{ node, key, value: actual }];
    }

    return [];
  }

  if (domain === "graph") {
    return Object.entries(condition).every(([key, value]) => readProperty(graph, key) === value) ? [graph] : [];
  }

  if (domain === "value") {
    const value = condition.value;
    const equals = condition.equals;
    return equals === undefined || value === equals ? [value] : [];
  }

  return [];
}

function semanticStringValue(node: Parameters<typeof evaluateV3Value>[0] | undefined, context: V3EvaluationContext): string | undefined {
  if (!node) return undefined;
  if (node.kind === "Identifier") {
    const binding = context.runtime.bindings[node.name];
    const value = binding ? runtimeBindingValue(binding) : undefined;
    return typeof value === "string" ? value : node.name;
  }
  if (node.kind === "Path") return node.parts.map((part) => part.name).join(".");
  const value = evaluateV3Value(node, context);
  return value === undefined || value === null ? undefined : String(value);
}
