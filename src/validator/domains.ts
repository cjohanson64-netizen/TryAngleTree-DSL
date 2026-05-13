export const ACTIVE_DIRECTIVES = new Set([
  "seed",
  "query",
  "derive",
  "compute",
  "graft",
  "prune",
  "update",
  "action",
  "project",
  "inject",
  "repeat",
  "when",
  "traverse",
  "match",
  "who",
  "what",
  "why",
  "how",
]);

export const DOMAIN_DIRECTIVES = new Set(["query", "graft", "prune", "update", "match"]);
export const V3_DOMAINS = ["node", "edge", "state", "meta", "graph", "path", "value"] as const;
export const ALLOWED_DOMAINS: Set<string> = new Set(V3_DOMAINS);
export const MUTATION_DOMAINS = new Set(["node", "edge", "state", "meta", "graph"]);
export const UPDATE_DOMAINS = new Set(["node", "edge", "state", "meta"]);
export const COMPUTE_FUNCTIONS = new Set(["min", "max", "abs", "round", "floor", "ceil", "clamp", "sum", "avg"]);
export const CONDITION_KEYS = new Set(["condition", "when", "if"]);
export const SEED_KEYS = new Set(["node", "edge", "state", "meta", "root"]);
export const TRAVERSE_KEYS = new Set(["from", "to", "through", "depth", "limit", "rules", "return"]);
export const QUERY_FORBIDDEN_DIRECTIVES = new Set([
  "graft",
  "prune",
  "update",
  "inject",
  "seed",
  "action",
  "project",
  "who",
  "what",
  "why",
  "how",
]);
export const PURE_EXPRESSION_FORBIDDEN_DIRECTIVES = new Set([
  "graft",
  "prune",
  "update",
  "inject",
  "seed",
  "action",
  "project",
  "who",
  "what",
  "why",
  "how",
]);
export const SEED_FORBIDDEN_DIRECTIVES = new Set(["inject", "graft", "prune", "update", "action", "project"]);
export const ACTION_FORBIDDEN_DIRECTIVES = new Set(["seed"]);
export const PROJECT_FORBIDDEN_DIRECTIVES = new Set(["graft", "prune", "update", "inject", "seed", "action"]);
export const MUTATION_FLOW_DIRECTIVES = new Set(["graft", "prune", "update", "repeat"]);
export const PROJECTION_FLOW_DIRECTIVES = new Set(["project", "who", "what", "why", "how"]);
export const READ_ONLY_GATE_DIRECTIVES = new Set(["query", "traverse", "match", "derive", "compute"]);
export const EXPLANATION_DIRECTIVES = new Set(["who", "what", "why", "how"]);
export const EXPLANATION_INCLUDES = {
  who: new Set(["actor", "target", "affected"]),
  what: new Set(["actions", "changes"]),
  why: new Set(["queries", "gates", "triggers"]),
  how: new Set(["flow", "actions", "mutations", "injections", "projections"]),
} as const;

export const PLURAL_DOMAIN_SUGGESTIONS = new Map([
  ["nodes", "node"],
  ["edges", "edge"],
  ["states", "state"],
  ["metas", "meta"],
  ["graphs", "graph"],
  ["paths", "path"],
  ["values", "value"],
]);
