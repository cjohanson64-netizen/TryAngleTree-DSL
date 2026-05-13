import type { BindingNode, IdentifierNode, LiteralNode, PathNode, TatNode } from "../../ast/nodes.js";
import {
  createEdgeDefinitionValue,
  createNodeDefinitionValue,
} from "../graphInstance.js";
import type { V3PrimitiveValue, V3RuntimeValue } from "../context.js";

export function evaluateTopLevelBinding(binding: BindingNode): V3RuntimeValue {
  const value = binding.value;

  if (value.kind === "NodeDefinition") {
    return createNodeDefinitionValue(binding.name.name, value);
  }

  if (value.kind === "Relationship" && value.relationshipKind === "edge") {
    return createEdgeDefinitionValue(binding.name.name, value);
  }

  if (value.kind === "Directive" && (value.name === "action" || value.name === "project")) {
    return {
      type: "constructor",
      constructorKind: value.name === "action" ? "action" : "projection",
      name: binding.name.name,
      params: value.args.map((arg) => referenceValue(arg)).filter((name): name is string => Boolean(name)),
      body: value.body,
      node: value,
    };
  }

  if (value.kind === "Literal") {
    return {
      type: "primitive",
      value: literalValue(value),
      node: value,
    };
  }

  return {
    type: "unknown",
    node: value,
  };
}

function referenceValue(node: TatNode | IdentifierNode | PathNode | undefined): string | undefined {
  if (!node) return undefined;
  if (node.kind === "Identifier") return node.name;
  if (node.kind === "Path") return node.parts.map((part) => part.name).join(".");
  if (node.kind === "Literal") return valueToString(node);
  return undefined;
}

function literalValue(node: LiteralNode): V3PrimitiveValue {
  return node.value;
}

function valueToString(node: IdentifierNode | LiteralNode): string | undefined {
  if (node.kind === "Identifier") return node.name;
  const value = literalValue(node);
  return value === null ? undefined : String(value);
}
