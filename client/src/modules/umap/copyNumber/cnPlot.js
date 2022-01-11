import { useRecoilValue } from 'recoil';
import { plotState } from './copyNumber.state';
import Plot from 'react-plotly.js';
import cloneDeep from 'lodash/cloneDeep';

export default function CopyNumberPlot() {
  const { data, config, layout, error } = useRecoilValue(plotState);

  return error ? (
    error
  ) : (
    <Plot
      data={cloneDeep(data)}
      layout={cloneDeep(layout)}
      config={cloneDeep(config)}
      className="w-100"
      useResizeHandler
    />
  );
}
