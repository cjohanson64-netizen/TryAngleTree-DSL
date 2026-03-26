import type { ProgramNode } from "../ast/nodeTypes";
import { printAST } from "../ast/printAST";
import { tokenize, type Token } from "../lexer/tokenize";
import { parse, ParseError } from "../parser/parse";
import {
  applyRuntimeAction,
  executeProgram,
  reprojectRuntimeState,
  setRuntimeFocus,
  type ExecuteProgramResult,
  type RuntimeApplyActionRequest,
  type RuntimeFocusRequest,
  type RuntimeProjectionOptions,
  type RuntimeState,
} from "./executeProgram";
import { graphToDebugObject } from "./graph";
import { validateProgram, type ValidationIssue } from "./validateProgram";
import { executeTatModule as executeTatModuleInternal } from "./executeModule";
import {
  executeGraphInteraction,
  graphInteractionFromAst,
  type GraphInteraction,
  type GraphInteractionHistoryEntry,
  type GraphWorkspace,
  type InteractionLogEntry,
} from "./executeGraphInteraction";

export interface TatParseResult {
  source: string;
  tokens: Token[];
  ast: ProgramNode;
  printedAst: string;
}

export interface TatExecuteResult extends TatParseResult {
  validation: ValidationIssue[];
  execution: ExecuteProgramResult;
  debug: {
    graphs: Record<string, ReturnType<typeof graphToDebugObject>>;
    projections: Record<string, unknown>;
    graphInteractions: Record<string, GraphInteraction>;
    interactionHistory: GraphInteractionHistoryEntry[];
    systemRelations: ExecuteProgramResult["state"]["systemRelations"];
    queryResults: ExecuteProgramResult["state"]["queryResults"];
    bindings: {
      values: Record<string, unknown>;
      nodes: Record<string, ReturnType<typeof graphToDebugObject>["nodes"][number]>;
    };
  };
}

export interface TatRuntimeSession extends TatParseResult {
  validation: ValidationIssue[];
  state: RuntimeState;
}

export function tokenizeTat(source: string): Token[] {
  return tokenize(source);
}

export function parseTatToAst(source: string): ProgramNode {
  const tokens = tokenize(source);
  return parse(tokens);
}

export function printTatAst(source: string): string {
  const tokens = tokenize(source);
  const ast = parse(tokens);
  return printAST(ast);
}

export function parseTat(source: string): TatParseResult {
  const tokens = tokenize(source);
  const ast = parse(tokens);
  const printedAst = printAST(ast);

  return {
    source,
    tokens,
    ast,
    printedAst,
  };
}

export function executeTat(source: string): TatExecuteResult {
  const session = createTatRuntimeSession(source);
  return inspectTatRuntimeSession(session);
}

export function createTatRuntimeSession(source: string): TatRuntimeSession {
  const parsed = parseTat(source);
  const validation = validateProgram(parsed.ast);

  const errors = validation.filter((issue: ValidationIssue) => issue.severity === "error");

  if (errors.length > 0) {
    const message = errors
      .map((issue: ValidationIssue) =>
        issue.span?.line && issue.span?.column
          ? `${issue.message} at ${issue.span.line}:${issue.span.column}`
          : issue.message
      )
      .join("\n");

    throw new Error(`Validation failed:\n${message}`);
  }

  const execution = executeProgram(parsed.ast);

  return {
    ...parsed,
    validation,
    state: execution.state,
  };
}

export function inspectTatRuntimeSession(
  session: TatRuntimeSession,
  options?: RuntimeProjectionOptions,
): TatExecuteResult {
  const projections = reprojectRuntimeState(session.ast, session.state, options);
  const execution = { state: session.state };

  const graphs: Record<string, ReturnType<typeof graphToDebugObject>> = {};
  for (const [name, graph] of session.state.graphs.entries()) {
    graphs[name] = graphToDebugObject(graph);
  }

  const projectionDebug: Record<string, unknown> = {};
  for (const [name, projection] of projections.entries()) {
    projectionDebug[name] = structuredCloneSafe(projection);
  }

  const graphInteractions: Record<string, GraphInteraction> = {};
  for (const [name, interaction] of session.state.graphInteractions.entries()) {
    graphInteractions[name] = structuredCloneSafe(interaction);
  }

  const interactionHistory = structuredCloneSafe(
    session.state.interactionHistory,
  );

  const values: Record<string, unknown> = {};
  for (const [name, value] of session.state.bindings.values.entries()) {
    values[name] = structuredCloneSafe(value);
  }

  const nodes: Record<string, ReturnType<typeof graphToDebugObject>["nodes"][number]> = {};
  for (const [name, node] of session.state.bindings.nodes.entries()) {
    nodes[name] = {
      id: node.id,
      value: structuredCloneSafe(node.value),
      state: structuredCloneSafe(node.state),
      meta: structuredCloneSafe(node.meta),
    };
  }

  return {
    ...session,
    execution,
    debug: {
      graphs,
      projections: projectionDebug,
      graphInteractions,
      interactionHistory,
      systemRelations: session.state.systemRelations,
      queryResults: session.state.queryResults,
      bindings: {
        values,
        nodes,
      },
    },
  };
}

export function applyTatAction(
  session: TatRuntimeSession,
  request: RuntimeApplyActionRequest,
  options?: RuntimeProjectionOptions,
): TatRuntimeSession {
  return {
    ...session,
    state: applyRuntimeAction(session.ast, session.state, request, options),
  };
}

export function setTatFocus(
  session: TatRuntimeSession,
  request: RuntimeFocusRequest,
): TatRuntimeSession {
  return {
    ...session,
    state: setRuntimeFocus(session.ast, session.state, request),
  };
}

export function executeTatModule(entryPath: string): ReturnType<typeof executeTatModuleInternal> {
  return executeTatModuleInternal(entryPath);
}

function structuredCloneSafe<T>(value: T): T {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

export type { Token, ProgramNode, ExecuteProgramResult };
export {
  ParseError,
  tokenize,
  parse,
  printAST,
  executeProgram,
  executeGraphInteraction,
  graphInteractionFromAst,
};
export type {
  GraphInteraction,
  GraphInteractionHistoryEntry,
  GraphWorkspace,
  InteractionLogEntry,
  RuntimeApplyActionRequest,
  RuntimeFocusRequest,
  RuntimeProjectionOptions,
  RuntimeState,
};
