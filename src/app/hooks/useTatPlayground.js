import { useMemo } from "react";
import { executeTat } from "@tat";

function normalizeGraphProjection(rawGraph) {
  if (!rawGraph) return null;

  return {
    format: "graph",
    focus: rawGraph.root ?? null,
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

export function useTatPlayground(sourceCode, projectionBindings = {}) {
  const result = useMemo(() => {
    try {
      const executed = executeTat(sourceCode);

      return {
        ok: true,
        data: executed,
        error: null,
      };
    } catch (error) {
      return {
        ok: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [sourceCode]);

  const debug = result.data?.debug ?? {};
  const graphs = debug.graphs ?? {};
  const bindings = debug.bindings ?? {};
  const projectionsDebug = debug.projections ?? {};

  const graphKey = projectionBindings.graph;
  const menuKey = projectionBindings.menu;
  const traceKey = projectionBindings.trace;
  const timelineKey = projectionBindings.timeline;
  const treeKey = projectionBindings.tree;

  const rawGraphProjection =
    (graphKey && (graphs[graphKey] ?? bindings[graphKey] ?? projectionsDebug[graphKey])) ??
    null;

  const rawMenuProjection =
    (menuKey && (projectionsDebug[menuKey] ?? bindings[menuKey] ?? graphs[menuKey])) ??
    null;

  const rawTraceProjection =
    (traceKey && (projectionsDebug[traceKey] ?? bindings[traceKey] ?? graphs[traceKey])) ??
    null;

  const rawTimelineProjection =
    (timelineKey &&
      (projectionsDebug[timelineKey] ?? bindings[timelineKey] ?? graphs[timelineKey])) ??
    null;

  const rawTreeProjection =
    (treeKey && (projectionsDebug[treeKey] ?? bindings[treeKey] ?? graphs[treeKey])) ?? null;

  const normalizedGraph = normalizeGraphProjection(rawGraphProjection);

  const projections = {
    graph: normalizedGraph,
    menu: normalizeMenuProjection(rawMenuProjection),
    trace: normalizeTraceProjection(rawTraceProjection),
    timeline: normalizeTimelineProjection(rawTimelineProjection),
    detail: null,
    summary: null,
    list: null,
    tree: normalizeTreeProjection(rawTreeProjection),
  };

  return {
    sourceCode,
    projections,
    graphs,
    validation: result.data?.validation ?? [],
    ast: result.data?.printedAst ?? "",
    tokens: result.data?.tokens ?? [],
    executionResult: result,
    debug,
  };
}
