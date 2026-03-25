function getNodeLabel(node) {
  if (!node) return "Unknown";
  return node.value?.name ?? node.meta?.label ?? node.id ?? "Unknown";
}

export default function TatDetail({ data }) {
  if (!data || data.format !== "detail") return null;

  const focus = data.focus ?? data.node ?? null;
  const node = data.node ?? focus ?? null;

  if (!node) {
    return <p className="tat-detail-empty">No detail data available.</p>;
  }

  return (
    <section className="tat-detail">
      <h3 className="tat-projection-title">{getNodeLabel(focus)}</h3>

      <dl className="tat-detail-list">
        <div>
          <dt>ID</dt>
          <dd>{node.id}</dd>
        </div>

        {node.value?.type && (
          <div>
            <dt>Type</dt>
            <dd>{node.value.type}</dd>
          </div>
        )}

        {node.meta?.status && (
          <div>
            <dt>Status</dt>
            <dd>{node.meta.status}</dd>
          </div>
        )}

        {!node.meta?.status && node.meta?.result && (
          <div>
            <dt>Result</dt>
            <dd>{node.meta.result}</dd>
          </div>
        )}
      </dl>

      <h4 className="tat-subtitle">Value</h4>
      <pre className="tat-pre">{JSON.stringify(node.value ?? {}, null, 2)}</pre>

      <h4 className="tat-subtitle">State</h4>
      <pre className="tat-pre">{JSON.stringify(node.state ?? {}, null, 2)}</pre>

      <h4 className="tat-subtitle">Meta</h4>
      <pre className="tat-pre">{JSON.stringify(node.meta ?? {}, null, 2)}</pre>

      {node.actions?.length > 0 && (
        <>
          <h4 className="tat-subtitle">Actions</h4>
          <pre className="tat-pre">{JSON.stringify(node.actions, null, 2)}</pre>
        </>
      )}

      {node.relationships?.length > 0 && (
        <>
          <h4 className="tat-subtitle">Relationships</h4>
          <pre className="tat-pre">
            {JSON.stringify(node.relationships, null, 2)}
          </pre>
        </>
      )}
    </section>
  );
}