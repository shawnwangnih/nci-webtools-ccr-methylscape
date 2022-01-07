import { useRecoilState, useRecoilValue } from 'recoil';
import { copynumberState, plotState } from './copyNumber.state';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Plot from 'react-plotly.js';
import cloneDeep from 'lodash/cloneDeep';

export default function CopyNumber() {
  const { data, config, layout } = useRecoilValue(plotState);
  console.log(data);
  console.log(layout);

  return (
    <div className="px-3">
      <b>Genome-wide Copy Number</b>
      <p>
        To view sample-level quality control metrics, click on a point in the
        embedding (please allow approximately 4-5 seconds for the data to be
        displayed after clicking a sample). The summary data and plots are
        generated during functional normalization of the methylation signal
        intensities. It is important to assess both sample and probe quality
        prior to interpretatin of a case.
      </p>
      <Plot
        data={[...data]}
        layout={cloneDeep(layout)}
        config={cloneDeep(config)}
        className="w-100"
        useResizeHandler
      />
    </div>
  );
}
