import { useMemo, useState } from "react";
import ProjectionTabs from "./components/ProjectionTabs";
import SourcePanel from "./components/SourcePanel";
import ProjectionJsonPanel from "./components/ProjectionJsonPanel";
import RenderedProjectionPanel from "./components/RenderedProjectionPanel";
import FeatureSelect from "./components/FeatureSelect";
import { useTatPlayground } from "./hooks/useTatPlayground";
import { applyFeatureUpdate } from "./utils/feature-utils";
import {
  featureRegistry,
  featureOptions,
  defaultFeatureId,
} from "./registry/featureRegistry";
import "./styles/playground.css";

export default function PlaygroundPage() {
  const [selectedFeatureId, setSelectedFeatureId] = useState(defaultFeatureId);

  const feature = featureRegistry[selectedFeatureId];

  const [activeProjection, setActiveProjection] = useState("graph");
  const [sourceCode, setSourceCode] = useState(feature.initialSource);
  const [draftSource, setDraftSource] = useState(feature.initialSource);
  const [selectedNodeId, setSelectedNodeId] = useState(
    feature.getInitialSelectedNodeId(feature.initialSource),
  );

  const { projections, executionResult } = useTatPlayground(
    sourceCode,
    feature.projectionBindings,
  );

  const displayProjections = useMemo(
    () =>
      feature.deriveProjections({
        sourceCode,
        draftSource,
        selectedNodeId,
        projections,
        executionResult,
      }),
    [
      feature,
      sourceCode,
      draftSource,
      selectedNodeId,
      projections,
      executionResult,
    ],
  );

  const activeData = useMemo(
    () => displayProjections[activeProjection] ?? null,
    [displayProjections, activeProjection],
  );

  function commitFeatureUpdate(update) {
    applyFeatureUpdate(
      {
        setSourceCode,
        setDraftSource,
        setSelectedNodeId,
        setActiveProjection,
      },
      update,
    );
  }

  function handleFeatureChange(nextFeatureId) {
    const nextFeature = featureRegistry[nextFeatureId];
    if (!nextFeature) return;

    setSelectedFeatureId(nextFeatureId);

    const update = nextFeature.onScenarioLoad(nextFeature.initialSource);

    setSourceCode(
      Object.prototype.hasOwnProperty.call(update, "nextSourceCode")
        ? update.nextSourceCode
        : nextFeature.initialSource,
    );

    setDraftSource(
      Object.prototype.hasOwnProperty.call(update, "nextDraftSource")
        ? update.nextDraftSource
        : nextFeature.initialSource,
    );

    setSelectedNodeId(
      Object.prototype.hasOwnProperty.call(update, "nextSelectedNodeId")
        ? update.nextSelectedNodeId
        : nextFeature.getInitialSelectedNodeId(nextFeature.initialSource),
    );

    setActiveProjection(
      Object.prototype.hasOwnProperty.call(update, "nextActiveProjection")
        ? update.nextActiveProjection
        : "graph",
    );
  }

  function handleResetSource() {
    commitFeatureUpdate(feature.onScenarioLoad(feature.initialSource));
  }

  function handleRunSource() {
    commitFeatureUpdate(
      feature.onRunSource({
        sourceCode,
        draftSource,
        selectedNodeId,
        projections: displayProjections,
      }),
    );
  }

  function handleClearHistory() {
    commitFeatureUpdate(
      feature.onClearHistory({
        sourceCode,
        draftSource,
        selectedNodeId,
        projections: displayProjections,
      }),
    );
  }

  function handleSelectNode(nodeId) {
    commitFeatureUpdate(
      feature.onSelectNode(
        {
          sourceCode,
          draftSource,
          selectedNodeId,
          projections: displayProjections,
        },
        nodeId,
      ),
    );
  }

  function handleMenuSelect(item) {
    commitFeatureUpdate(
      feature.onSelectMenuItem(
        {
          sourceCode,
          draftSource,
          selectedNodeId,
          projections: displayProjections,
        },
        item,
      ),
    );
  }

  return (
    <main className="playground-page">
      <header className="playground-header">
        <h1 className="playground-title">TAT Projection Playground</h1>
        <p className="playground-subtitle">{feature.label}</p>

        <section className="playground-toolbar">
          <FeatureSelect
            options={featureOptions}
            value={selectedFeatureId}
            onChange={handleFeatureChange}
          />
        </section>
      </header>

      {!executionResult.ok && (
        <section className="playground-error">
          <strong>TAT Execution Error</strong>
          <pre>{executionResult.error}</pre>
        </section>
      )}

      <ProjectionTabs
        tabs={feature.tabs}
        activeTab={activeProjection}
        onChange={setActiveProjection}
      />

      <section className="playground-grid">
        <SourcePanel
          draftSource={draftSource}
          onChangeDraft={setDraftSource}
          onRunSource={handleRunSource}
          onResetSource={handleResetSource}
          onClearHistory={handleClearHistory}
        />

        <ProjectionJsonPanel data={activeData} />

        <RenderedProjectionPanel
          data={activeData}
          onMenuSelect={handleMenuSelect}
          onSelectNode={handleSelectNode}
          selectedNodeId={selectedNodeId}
        />
      </section>
    </main>
  );
}
