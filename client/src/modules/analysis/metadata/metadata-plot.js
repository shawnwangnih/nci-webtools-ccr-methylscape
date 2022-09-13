import { useRecoilValue, useSetRecoilState, useRecoilCallback } from "recoil";
import cloneDeep from "lodash/cloneDeep";
import { plotState, selectedPoints } from "./metadata-plot.state";
import { analysisState } from "../analysis.state";
import { selectSampleState } from "../copyNumber/copyNumber.state";
import { tableForm } from "../table/table.state";
import Plot from "react-plotly.js";

export default function MatdataPlot() {
  let { data, layout, config } = useRecoilValue(plotState);
  const setSelectedPoints = useSetRecoilState(selectedPoints);
  const setTabs = useSetRecoilState(analysisState);
  const setSample = useSetRecoilState(selectSampleState);

  const selectedGroup = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const { group } = snapshot.getLoadable(tableForm).contents;
        return group;
      },
    []
  );

  function handleSelect(e) {
    if (e) {
      setSelectedPoints((state) => {
        let points = state.points.slice();
        points[selectedGroup()] = e.points;
        return {
          ...state,
          points,
        };
      });
      setTabs((state) => {
        const { currentTab } = state;
        if (currentTab != "table" && currentTab != "survival") {
          return { ...state, currentTab: "table" };
        } else {
          return state;
        }
      });
    }
  }

  function handleClick(e) {
    if (e) {
      setSample((state) => ({
        ...state,
        idatFilename: e.points[0].customdata.idatFilename,
        sample: e.points[0].customdata.sample,
      }));
      setTabs((state) => {
        const { currentTab } = state;
        if (currentTab != "copyNumber") {
          return { ...state, currentTab: "copyNumber" };
        } else {
          return state;
        }
      });
    }
  }

  return (
    <Plot
      data={cloneDeep(data)}
      className="w-100"
      style={{ height: "800px" }}
      layout={cloneDeep(layout)}
      config={cloneDeep(config)}
      onClick={handleClick}
      onSelected={handleSelect}
      useResizeHandler
    />
  );
}
