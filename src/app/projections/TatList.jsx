function getNodeLabel(item) {
  if (!item) return "Unknown";
  return item.value?.name ?? item.meta?.label ?? item.label ?? item.id ?? "Unknown";
}

function getNodeType(item) {
  if (!item) return null;
  return item.value?.type ?? item.type ?? null;
}

function getNodeStatus(item) {
  if (!item) return null;
  return item.meta?.status ?? item.meta?.result ?? item.status ?? null;
}

export default function TatList({ data }) {
  if (!data || data.format !== "list") return null;

  const items = data.items ?? [];

  return (
    <section className="tat-list">
      <h3 className="tat-projection-title">List</h3>

      {items.length === 0 ? (
        <p className="tat-list-empty">No items available.</p>
      ) : (
        <ul className="tat-list-items">
          {items.map((item) => (
            <li key={item.id} className="tat-list-item">
              <div className="tat-list-item-main">
                <span className="tat-list-item-label">{getNodeLabel(item)}</span>

                {getNodeType(item) && (
                  <span className="tat-list-item-type">{getNodeType(item)}</span>
                )}

                {getNodeStatus(item) && (
                  <span className="tat-list-item-status">{getNodeStatus(item)}</span>
                )}
              </div>

              <code className="tat-list-item-id">{item.id}</code>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}