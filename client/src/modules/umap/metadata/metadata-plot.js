import { useRecoilValue, useRecoilState } from 'recoil';
import cloneDeep from 'lodash/cloneDeep';
import { plotState } from './metadata-plot.state';
import { copyNumberState } from '../copyNumber/copyNumber.state';
import { tableState } from '../table/table.state';
import Plot from 'react-plotly.js';

export default function MetadataPlot({ onSelect }) {
  let { data, layout, config } = useRecoilValue(plotState);
  const [cnState, setCnState] = useRecoilState(copyNumberState);
  const [umapTableState, setTableState] = useRecoilState(tableState);

  return (
    <Plot
      data={cloneDeep(data)}
      className="w-100"
      style={{ height: '800px' }}
      layout={cloneDeep(layout)}
      config={cloneDeep(config)}
      onClick={(e) => {
        const point = e.points[0];
        setCnState({ ...cnState, idatFile: point.customdata.idatFile });
      }}
      onSelected={(e) => {
        setTableState({ points: e.points });
      }}
      useResizeHandler
    />
  );
}
