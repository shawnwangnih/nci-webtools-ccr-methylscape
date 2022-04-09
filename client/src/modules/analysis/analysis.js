import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';
import {
  Fullscreen,
  FullscreenExit,
  BoxArrowUpRight,
} from 'react-bootstrap-icons';
import Overview from './overview/overview';
import SampleQuality from './sampleQuality/sampleQuality';
import CopyNumber from './copyNumber/copyNumber';
import PromoterMethylation from './promoterMethylation/promoterMethylation';
import CohortAnalysis from './cohortAnalysis/cohortAnalysis';
import Survival from './survival/survival';
import Table from './table/table';
import SubgroupAnalysis from './subgroupAnalysis/subgroupAnalysis';
import Methodology from './methodology/methodology';
import Metadata from './metadata/metadata';

export default function Analysis() {
  const [expand, setExpand] = useState(false);

  function handleSelect(event) {
    console.log(event);
  }

  return (
    <Container fluid>
      <Row>
        <Col xl={expand ? 12 : 6} className="my-4">
          <Card className="h-100">
            <Card.Body>
              <Metadata onSelect={handleSelect} />
              <div className="d-flex justify-content-between p-1">
                <Button
                  size="sm"
                  variant="link"
                  title="Open in new tab"
                  aria-label="Open Metadata in new tab"
                  href="#/metadata"
                  target="_blank"
                >
                  <BoxArrowUpRight /> View Metadata
                </Button>
                <Button
                  id="expandLayout"
                  className="rounded-circle"
                  aria-label="Expand"
                  onClick={() => setExpand(!expand)}
                >
                  {expand ? <FullscreenExit /> : <Fullscreen />}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={expand ? 12 : 6} className="my-4">
          <Card className="h-100">
            <Tabs defaultActiveKey="overview" className="mb-3">
              <Tab eventKey="overview" title="Overview">
                <Overview className="px-3" />
              </Tab>
              {/* <Tab eventKey="sampleQuality" title="QC">
                <SampleQuality className="px-3" />
              </Tab> */}
              <Tab eventKey="copyNumber" title="Copy number">
                <CopyNumber className="px-3" />
              </Tab>
              <Tab eventKey="Table" title="Table">
                <Table className="px-3" />
              </Tab>
              {/* <Tab eventKey="promoterMethylation" title="MGMT/MLH1">
                <PromoterMethylation className="px-3" />
              </Tab>
              <Tab eventKey="cohortAnalysis" title="Cohort analysis">
                <CohortAnalysis className="px-3" />
              </Tab>
              <Tab eventKey="survival" title="Survival">
                <Survival className="px-3" />
              </Tab>
              <Tab eventKey="subgroupAnalysis" title="Subgroup analysis">
                <SubgroupAnalysis className="px-3" />
              </Tab>
              <Tab eventKey="methodology" title="Methodology">
                <Methodology className="px-3" />
              </Tab> */}
            </Tabs>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
