// run-module.ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runV3Source } from "./src/runtime";

function printUsage() {
  console.log(`
Usage:
  npx tsx run-module.ts <path-to-file.tat>

Example:
  npx tsx run-module.ts src/tests/fixtures/v3/all-directives.tat
`);
}

function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    printUsage();
    process.exit(1);
  }

  const absolutePath = resolve(process.cwd(), filePath);
  const source = readFileSync(absolutePath, "utf8");

  const result = runV3Source(source, {
    currentFile: absolutePath,
  });

  console.log("\nTAT module run result");
  console.log("=====================\n");

  console.log("Status:", result.status);

  if (result.diagnostics?.length) {
    console.log("\nDiagnostics:");
    for (const diagnostic of result.diagnostics) {
      console.log("-", diagnostic.message ?? JSON.stringify(diagnostic));
    }
  }

  if (result.graphs && Object.keys(result.graphs).length > 0) {
    console.log("\nGraphs:");

    for (const [graphName, graph] of Object.entries(result.graphs)) {
      console.log(`\n## ${graphName}`);
      console.log("Root:", graph.root);

      console.log("\nNodes:");
      for (const node of Object.values(graph.nodes)) {
        console.log(`- ${node.id}`);
      }

      console.log("\nEdges:");
      for (const edge of Object.values(graph.edges)) {
        if (edge.explicit) {
          const relation = edge.relation ?? "relatedTo";
          console.log(`- { ${edge.from} : ${relation} : ${edge.to} }`);
        } else {
          console.log(`- { ${edge.from} :: ${edge.to} }`);
        }
      }

      console.log("\nState:");
      console.log(JSON.stringify(graph.state, null, 2));

      console.log("\nMeta:");
      console.log(JSON.stringify(graph.meta, null, 2));
    }
  }

  if (result.projections && Object.keys(result.projections).length > 0) {
    console.log("\nProjections:");
    console.log(JSON.stringify(result.projections, null, 2));
  }

  if (result.exports && Object.keys(result.exports).length > 0) {
    console.log("\nExports:");
    console.log(Object.keys(result.exports).join(", "));
  }

  if (result.events?.length) {
    console.log("\nEvents:");
    console.log(JSON.stringify(result.events, null, 2));
  }
}

main();
