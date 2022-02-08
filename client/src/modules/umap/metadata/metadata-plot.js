import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import cloneDeep from 'lodash/cloneDeep';
import { plotState } from './metadata-plot.state';
import { copyNumberState } from '../copyNumber/copyNumber.state';
import { selectedPoints } from '../table/table.state';
import Plot from 'react-plotly.js';

export default function MetadataPlot({ onSelect }) {
  let { data, layout, config } = useRecoilValue(plotState);
  const setCnState = useSetRecoilState(copyNumberState);
  // const setSelectedPoints = useSetRecoilState(selectedPoints);
  const [tableState, setSelectedPoints] = useRecoilState(selectedPoints);

  // function handleSelect(e) {
  //   if (e)
  //     setSelectedPoints((state) => ({
  //       ...state,
  //       points: { ...state.points, [state.selectedGroup]: e.points },
  //     }));
  // }
  function handleSelect(e) {
    if (e) {
      console.log(e);
      setSelectedPoints({
        ...tableState,
        points: { ...tableState.points, [tableState.selectedGroup]: e.points },
      });
    }
  }

  function handleClick(e) {
    const point = e.points[0];
    setCnState((state) => ({
      ...state,
      idatFile: point.customdata.idatFile,
    }));
  }

  return (
    <Plot
      data={cloneDeep(data)}
      className="w-100"
      style={{ height: '800px' }}
      layout={cloneDeep(layout)}
      config={cloneDeep(config)}
      onClick={handleClick}
      onSelected={handleSelect}
      useResizeHandler
    />
  );
}
