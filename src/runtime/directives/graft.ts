import type { DirectiveNode } from "../../ast/nodes.js";
import type { V3GraphInstance, V3MutationChange, V3RuntimeContext } from "../context.js";
import { evaluateV3Value } from "../evaluation/evaluateValue.js";
import { runtimeError } from "../events.js";
import {
  createEdgeDefinitionValue,
  createNodeDefinitionValue,
  createNodeInstance,
  edgeDefinitionToInstance,
} from "../graphInstance.js";
import {
  directiveDomain,
  keyName,
  objectEntries,
  recordMutationEvent,
  targetPath,
} from "./mutationHelpers.js";

export function executeGraft(directive: DirectiveNode, context: V3RuntimeContext, graph: V3GraphInstance): void {
  const domain = directiveDomain(directive);
  const body = directive.body?.kind === "Object" ? directive.body : undefined;
  if (!domain || !body) return;

  const changes: V3MutationChange[] = [];

  if (domain === "node") {
    for (const entry of objectEntries(body)) {
      const id = keyName(entry.key);
      if (!id || entry.value.kind !== "NodeDefinition") continue;
      if (graph.nodes[id] || graph.localBindings[id]) {
        runtimeError(context, `Cannot graft node "${id}" because it already exists.`);
        continue;
      }

      const nodeValue = createNodeDefinitionValue(id, entry.value);
      graph.nodes[id] = createNodeInstance(nodeValue);
      graph.localBindings[id] = nodeValue;
      changes.push({ path: id, to: graph.nodes[id], operation: "add" });
    }
  }

  if (domain === "edge") {
    for (const entry of objectEntries(body)) {
      const id = keyName(entry.key);
      if (!id || entry.value.kind !== "Relationship" || entry.value.relationshipKind !== "edge") continue;
      if (graph.edges[id] || graph.localBindings[id]) {
        runtimeError(context, `Cannot graft edge "${id}" because it already exists.`);
        continue;
      }

      const edgeValue = createEdgeDefinitionValue(id, entry.value);
      const edge = edgeDefinitionToInstance(edgeValue);
      graph.edges[id] = edge;
      graph.localBindings[id] = edgeValue;
      changes.push({ path: id, to: edge, operation: "add" });
    }
  }

  if (domain === "state" || domain === "meta") {
    const store = domain === "state" ? graph.state : graph.meta;
    for (const entry of objectEntries(body)) {
      const target = targetPath(entry.key);
      if (!target) continue;
      const existing = store[target.subject]?.[target.key];
      if (existing !== undefined) {
        runtimeError(context, `Cannot graft ${domain} "${target.path}" because it already exists.`);
        continue;
      }

      store[target.subject] ??= {};
      const value = evaluateV3Value(entry.value, { runtime: context, graph });
      store[target.subject][target.key] = value;
      changes.push({ path: target.path, to: value, operation: "add" });
    }
  }

  recordMutationEvent(context, graph, "graft", domain, changes);
}
