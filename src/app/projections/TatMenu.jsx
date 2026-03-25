function getNodeLabel(node) {
  if (!node) return "Unknown";
  return node.value?.name ?? node.meta?.label ?? node.id ?? "Unknown";
}

export default function TatMenu({ data, onSelect }) {
  if (!data || data.format !== "menu") return null;

  return (
    <section className="tat-menu">
      <h3 className="tat-projection-title">
        Actions for {getNodeLabel(data.focus)}
      </h3>

      <div className="tat-menu-items">
        {data.items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="tat-menu-item"
            onClick={() => onSelect(item)}
            disabled={item.status === "disabled" || item.status === "blocked"}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}