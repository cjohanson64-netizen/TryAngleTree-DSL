export default function ProjectionTabs({ tabs, activeTab, onChange }) {
  return (
    <nav className="projection-tabs" aria-label="Projection formats">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={`projection-tab ${tab === activeTab ? "is-active" : ""}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}