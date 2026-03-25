function getNodeLabel(node) {
  if (!node) return "";
  return node.value?.name ?? node.meta?.label ?? node.id ?? "";
}

function deriveStatus(node) {
  if (!node) return null;

  if (typeof node.meta?.status === "string") {
    return node.meta.status;
  }

  if (typeof node.meta?.result === "string") {
    return node.meta.result;
  }

  return null;
}

function deriveActions(node, allNodes, allEdges) {
  if (!node) return [];

  const nodeMap = new Map(allNodes.map((item) => [item.id, item]));

  return allEdges
    .filter((edge) => edge.subject === node.id && edge.relation === "can")
    .map((edge) => nodeMap.get(edge.object))
    .filter(Boolean)
    .map((actionNode) => ({
      id: actionNode.id.endsWith("Node")
        ? actionNode.id.slice(0, -"Node".length)
        : actionNode.id,
      label: getNodeLabel(actionNode),
      value: actionNode.value ?? {},
      state: actionNode.state ?? {},
      meta: actionNode.meta ?? {},
    }));
}

export function deriveSummaryFromGraph(graphProjection, focusNodeId) {
  if (!graphProjection || graphProjection.format !== "graph") {
    return null;
  }

  const nodes = graphProjection.nodes ?? [];
  const edges = graphProjection.edges ?? [];
  const focus = focusNodeId ?? graphProjection.focus ?? graphProjection.root ?? null;

  const selectedNode = nodes.find((node) => node.id === focus) ?? null;
  if (!selectedNode) return null;

  return {
    format: "summary",
    focus: selectedNode,
    data: {
      id: selectedNode.id,
      label: getNodeLabel(selectedNode),
      status: deriveStatus(selectedNode),
      value: selectedNode.value ?? {},
      state: selectedNode.state ?? {},
      meta: selectedNode.meta ?? {},
      actions: deriveActions(selectedNode, nodes, edges),
    },
  };
}