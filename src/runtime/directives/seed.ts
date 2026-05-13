import type { BindingNode, DirectiveNode } from "../../ast/nodes.js";
import type { V3GraphInstance, V3RuntimeContext } from "../context.js";
import { createNodeInstance, resolveSeedEdge } from "../graphInstance.js";
import { createGraph, initializeGraphRecord } from "../entities/graph/createGraph.js";
import { arrayItems, findEntryValue, referenceValue } from "./mutationHelpers.js";

export function executeSeedBinding(
  binding: BindingNode,
  directive: DirectiveNode,
  context: V3RuntimeContext,
): V3GraphInstance {
  const body = directive.body?.kind === "Object" ? directive.body : undefined;
  const root = body ? referenceValue(findEntryValue(body, "root")) ?? "" : "";
  const graph = createGraph(binding.name.name, root);

  if (!body) return graph;

  for (const nodeRef of arrayItems(findEntryValue(body, "node"))) {
    const nodeId = referenceValue(nodeRef);
    if (!nodeId) continue;

    const nodeValue = context.bindings[nodeId];
    if (nodeValue?.type === "nodeDefinition") {
      graph.nodes[nodeId] = createNodeInstance(nodeValue);
      graph.localBindings[nodeId] = nodeValue;
    }
  }

  for (const edgeRef of arrayItems(findEntryValue(body, "edge"))) {
    const edge = resolveSeedEdge(edgeRef, context);
    if (!edge) continue;

    graph.edges[edge.id] = edge;
  }

  initializeGraphRecord(graph.state, findEntryValue(body, "state"), context, graph);
  initializeGraphRecord(graph.meta, findEntryValue(body, "meta"), context, graph);

  const event = {
    type: "seed",
    graph: graph.id,
    root: graph.root,
  };
  graph.history.push(event);
  context.events.push(event);

  return graph;
}
