import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { plotState, selectBinState } from './copyNumber.state';
import Plot from 'react-plotly.js';
import cloneDeep from 'lodash/cloneDeep';
import { plot } from 'plotly.js';

export default function CopyNumberPlot() {
  const { data, config, layout, error } = useRecoilValue(plotState);
  const [state, setState] = useState({
    x: '',
    y: '',
    genes: [],
  });

  function handleClick(e) {
    if (e) {
      setState({
        location: e.points[0].x,
        ratio: e.points[0].y,
        genes: e.points[0].customdata.genes,
      });
    }
  }

  return (
    <div>
      {error ? (
        error
      ) : !data || !data.length ? (
        <div className="d-flex bg-light" style={{ minHeight: '300px' }}>
          <p className="mx-auto my-auto">
            Please select a sample in the UMAP plot
          </p>
        </div>
      ) : (
        <div>
          <Plot
            data={cloneDeep(data)}
            layout={cloneDeep({
              ...layout,
              uirevision: layout.uirevision + state.x,
            })}
            config={cloneDeep(config)}
            className="w-100"
            useResizeHandler
            style={{ height: '800px' }}
            onClick={handleClick}
          />
          <div>
            <h4>Bin Info</h4>
            <div>Location: {state.location}</div>
            <div>Ratio: {state.ratio}</div>
            <div>
              Genes:{' '}
              <ul>
                {state.genes.map((gene) => (
                  <li>{gene}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
