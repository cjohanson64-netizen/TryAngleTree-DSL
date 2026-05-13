import type { DirectiveNode, ObjectEntryNode } from "../../ast/nodes.js";
import type { V3GraphInstance } from "../context.js";
import { evaluateV3Value, type V3EvaluationContext, type V3MatchResult } from "../evaluation/evaluateValue.js";
import {
  argName,
  findEntryValue,
  firstGraph,
  matchesExpected,
  pathParts,
  readProperty,
  recordEvent,
  runtimeBindingValue,
} from "../evaluation/readHelpers.js";

export function evaluateMatch(node: DirectiveNode, context: V3EvaluationContext): V3MatchResult {
  const domain = argName(node.args[0]) ?? "unknown";
  const graph = context.graph ?? firstGraph(context.runtime);
  const where = node.body?.kind === "Object" ? findEntryValue(node.body, "where") : undefined;
  const filters = where?.kind === "Object" ? where.entries.filter((entry): entry is ObjectEntryNode => entry.kind === "ObjectEntry") : [];
  const candidates = graph ? matchCandidates(domain, graph) : [];
  const items = graph ? candidates.filter((candidate) => candidateMatches(candidate, filters, graph, context)) : [];
  const result: V3MatchResult = {
    domain,
    items,
    count: items.length,
  };

  recordEvent(context, {
    type: "match",
    graph: graph?.id,
    detail: { domain, count: result.count },
  });

  return result;
}

function matchCandidates(domain: string, graph: V3GraphInstance): unknown[] {
  if (domain === "node") return Object.values(graph.nodes);
  if (domain === "edge") return Object.values(graph.edges);
  if (domain === "state") return Object.entries(graph.state).map(([node, values]) => ({ node, values }));
  if (domain === "meta") return Object.entries(graph.meta).map(([node, values]) => ({ node, values }));
  return [];
}

function candidateMatches(
  candidate: unknown,
  filters: ObjectEntryNode[],
  graph: V3GraphInstance,
  context: V3EvaluationContext,
): boolean {
  const candidateNodeId = typeof candidate === "object" && candidate !== null && "id" in candidate
    ? String((candidate as { id: unknown }).id)
    : undefined;

  return filters.every((filter) => {
    const parts = pathParts(filter.key);
    const actual = resolveFilterValue(parts, candidate, candidateNodeId, graph);
    const expected = isEdgeFilter(parts)
      ? semanticStringValue(filter.value, { ...context, graph })
      : evaluateV3Value(filter.value, { ...context, graph });
    return matchesExpected(actual, expected);
  });
}

function isEdgeFilter(parts: string[]): boolean {
  return parts.length === 1 && (parts[0] === "from" || parts[0] === "relation" || parts[0] === "to");
}

function resolveFilterValue(
  parts: string[],
  candidate: unknown,
  nodeId: string | undefined,
  graph: V3GraphInstance,
): unknown {
  if (parts[0] === "state" && nodeId && parts[1]) return graph.state[nodeId]?.[parts.slice(1).join(".")];
  if (parts[0] === "meta" && nodeId && parts[1]) return graph.meta[nodeId]?.[parts.slice(1).join(".")];
  if (typeof candidate === "object" && candidate !== null) return readProperty(candidate, parts.join("."));
  return undefined;
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
