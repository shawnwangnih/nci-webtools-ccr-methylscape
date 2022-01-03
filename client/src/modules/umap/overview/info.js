import { PieChart, Building, CloudArrowDown } from 'react-bootstrap-icons';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Plot from 'react-plotly.js';
import { useRecoilValue } from 'recoil';
import { overviewState } from './overview.state';

export default function Info() {
  let { samples, studies, institutions } = useRecoilValue(overviewState);

  return (
    <div>
      <Row>
        <Col sm="4">
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
              <CloudArrowDown color="white" size="3rem" />
            </div>
            <div className="w-100 my-auto text-center">
              <div className="fw-light">NUMBER OF STUDIES</div>
              <b>{samples}</b>
            </div>
          </Card>
          <Card bg="light" className="d-flex flex-row">
            <div className="bg-dark p-2">
              <Building color="white" size="3rem" />
            </div>
            <div className="w-100 my-auto text-center">
              <div className="fw-light">NUMBER OF INSTITUTIONS</div>
              <b>{samples}</b>
            </div>
          </Card>
        </Col>
        <Col sm="8"></Col>
      </Row>
    </div>
  );
}
