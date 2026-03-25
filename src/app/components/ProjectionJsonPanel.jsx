export default function ProjectionJsonPanel({ data }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Projection JSON</h2>
      </div>

      <pre className="panel-code">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </section>
  );
}