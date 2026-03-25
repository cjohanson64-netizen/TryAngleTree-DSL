function getNodeLabel(node) {
  if (!node) return "";
  return node.value?.name ?? node.meta?.label ?? node.id ?? "";
}

function getNodeType(node) {
  return node?.value?.type ?? null;
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

function getPreferredEdges(edges, subjectId) {
  const relationPriority = ["targets", "contains", "unlocks", "can"];

  for (const relation of relationPriority) {
    const matches = edges.filter(
      (edge) => edge.subject === subjectId && edge.relation === relation,
    );

    if (matches.length > 0) {
      return matches;
    }
  }

  return edges.filter((edge) => edge.subject === subjectId);
}

export function deriveListFromGraph(graphProjection, focusNodeId) {
  if (!graphProjection || graphProjection.format !== "graph") {
    return null;
  }

  const nodes = graphProjection.nodes ?? [];
  const edges = graphProjection.edges ?? [];
  const focus = focusNodeId ?? graphProjection.focus ?? graphProjection.root ?? null;

  if (!focus) return null;

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const focusNode = nodeMap.get(focus) ?? null;
  const listEdges = getPreferredEdges(edges, focus);

  const items = listEdges
    .map((edge) => nodeMap.get(edge.object))
    .filter(Boolean)
    .map((node) => ({
      id: node.id,
      label: getNodeLabel(node),
      type: getNodeType(node),
      status: deriveStatus(node),
      value: node.value ?? {},
      state: node.state ?? {},
      meta: node.meta ?? {},
    }));

  return {
    format: "list",
    focus: focusNode,
    items,
  };
}