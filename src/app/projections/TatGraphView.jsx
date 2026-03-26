function getNodeLabel(node) {
  return node?.value?.name ?? node?.meta?.label ?? node?.id ?? "";
}

export default function TatGraphView({ data, onSelectNode, selectedNodeId }) {
  if (!data || data.format !== "graph") return null;

  const sortedNodes = [...(data?.nodes ?? [])].sort(
    (a, b) => (a.meta?.order ?? 999) - (b.meta?.order ?? 999),
  );
  const edges = data.edges ?? [];

  return (
    <section className="tat-graph-view">
      <h3 className="tat-projection-title">Graph Slice</h3>

      <h4 className="tat-subtitle">Nodes</h4>
      <div className="tat-node-list">
        {sortedNodes.map((node) => {
          const isSelected = node.id === selectedNodeId;

          return (
            <button
              key={node.id}
              type="button"
              className={`tat-node-row ${isSelected ? "is-selected" : ""}`}
              onClick={() => onSelectNode?.(node.id)}
            >
              <span className="tat-node-row-label">{getNodeLabel(node)}</span>
              <span className="tat-node-row-id">{node.id}</span>
            </button>
          );
        })}
      </div>

      <h4 className="tat-subtitle">Edges</h4>
      <pre className="tat-pre">{JSON.stringify(edges, null, 2)}</pre>
    </section>
  );
}
