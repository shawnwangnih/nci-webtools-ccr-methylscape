import {
  useRecoilValue,
  useSetRecoilState,
  useRecoilCallback,
  useRecoilState,
} from 'recoil';
import cloneDeep from 'lodash/cloneDeep';
import { plotState, selectedPoints } from './metadata-plot.state';
import { copyNumberState } from '../copyNumber/copyNumber.state';
import { tableForm } from '../table/table.state';
import Plot from 'react-plotly.js';

export default function MetadataPlot({ onSelect }) {
  let { data, layout, config } = useRecoilValue(plotState);
  const setCnState = useSetRecoilState(copyNumberState);
  // const setSelectedPoints = useSetRecoilState(selectedPoints);
  const [_, setSelectedPoints] = useRecoilState(selectedPoints);
  // const { selectedGroup } = useRecoilValue(tableForm);

  const selectedGroup = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const state = snapshot.getLoadable(tableForm).contents.selectedGroup;
        return state;
      },
    []
  );

  function handleSelect(e) {
    if (e) {
      setSelectedPoints((state) => ({
        ...state,
        points: { ...state.points, [selectedGroup()]: e.points },
      }));
    }
  }

  function handleClick(e) {
    if (e) {
      setCnState((state) => ({
        ...state,
        idatFile: e.points[0].customdata.idatFile,
      }));
    }
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
