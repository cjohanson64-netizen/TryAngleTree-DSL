export default function TatTrace({ data }) {
  if (!data || data.format !== "trace") return null;

  const steps = data.steps ?? [];

  return (
    <section className="tat-trace">
      <h3 className="tat-projection-title">Trace</h3>

      {steps.length === 0 ? (
        <p className="tat-trace-empty">No actions yet.</p>
      ) : (
        <ol className="tat-trace-list">
          {steps.map((step) => (
            <li key={step.id} className="tat-trace-item">
              <div className="tat-trace-step">#{step.step}</div>

              <div className="tat-trace-content">
                <div className="tat-trace-label">{step.label}</div>
                <code className="tat-trace-raw">{step.raw}</code>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}