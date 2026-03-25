export function deriveRootNodeId(sourceCode) {
  const match = sourceCode.match(/root:\s*([A-Za-z0-9_]+)/);
  return match ? match[1] : "";
}

export function deriveFocusNodeId(sourceCode) {
  const match = sourceCode.match(/focus:\s*([A-Za-z0-9_]+)/);
  return match ? match[1] : "";
}

export function sourceDefinesNode(sourceCode, nodeId) {
  if (!nodeId) return false;

  const pattern = new RegExp(`\\b${nodeId}\\s*=\\s*<\\{`);
  return pattern.test(sourceCode);
}

export function replaceFocus(sourceCode, focusNodeId) {
  if (!focusNodeId) return sourceCode;

  return sourceCode.replace(
    /focus:\s*[A-Za-z0-9_]+/g,
    `focus: ${focusNodeId}`,
  );
}

export function appendApplyStep(sourceCode, applyStep) {
  const featureBlockPattern =
    /([A-Za-z0-9_]+\s*:=\s*@seed[\s\S]*?)(\n\n[a-zA-Z0-9_]+\s*:=|\n\n[a-zA-Z0-9_]+\s*=|$)/;

  const match = sourceCode.match(featureBlockPattern);
  if (!match) return sourceCode;

  const featureBlock = match[1];
  const nextBlockStart = match[2] ?? "";
  const updatedFeatureBlock = `${featureBlock}\n  -> ${applyStep}`;

  return sourceCode.replace(
    featureBlockPattern,
    `${updatedFeatureBlock}${nextBlockStart}`,
  );
}

export function clearApplyHistory(sourceCode) {
  return sourceCode
    .split("\n")
    .filter((line) => !line.includes("@apply(<"))
    .join("\n");
}

export function applyFeatureUpdate(setters, update) {
  if (!update) return;

  const {
    setSourceCode,
    setDraftSource,
    setSelectedNodeId,
    setActiveProjection,
  } = setters;

  if (Object.prototype.hasOwnProperty.call(update, "nextSourceCode")) {
    setSourceCode(update.nextSourceCode);
  }

  if (Object.prototype.hasOwnProperty.call(update, "nextDraftSource")) {
    setDraftSource(update.nextDraftSource);
  }

  if (Object.prototype.hasOwnProperty.call(update, "nextSelectedNodeId")) {
    setSelectedNodeId(update.nextSelectedNodeId);
  }

  if (Object.prototype.hasOwnProperty.call(update, "nextActiveProjection")) {
    setActiveProjection(update.nextActiveProjection);
  }
}
