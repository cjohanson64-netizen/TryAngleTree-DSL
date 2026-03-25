export default function SourcePanel({
  draftSource,
  onChangeDraft,
  onRunSource,
  onResetSource,
  onClearHistory,
}) {
  return (
    <section className="panel">
      <div className="panel-header panel-header-row">
        <h2 className="panel-title">TAT Source</h2>

        <div className="panel-actions">
          <button
            type="button"
            className="panel-action-button"
            onClick={onRunSource}
          >
            Run
          </button>

          <button
            type="button"
            className="panel-action-button"
            onClick={onClearHistory}
          >
            Clear History
          </button>

          <button
            type="button"
            className="panel-action-button"
            onClick={onResetSource}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="panel-body">
        <textarea
          className="source-editor"
          value={draftSource}
          onChange={(event) => onChangeDraft(event.target.value)}
          spellCheck={false}
          aria-label="TAT source editor"
        />
      </div>
    </section>
  );
}
