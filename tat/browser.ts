import { printAST } from "./ast/printAST";
import { tokenize, type Token } from "./lexer/tokenize";
import { parse, ParseError } from "./parser/parse";
import type { ProgramNode } from "./ast/nodeTypes";
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
} from "./runtime/executeProgram";
import { graphToDebugObject } from "./runtime/graph";
import { validateProgram, type ValidationIssue } from "./runtime/validateProgram";

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
    graphInteractions: Record<string, unknown>;
    interactionHistory: unknown[];
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
  return parse(tokenizeTat(source));
}

export function printTatAst(source: string): string {
  return printAST(parseTatToAst(source));
}

export function parseTat(source: string): TatParseResult {
  const tokens = tokenizeTat(source);
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
  return inspectTatRuntimeSession(createTatRuntimeSession(source));
}

export function createTatRuntimeSession(source: string): TatRuntimeSession {
  const parsed = parseTat(source);
  const validation = validateProgram(parsed.ast);
  const errors = validation.filter((issue) => issue.severity === "error");

  if (errors.length > 0) {
    const message = errors
      .map((issue) =>
        issue.span?.line && issue.span?.column
          ? `${issue.message} at ${issue.span.line}:${issue.span.column}`
          : issue.message,
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
  const execution = { state: session.state };
  const currentProjections = reprojectRuntimeState(session.ast, session.state, options);
  const graphs: Record<string, ReturnType<typeof graphToDebugObject>> = {};

  for (const [name, graph] of session.state.graphs.entries()) {
    graphs[name] = graphToDebugObject(graph);
  }

  const projections: Record<string, unknown> = {};
  for (const [name, projection] of currentProjections.entries()) {
    projections[name] = structuredCloneSafe(projection);
  }

  const graphInteractions: Record<string, unknown> = {};
  for (const [name, interaction] of session.state.graphInteractions.entries()) {
    graphInteractions[name] = structuredCloneSafe(interaction);
  }

  const interactionHistory = structuredCloneSafe(session.state.interactionHistory);
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
      projections,
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

function structuredCloneSafe<T>(value: T): T {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

export {
  ParseError,
  tokenize,
  parse,
  printAST,
  executeProgram,
  graphToDebugObject,
  validateProgram,
};
export type { RuntimeApplyActionRequest, RuntimeFocusRequest, RuntimeProjectionOptions };
