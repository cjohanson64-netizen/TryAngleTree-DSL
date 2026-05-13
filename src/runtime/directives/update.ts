import type { AssignmentNode, DirectiveNode } from "../../ast/nodes.js";
import type { V3GraphInstance, V3MutationChange, V3RuntimeContext } from "../context.js";
import { evaluateV3Value } from "../evaluation/evaluateValue.js";
import { runtimeError } from "../events.js";
import {
  assignmentTargetPath,
  directiveDomain,
  isMutableEdgeField,
  recordMutationEvent,
  resolveTargetAlias,
} from "./mutationHelpers.js";

export function executeUpdate(directive: DirectiveNode, context: V3RuntimeContext, graph: V3GraphInstance): void {
  const domain = directiveDomain(directive);
  const body = directive.body?.kind === "Object" ? directive.body : undefined;
  if (!domain || !body) return;

  const changes: V3MutationChange[] = [];

  for (const assignment of body.entries.filter((entry): entry is AssignmentNode => entry.kind === "Assignment")) {
    const target = resolveTargetAlias(assignmentTargetPath(assignment), context);
    if (!target) continue;

    const value = evaluateV3Value(assignment.value, { runtime: context, graph });

    if (domain === "state" || domain === "meta") {
      const store = domain === "state" ? graph.state : graph.meta;
      if (store[target.subject]?.[target.key] === undefined) {
        runtimeError(context, `Cannot update missing ${domain} "${target.path}".`);
        continue;
      }
      const previous = store[target.subject][target.key];
      store[target.subject][target.key] = value;
      changes.push({ path: target.path, from: previous, to: value, operation: "update" });
      continue;
    }

    if (domain === "node") {
      const node = graph.nodes[target.subject];
      if (!node || !(target.key in node.data)) {
        runtimeError(context, `Cannot update missing node value "${target.path}".`);
        continue;
      }
      const previous = node.data[target.key];
      node.data[target.key] = value;
      changes.push({ path: target.path, from: previous, to: value, operation: "update" });
      continue;
    }

    if (domain === "edge") {
      const edge = graph.edges[target.subject];
      if (!edge || !isMutableEdgeField(target.key)) {
        runtimeError(context, `Cannot update missing edge value "${target.path}".`);
        continue;
      }
      const previous = edge[target.key];
      edge[target.key] = value === undefined ? "" : String(value);
      changes.push({ path: target.path, from: previous, to: edge[target.key], operation: "update" });
    }
  }

  recordMutationEvent(context, graph, "update", domain, changes);
}
