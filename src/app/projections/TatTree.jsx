function getNodeLabel(node) {
  if (!node) return "Unknown";
  return node.value?.name ?? node.meta?.label ?? node.label ?? node.id ?? "Unknown";
}

function getNodeType(node) {
  if (!node) return null;
  return node.value?.type ?? node.type ?? null;
}

function getNodeStatus(node) {
  if (!node) return null;
  return node.meta?.status ?? node.meta?.result ?? node.status ?? null;
}

function TreeNode({ node, depth = 0 }) {
  return (
    <li className="tat-tree-node">
      <div className="tat-tree-node-row" style={{ paddingLeft: `${depth * 16}px` }}>
        <span className="tat-tree-node-label">{getNodeLabel(node)}</span>

        {getNodeType(node) && (
          <span className="tat-tree-node-type">{getNodeType(node)}</span>
        )}

        {getNodeStatus(node) && (
          <span className="tat-tree-node-status">{getNodeStatus(node)}</span>
        )}
      </div>

      {node.children?.length > 0 && (
        <ul className="tat-tree-children">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TatTree({ data }) {
  if (!data || data.format !== "tree") return null;

  const tree = data.tree ?? null;

  if (!tree) {
    return <p className="tat-tree-empty">No tree data available.</p>;
  }

  return (
    <section className="tat-tree">
      <h3 className="tat-projection-title">Tree</h3>

      <ul className="tat-tree-root">
        <TreeNode node={tree} />
      </ul>
    </section>
  );
}