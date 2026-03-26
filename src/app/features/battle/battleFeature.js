import battleDemoSource from "./tat/battle-demo.tat?raw";
import { createRuntimeFeature } from "../createRuntimeFeature";

const tabs = [
  "graph",
  "detail",
  "menu",
  "summary",
  "list",
  "tree",
  "timeline",
  "trace",
];

const projectionBindings = {
  graph: "battleGraph",
  detail: "battleDetail",
  menu: "battleMenu",
  summary: "battleSummary",
  list: "battleList",
  tree: "battleTree",
  trace: "battleTrace",
  timeline: "battleTimeline",
};

export const battleFeature = createRuntimeFeature({
  id: "battle",
  label: "Battle Demo",
  graphBinding: "battle",
  initialSource: battleDemoSource,
  tabs,
  projectionBindings,
});
