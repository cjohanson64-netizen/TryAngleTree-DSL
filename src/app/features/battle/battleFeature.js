import battleDemoSource from "./tat/battle-demo.tat?raw";
import { deriveDetailFromGraph } from "../../utils/derive/deriveDetailFromGraph";
import { deriveSummaryFromGraph } from "../../utils/derive/deriveSummaryFromGraph";
import { deriveListFromGraph } from "../../utils/derive/deriveListFromGraph";
import {
  appendApplyStep,
  clearApplyHistory,
  deriveFocusNodeId,
  deriveRootNodeId,
  replaceFocus,
  sourceDefinesNode,
} from "../../utils/feature-utils";

const tabs = [
  "menu",
  "detail",
  "summary",
  "list",
  "tree",
  "timeline",
  "trace",
  "graph",
];

const projectionBindings = {
  graph: "battleGraph",
  menu: "battleMenu",
  tree: "battleTree",
  trace: "battleTrace",
  timeline: "battleTimeline",
};

export const battleFeature = {
  id: "battle",
  label: "Battle Demo",
  initialSource: battleDemoSource,
  tabs,
  projectionBindings,

  deriveProjections({ selectedNodeId, projections }) {
    return {
      ...projections,
      detail: deriveDetailFromGraph(projections.graph, selectedNodeId),
      summary: deriveSummaryFromGraph(projections.graph, selectedNodeId),
      list: deriveListFromGraph(projections.graph, selectedNodeId),
    };
  },

  getInitialSelectedNodeId(source = battleDemoSource) {
    return deriveRootNodeId(source);
  },

  onScenarioLoad(source) {
    const rootId = deriveRootNodeId(source);

    return {
      nextSourceCode: source,
      nextDraftSource: source,
      nextSelectedNodeId: rootId,
      nextActiveProjection: "graph",
    };
  },

  onRunSource({ draftSource, selectedNodeId }) {
    const currentFocusId = sourceDefinesNode(draftSource, selectedNodeId)
      ? selectedNodeId
      : deriveFocusNodeId(draftSource) || deriveRootNodeId(draftSource) || "";

    const focusedSource = currentFocusId
      ? replaceFocus(draftSource, currentFocusId)
      : draftSource;

    return {
      nextSelectedNodeId: currentFocusId,
      nextDraftSource: focusedSource,
      nextSourceCode: focusedSource,
      nextActiveProjection: "graph",
    };
  },

  onClearHistory({ draftSource, selectedNodeId }) {
    const cleanedSource = clearApplyHistory(draftSource);
    const safeFocusId = sourceDefinesNode(cleanedSource, selectedNodeId)
      ? selectedNodeId
      : deriveFocusNodeId(cleanedSource) ||
        deriveRootNodeId(cleanedSource) ||
        "";

    const focusedSource = safeFocusId
      ? replaceFocus(cleanedSource, safeFocusId)
      : cleanedSource;

    return {
      nextSelectedNodeId: safeFocusId,
      nextDraftSource: focusedSource,
      nextSourceCode: focusedSource,
      nextActiveProjection: "graph",
    };
  },

  onSelectNode({ draftSource }, nodeId) {
    const focusedSource = replaceFocus(draftSource, nodeId);

    return {
      nextSelectedNodeId: nodeId,
      nextDraftSource: focusedSource,
      nextSourceCode: focusedSource,
      nextActiveProjection: "detail",
    };
  },

  onSelectMenuItem({ draftSource, selectedNodeId }, item) {
    const focusId = sourceDefinesNode(draftSource, selectedNodeId)
      ? selectedNodeId
      : deriveFocusNodeId(draftSource) || deriveRootNodeId(draftSource) || "";

    if (!focusId) return null;

    const applyStep = `@apply(<${focusId}.${item.action.id}.${item.target.id}>)`;
    const nextSource = appendApplyStep(
      replaceFocus(draftSource, focusId),
      applyStep,
    );
    const focusedSource = replaceFocus(nextSource, item.target.id);

    return {
      nextDraftSource: focusedSource,
      nextSourceCode: focusedSource,
      nextSelectedNodeId: item.target.id,
      nextActiveProjection: "graph",
    };
  },
};
