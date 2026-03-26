import {
  clearApplyHistory,
  deriveFocusNodeId,
  deriveRootNodeId,
  sourceDefinesNode,
} from "../utils/feature-utils";

function resolveSelectedNodeId(sourceCode, selectedNodeId) {
  if (sourceDefinesNode(sourceCode, selectedNodeId)) {
    return selectedNodeId;
  }

  return deriveFocusNodeId(sourceCode) || deriveRootNodeId(sourceCode) || "";
}

export function createRuntimeFeature({
  id,
  label,
  graphBinding,
  initialSource,
  projectionBindings,
  tabs,
}) {
  return {
    id,
    label,
    graphBinding,
    initialSource,
    tabs,
    projectionBindings,

    getInitialSelectedNodeId(source = initialSource) {
      return deriveFocusNodeId(source) || deriveRootNodeId(source);
    },

    onScenarioLoad(source) {
      return {
        nextSourceCode: source,
        nextDraftSource: source,
        nextSelectedNodeId: deriveFocusNodeId(source) || deriveRootNodeId(source),
        nextActiveProjection: "graph",
      };
    },

    onRunSource({ draftSource, selectedNodeId }) {
      return {
        nextSourceCode: draftSource,
        nextDraftSource: draftSource,
        nextSelectedNodeId: resolveSelectedNodeId(draftSource, selectedNodeId),
        nextActiveProjection: "graph",
      };
    },

    onClearHistory({ draftSource, selectedNodeId }) {
      const cleanedSource = clearApplyHistory(draftSource);

      return {
        nextSourceCode: cleanedSource,
        nextDraftSource: cleanedSource,
        nextSelectedNodeId: resolveSelectedNodeId(cleanedSource, selectedNodeId),
        nextActiveProjection: "graph",
      };
    },

    onSelectNode(_state, nodeId) {
      return {
        nextSelectedNodeId: nodeId,
        nextActiveProjection: "detail",
      };
    },

    onSelectMenuItem({ selectedNodeId }, item) {
      if (!selectedNodeId) return null;

      return {
        nextSelectedNodeId: item.target.id,
        nextActiveProjection: "graph",
        runtimeAction: {
          graphBinding,
          from: selectedNodeId,
          action: item.action.id,
          target: item.target.id,
        },
      };
    },
  };
}
