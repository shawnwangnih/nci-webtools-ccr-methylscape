import { PieChart, Building, ClipboardData } from 'react-bootstrap-icons';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Plot from 'react-plotly.js';
import { useRecoilValue } from 'recoil';
import { overviewState } from './overview.state';
import cloneDeep from 'lodash/cloneDeep';

export default function Info() {
  let { samples, studies, institutions, plot } = useRecoilValue(overviewState);
  const { data, layout, config } = plot;

  return (
    <div>
      <Row>
        <Col sm="4" className="my-auto">
          <Card bg="light" className="d-flex flex-row">
            <div className="bg-primary p-2">
              <PieChart color="white" size="3rem" />
            </div>
            <div className="w-100 my-auto text-center">
              <div className="fw-light">TOTAL SAMPLES</div>
              <b>{samples}</b>
            </div>
          </Card>
          <Card bg="light" className="d-flex flex-row">
            <div className="p-2" style={{ background: 'rebeccapurple' }}>
              <ClipboardData color="white" size="3rem" />
            </div>
            <div className="w-100 my-auto text-center">
              <div className="fw-light">NUMBER OF STUDIES</div>
              <b>{studies}</b>
            </div>
          </Card>
          <Card bg="light" className="d-flex flex-row">
            <div className="bg-dark p-2">
              <Building color="white" size="3rem" />
            </div>
            <div className="w-100 my-auto text-center">
              <div className="fw-light">NUMBER OF INSTITUTIONS</div>
              <b>{institutions}</b>
            </div>
          </Card>
        </Col>
        <Col sm="8">
          <Plot
            data={[...data]}
            layout={cloneDeep(layout)}
            config={cloneDeep(config)}
            className="w-100"
            // style={{ height: '600px' }}
            useResizeHandler
          />
        </Col>
      </Row>
    </div>
  );
}
