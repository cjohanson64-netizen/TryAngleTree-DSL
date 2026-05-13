import type {
  BindingNode,
  DirectiveNode,
  FlowBodyNode,
  FlowNode,
  LiteralNode,
  NodeDefinitionNode,
  RelationshipNode,
  TatNode,
} from "../ast/nodes.js";
import type { V3Diagnostic } from "../validator/validationEngine.js";

export type V3RuntimeDiagnostic = V3Diagnostic;

export type V3PrimitiveValue = string | number | boolean | null;

export interface V3NodeDefinitionValue {
  type: "nodeDefinition";
  id: string;
  data: Record<string, unknown>;
  node: NodeDefinitionNode;
}

export interface V3EdgeDefinitionValue {
  type: "edgeDefinition";
  id: string;
  from: string;
  relation?: string;
  to: string;
  explicit: boolean;
  node: RelationshipNode;
}

export interface V3ConstructorValue {
  type: "constructor";
  constructorKind: "action" | "projection";
  name: string;
  params: string[];
  body?: DirectiveNode["body"];
  node: DirectiveNode;
}

export interface V3PrimitiveRuntimeValue {
  type: "primitive";
  value: V3PrimitiveValue;
  node: TatNode;
}

export interface V3UnknownRuntimeValue {
  type: "unknown";
  node: TatNode;
}

export interface V3ReadRuntimeValue {
  type: "read";
  value: unknown;
  node: TatNode;
}

export interface V3FlowResult {
  graph: string;
  events: V3RuntimeEvent[];
  projections?: Record<string, unknown>;
}

export interface V3FlowRuntimeValue {
  type: "flowResult";
  value: V3FlowResult;
  node: FlowNode;
}

export interface V3NodeInstance {
  id: string;
  data: Record<string, unknown>;
}

export interface V3EdgeInstance {
  id: string;
  from: string;
  relation?: string;
  to: string;
  explicit: boolean;
}

export interface V3MutationChange {
  path: string;
  from?: unknown;
  to?: unknown;
  operation: "add" | "remove" | "update";
}

export interface V3RuntimeEvent {
  type: string;
  graph?: string;
  root?: string;
  hook?: string;
  file?: string;
  generatedTat?: string;
  diagnostics?: {
    parse: "success" | "error";
    validation: "success" | "error";
    errors: unknown[];
  };
  executedSteps?: V3RuntimeEvent[];
  operator?: string;
  passed?: boolean;
  name?: string;
  args?: unknown[];
  projection?: string;
  directive?: "graft" | "prune" | "update" | string;
  domain?: string;
  changes?: V3MutationChange[];
  iterations?: number;
  limit?: number;
  stoppedBy?: "times" | "while" | "none";
  event?: string;
  activated?: boolean;
  detail?: Record<string, unknown>;
}

export interface V3GraphInstance {
  type: "graph";
  id: string;
  root: string;
  nodes: Record<string, V3NodeInstance>;
  edges: Record<string, V3EdgeInstance>;
  state: Record<string, Record<string, unknown>>;
  meta: Record<string, Record<string, unknown>>;
  localBindings: Record<string, V3RuntimeValue>;
  relationships: unknown[];
  history: V3RuntimeEvent[];
}

export type V3RuntimeValue =
  | V3NodeDefinitionValue
  | V3EdgeDefinitionValue
  | V3ConstructorValue
  | V3PrimitiveRuntimeValue
  | V3ReadRuntimeValue
  | V3FlowRuntimeValue
  | V3GraphInstance
  | V3UnknownRuntimeValue;

export type V3RuntimeBindings = Record<string, V3RuntimeValue>;

export interface V3RuntimeResult {
  status: "success" | "error";
  bindings: V3RuntimeBindings;
  graphs: Record<string, V3GraphInstance>;
  projections: Record<string, unknown>;
  events: V3RuntimeEvent[];
  diagnostics: V3RuntimeDiagnostic[];
  exports: V3RuntimeBindings;
}

export interface V3RuntimeContext {
  bindings: V3RuntimeBindings;
  graphs: Record<string, V3GraphInstance>;
  projections: Record<string, unknown>;
  events: V3RuntimeEvent[];
  diagnostics: V3RuntimeDiagnostic[];
  options?: V3RuntimeOptions;
  whenListeners?: V3WhenListener[];
  triggerDepth?: number;
  exports?: V3RuntimeBindings;
}

export type V3RuntimeBindingNode = BindingNode;

export interface V3InjectionContext {
  graph: V3GraphInstance;
  root: string;
  nodes: V3GraphInstance["nodes"];
  edges: V3GraphInstance["edges"];
  state: V3GraphInstance["state"];
  meta: V3GraphInstance["meta"];
  bindings: V3RuntimeBindings;
}

export interface V3InjectionHook {
  fileName: string;
  run: (ctx: V3InjectionContext) => string;
}

export type V3InjectionRegistry = Record<string, V3InjectionHook>;

export interface V3RuntimeOptions {
  injections?: V3InjectionRegistry;
  maxTriggerDepth?: number;
  moduleResolver?: V3ModuleResolver;
  currentFile?: string;
  moduleCache?: Map<string, V3RuntimeResult>;
  importStack?: string[];
}

export interface V3WhenListener {
  event: string;
  condition?: TatNode;
  doBody?: FlowBodyNode;
  node: DirectiveNode;
}

export interface V3ModuleResolver {
  readModule: (filePath: string, fromFile?: string) => string;
  resolvePath?: (importPath: string, fromFile?: string) => string;
}
