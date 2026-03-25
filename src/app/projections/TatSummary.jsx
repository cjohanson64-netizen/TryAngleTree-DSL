function getNodeLabel(node) {
  if (!node) return "Unknown";
  return node.value?.name ?? node.meta?.label ?? node.id ?? "Unknown";
}

export default function TatSummary({ data }) {
  if (!data || data.format !== "summary") return null;

  const focus = data.focus ?? null;
  const summary = data.data ?? {};

  return (
    <section className="tat-summary">
      <h3 className="tat-projection-title">{getNodeLabel(focus)}</h3>

      {summary.status && (
        <p className="tat-summary-status">
          <strong>Status:</strong> {summary.status}
        </p>
      )}

      {summary.actions?.length > 0 && (
        <>
          <h4 className="tat-subtitle">Available Actions</h4>
          <ul className="tat-summary-actions">
            {summary.actions.map((action) => (
              <li key={action.id}>{action.label}</li>
            ))}
          </ul>
        </>
      )}

      {summary.actions?.length === 0 && (
        <p className="tat-summary-empty">No available actions.</p>
      )}
    </section>
  );
}