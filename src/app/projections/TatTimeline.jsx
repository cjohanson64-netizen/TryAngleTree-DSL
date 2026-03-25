export default function TatTimeline({ data }) {
  if (!data || data.format !== "timeline") return null;

  const events = data.events ?? [];

  return (
    <section className="tat-timeline">
      <h3 className="tat-projection-title">Timeline</h3>

      {events.length === 0 ? (
        <p className="tat-timeline-empty">No timeline events yet.</p>
      ) : (
        <ol className="tat-timeline-list">
          {events.map((event) => (
            <li key={event.id} className="tat-timeline-item">
              <div className="tat-timeline-marker">
                <span className="tat-timeline-step">{event.step}</span>
              </div>

              <div className="tat-timeline-card">
                <div className="tat-timeline-event">{event.event}</div>
                <div className="tat-timeline-label">{event.label}</div>

                {event.target?.label && (
                  <div className="tat-timeline-target">
                    Target: {event.target.label}
                  </div>
                )}

                {event.status && (
                  <div className="tat-timeline-status">
                    Status: {event.status}
                  </div>
                )}

                <code className="tat-timeline-raw">{event.raw}</code>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}