import { projectionRegistry } from "../registry/projectionRegistry";

export default function RenderedProjectionPanel({
  data,
  onMenuSelect,
  onSelectNode,
  selectedNodeId,
}) {
  if (!data) {
    return (
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Rendered Projection</h2>
        </div>
        <div className="panel-empty">No projection available for this format yet.</div>
      </section>
    );
  }

  const ProjectionComponent = projectionRegistry[data.format];

  if (!ProjectionComponent) {
    return (
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Rendered Projection</h2>
        </div>
        <div className="panel-empty">
          No renderer yet for <strong>{data.format}</strong>.
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Rendered Projection</h2>
      </div>

      <div className="panel-body">
        <ProjectionComponent
          data={data}
          onSelect={onMenuSelect}
          onSelectNode={onSelectNode}
          selectedNodeId={selectedNodeId}
        />
      </div>
    </section>
  );
}
