export default function FeatureSelect({ options, value, onChange }) {
  return (
    <label className="feature-select-shell">
      <span className="feature-select-label">Feature</span>

      <select
        className="feature-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}