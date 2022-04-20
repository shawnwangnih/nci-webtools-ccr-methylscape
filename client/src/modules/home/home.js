import { useRecoilValue } from 'recoil';
import { NavLink } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import HomeImage from './images/home.svg';
import { sessionState } from '../session/session.state';
import './home.scss';
import backgroundImage from './images/Main_Graphic.png';
import { Tabs, Tab } from 'react-bootstrap';

//import Session from './session/session';

export default function Home() {
  const session = useRecoilValue(sessionState);

  return (
    <>
      {/* <div
        className="cover-image py-5 mb-4 shadow-sm"
        style={{ backgroundImage: `url(${HomeImage})` }}
      >
        <Container>
          <h1 className="display-4 mb-4">
            <span className="d-inline-block py-4 border-bottom border-dark">
              Methylscape
            </span>
          </h1>

          <p className="lead">Application Description</p>
          {session.authenticated && (
            <NavLink className="btn btn-outline-primary" to="analysis">
              Perform Analysis
            </NavLink>
          )}
        </Container>
      </div> */}

      {/* <div className="h-100"> */}
      <div
        className="text-white img-fluid homepage-img-bg bg-image"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <Row md={2}>
          <Col md={1}></Col>
          <Col
            md
            lg={{ span: 3, offset: 1 }}
            sm={{ span: 0, offser: 0 }}
            className="py-9 text-end"
          >
            <h1 className="homepage-title">Methylscape</h1>
            <h2 className="homepage-title-small">Analysis</h2>
            <p className="py-4 lead">
              Explore the clinically-reportable assay that uses genome-wide DNA
              methylation profiling as a diagnostic tool for tumores of the
              central nervous system.
            </p>
            {session.authenticated && (
              <a href="/#/analysis">
                <Button
                  variant="outline-light"
                  size="lg"
                  className="btn-home px-5 py-3"
                >
                  Perform Analysis
                </Button>
              </a>
            )}
          </Col>
        </Row>
      </div>
      {/* </div> */}
    </>
  );
}
