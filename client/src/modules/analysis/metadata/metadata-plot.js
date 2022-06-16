import { useRecoilValue, useSetRecoilState, useRecoilCallback, useRecoilState } from "recoil";
import cloneDeep from "lodash/cloneDeep";
import { plotState, selectedPoints } from "./metadata-plot.state";
import { selectSampleState } from "../copyNumber/copyNumber.state";
import { tableForm } from "../table/table.state";
import Plot from "react-plotly.js";

export default function MetadataPlot({ onSelect }) {
  let { data, layout, config } = useRecoilValue(plotState);
  const setSample = useSetRecoilState(selectSampleState);
  // const setSelectedPoints = useSetRecoilState(selectedPoints);
  const [_, setSelectedPoints] = useRecoilState(selectedPoints);
  // const { selectedGroup } = useRecoilValue(tableForm);

  const selectedGroup = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const state = snapshot.getLoadable(tableForm).contents.group;
        return state;
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
    }
  }

  function handleClick(e) {
    if (e) {
      setSample((state) => ({
        ...state,
        idatFilename: e.points[0].customdata.idatFilename,
        sample: e.points[0].customdata.sample,
      }));
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
