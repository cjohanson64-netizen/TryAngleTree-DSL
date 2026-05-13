import type { DirectiveNode } from "../../ast/nodes.js";
import type { V3GraphInstance, V3MutationChange, V3RuntimeContext } from "../context.js";
import {
  directiveDomain,
  edgeMatches,
  memberReference,
  memberTargetPath,
  objectCriteria,
  recordMutationEvent,
} from "./mutationHelpers.js";

export function executePrune(directive: DirectiveNode, context: V3RuntimeContext, graph: V3GraphInstance): void {
  const domain = directiveDomain(directive);
  const body = directive.body?.kind === "Object" ? directive.body : undefined;
  if (!domain || !body) return;

  const changes: V3MutationChange[] = [];

  if (domain === "node") {
    for (const entry of body.entries) {
      const id = memberReference(entry);
      if (!id || !graph.nodes[id]) continue;
      const previous = graph.nodes[id];
      delete graph.nodes[id];
      delete graph.state[id];
      delete graph.meta[id];
      delete graph.localBindings[id];

      for (const edge of Object.values(graph.edges)) {
        if (edge.from !== id && edge.to !== id) continue;
        delete graph.edges[edge.id];
        delete graph.localBindings[edge.id];
        changes.push({ path: edge.id, from: edge, operation: "remove" });
      }

      changes.push({ path: id, from: previous, operation: "remove" });
    }
  }

  if (domain === "edge") {
    const criteria = objectCriteria(body, context, graph);
    for (const edge of Object.values(graph.edges)) {
      if (!edgeMatches(edge, criteria)) continue;
      delete graph.edges[edge.id];
      delete graph.localBindings[edge.id];
      changes.push({ path: edge.id, from: edge, operation: "remove" });
    }
  }

  if (domain === "state" || domain === "meta") {
    const store = domain === "state" ? graph.state : graph.meta;
    for (const entry of body.entries) {
      const target = memberTargetPath(entry);
      if (!target || store[target.subject]?.[target.key] === undefined) continue;
      const previous = store[target.subject][target.key];
      delete store[target.subject][target.key];
      changes.push({ path: target.path, from: previous, operation: "remove" });
    }
  }

  recordMutationEvent(context, graph, "prune", domain, changes);
}
