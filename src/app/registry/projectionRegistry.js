import TatMenu from "../projections/TatMenu";
import TatDetail from "../projections/TatDetail";
import TatSummary from "../projections/TatSummary";
import TatGraphView from "../projections/TatGraphView";
import TatTrace from "../projections/TatTrace";
import TatTree from "../projections/TatTree";
import TatList from "../projections/TatList";
import TatTimeline from "../projections/TatTimeline";

export const projectionRegistry = {
  menu: TatMenu,
  detail: TatDetail,
  summary: TatSummary,
  graph: TatGraphView,
  trace: TatTrace,
  tree: TatTree,
  list: TatList,
  timeline: TatTimeline,
};
