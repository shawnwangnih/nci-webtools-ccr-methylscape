import { useRecoilValue } from 'recoil';
import cloneDeep from 'lodash/cloneDeep';
import { plotState } from './metadata-plot.state';
import Plot from 'react-plotly.js';

export default function MetadataPlot({ onSelect }) {
  let { data, layout, config } = useRecoilValue(plotState);

  return (
    <Plot
      data={cloneDeep(data)}
      className="w-100"
      style={{ height: '800px' }}
      layout={cloneDeep(layout)}
      config={cloneDeep(config)}
      useResizeHandler
    />
  );
}
