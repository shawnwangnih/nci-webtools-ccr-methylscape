import { Row, Col } from 'react-bootstrap';
import { ColumnChart, PieChart } from 'react-chartkick';
import { useRecoilValue } from 'recoil';
import { selectedRow } from './projects.state';
import 'chartkick/chart.js';

export default function Summary() {
  const { selectedProject, methylationClasses, gender, ageDistribution } =
    useRecoilValue(selectedRow);

  return (
    <div>
      {selectedProject && (
        <>
          <Row className="mb-5">
            <Col className="text-center">
              <h4>Project Summary: {selectedProject}</h4>
            </Col>
          </Row>
          <Row className="text-center">
            <Col md="4" sm="12">
              <h5 className="mb-3">Methylation Classes</h5>
              <PieChart
                height="300px"
                data={[...methylationClasses]}
                // legend={false}
              />
            </Col>
            <Col md="4" sm="12">
              <h5 className="mb-3">Gender</h5>
              <PieChart
                height="300px"
                data={[...gender]}
                //   legend={false}
              />
            </Col>
            <Col md="4" sm="12">
              <h5 className="mb-3">Age Distribution</h5>
              <ColumnChart height="300px" data={[...ageDistribution]} />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
