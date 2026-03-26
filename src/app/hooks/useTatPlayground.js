import { useEffect, useMemo, useState } from "react";
import {
  applyTatAction,
  createTatRuntimeSession,
  inspectTatRuntimeSession,
  setTatFocus,
} from "@tat";

function normalizeGraphProjection(rawGraph) {
  if (!rawGraph) return null;

  return {
    format: "graph",
    focus: rawGraph.focus ?? rawGraph.root ?? null,
    root: rawGraph.root ?? null,
    nodes: rawGraph.nodes ?? [],
    edges: rawGraph.edges ?? [],
    state: rawGraph.state ?? {},
    meta: rawGraph.meta ?? {},
    history: rawGraph.history ?? [],
  };
}

function normalizeMenuProjection(rawMenu) {
  if (!rawMenu) return null;

  return {
    format: "menu",
    focus: rawMenu.focus ?? null,
    items: rawMenu.items ?? [],
  };
}

function normalizeTraceProjection(rawTrace) {
  if (!rawTrace) return null;

  return {
    format: "trace",
    focus: rawTrace.focus ?? null,
    steps: rawTrace.steps ?? rawTrace.events ?? [],
  };
}

function normalizeTimelineProjection(rawTimeline) {
  if (!rawTimeline) return null;

  return {
    format: "timeline",
    focus: rawTimeline.focus ?? null,
    events: rawTimeline.events ?? [],
  };
}

function normalizeTreeProjection(rawTree) {
  if (!rawTree) return null;

  return {
    format: "tree",
    focus: rawTree.focus ?? null,
    tree: rawTree.tree ?? null,
  };
}

function normalizeDetailProjection(rawDetail) {
  if (!rawDetail) return null;

  return {
    format: "detail",
    focus: rawDetail.focus ?? null,
    node: rawDetail.node ?? null,
  };
}

function normalizeSummaryProjection(rawSummary) {
  if (!rawSummary) return null;

  return {
    format: "summary",
    focus: rawSummary.focus ?? null,
    data: rawSummary.data ?? {},
  };
}

function normalizeListProjection(rawList) {
  if (!rawList) return null;

  return {
    format: "list",
    focus: rawList.focus ?? null,
    items: rawList.items ?? [],
  };
}

function createSessionResult(sourceCode) {
  try {
    return {
      ok: true,
      session: createTatRuntimeSession(sourceCode),
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      session: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const projectionNormalizers = {
  graph: normalizeGraphProjection,
  menu: normalizeMenuProjection,
  trace: normalizeTraceProjection,
  timeline: normalizeTimelineProjection,
  detail: normalizeDetailProjection,
  summary: normalizeSummaryProjection,
  list: normalizeListProjection,
  tree: normalizeTreeProjection,
};

function normalizeProjectionSet(projectionBindings, debug) {
  const graphs = debug.graphs ?? {};
  const projections = debug.projections ?? {};

  function getProjection(bindingName) {
    if (!bindingName) return null;
    return projections[bindingName] ?? graphs[bindingName] ?? null;
  }

  return Object.fromEntries(
    Object.entries(projectionNormalizers).map(([projectionKey, normalize]) => {
      const bindingName = projectionBindings[projectionKey];
      const rawProjection = getProjection(bindingName);
      return [projectionKey, normalize(rawProjection)];
    }),
  );
}

export function useTatPlayground(
  sourceCode,
  projectionBindings = {},
) {
  const [runtimeState, setRuntimeState] = useState(() =>
    createSessionResult(sourceCode),
  );

  useEffect(() => {
    setRuntimeState(createSessionResult(sourceCode));
  }, [sourceCode]);

  const executionResult = useMemo(() => {
    if (!runtimeState.ok || !runtimeState.session) {
      return {
        ok: false,
        data: null,
        error: runtimeState.error,
      };
    }

    try {
      return {
        ok: true,
        data: inspectTatRuntimeSession(runtimeState.session),
        error: null,
      };
    } catch (error) {
      return {
        ok: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [runtimeState]);

  const debug = executionResult.data?.debug ?? {};
  const graphs = debug.graphs ?? {};
  const projections = normalizeProjectionSet(projectionBindings, debug);

  function interact(actionRequest) {
    setRuntimeState((current) => {
      if (!current.ok || !current.session) {
        return current;
      }

      try {
        return {
          ok: true,
          session: applyTatAction(current.session, actionRequest),
          error: null,
        };
      } catch (error) {
        return {
          ok: false,
          session: current.session,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });
  }

  function setFocus(graphBinding, nodeId) {
    setRuntimeState((current) => {
      if (!current.ok || !current.session) {
        return current;
      }

      try {
        return {
          ok: true,
          session: setTatFocus(current.session, { graphBinding, nodeId }),
          error: null,
        };
      } catch (error) {
        return {
          ok: false,
          session: current.session,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });
  }

  return {
    sourceCode,
    projections,
    graphs,
    validation: executionResult.data?.validation ?? [],
    ast: executionResult.data?.printedAst ?? "",
    tokens: executionResult.data?.tokens ?? [],
    executionResult,
    debug,
    interact,
    setFocus,
  };
}
