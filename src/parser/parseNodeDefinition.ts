import type { Token } from "../lexer/tokens/types.js";
import type { NodeDefinitionNode, ObjectMemberNode } from "../ast/nodes.js";
import type { SourceSpan } from "../diagnostics/sourceSpan.js";
import { parseObjectMembers, type ObjectParser } from "./parseObject.js";

export interface NodeDefinitionParser extends ObjectParser {
  consume(type: "NodeBodyStart" | "NodeBodyEnd", message: string): Token;
  spanFrom(startInput: Token | SourceSpan | undefined, endInput: Token | SourceSpan | undefined): SourceSpan;
}

export function parseNodeDefinition(parser: NodeDefinitionParser): NodeDefinitionNode {
  const start = parser.consume("NodeBodyStart", "Expected '<{' to start node definition.");
  const body = parseNodeDefinitionBody(parser, start);
  const end = parser.consume("NodeBodyEnd", "Expected '}>' after node definition body.");

  return {
    kind: "NodeDefinition",
    body: {
      kind: "Object",
      entries: body,
      source: parser.spanFrom(start, end),
    },
    source: parser.spanFrom(start, end),
  };
}

export function parseNodeDefinitionBody(
  parser: NodeDefinitionParser,
  start: Token,
): ObjectMemberNode[] {
  return parseObjectMembers(parser, "NodeBodyEnd", start);
}
