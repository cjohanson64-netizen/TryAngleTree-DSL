import curriculumDemoSource from "./tat/curriculum-demo.tat?raw";
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
  graph: "curriculumGraph",
  detail: "curriculumDetail",
  menu: "curriculumMenu",
  summary: "curriculumSummary",
  list: "curriculumList",
  tree: "curriculumTree",
  trace: "curriculumTrace",
  timeline: "curriculumTimeline",
};

export const curriculumFeature = createRuntimeFeature({
  id: "curriculum",
  label: "Curriculum Demo",
  graphBinding: "curriculum",
  initialSource: curriculumDemoSource,
  tabs,
  projectionBindings,
});
